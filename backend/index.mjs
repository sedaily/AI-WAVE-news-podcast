import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { XMLParser } from 'fast-xml-parser';

const s3 = new S3Client({ region: 'us-east-1' });
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

// ElevenLabs 설정
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_7f59eb48078438994e86a57f77bc056cadeacc6c9ab0c0fa';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'AW5wrnG1jVizOYY7R1Oo'; // 지원 (여성) - 밝고 예쁜 톤

// 예쁜 목소리 설정
const VOICE_SETTINGS = {
  stability: 0.8,
  similarity_boost: 0.7,
  style: 0.25,
  use_speaker_boost: true
};

// Bedrock Claude 모델 (Claude Haiku 4.5 - Global Inference Profile)
const MODEL_ID = 'global.anthropic.claude-haiku-4-5-20251001-v1:0';

// Bedrock Claude 호출 함수
async function invokeClaudeOnBedrock(prompt, maxTokens = 2000, temperature = 1.0) {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature: temperature,
    messages: [{ role: 'user', content: prompt }]
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
}

const ECONOMY_CODES = ['3134','3137','3138','3139','3140','3141','3143','3145'];

function safeJsonParse(text) {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    return { clusters: [] };
  }
}

async function extractKeywords(articles) {
  const prompt = `
기사 제목:

${articles.map((a,i)=>`${i}. ${a.title}`).join('\n')}

JSON만 출력:
{"clusters":[{"keyword":"키워드","articleIds":[0],"summary":"요약","relatedKeywords":["연관키워드1","연관키워드2"]}]}

각 클러스터의 relatedKeywords에는 해당 키워드와 관련있는 다른 키워드들을 포함하세요.
`;

  const responseText = await invokeClaudeOnBedrock(prompt, 2000);
  const parsed = safeJsonParse(responseText);

  if (!parsed.clusters?.length) {
    return {
      clusters: [{
        keyword:'오늘의 경제',
        articleIds: articles.map((_,i)=>i),
        summary:'오늘 주요 경제 흐름',
        relatedKeywords:[]
      }]
    };
  }

  return parsed;
}

function clusterArticles(articles, clusters) {
  return clusters.clusters.map(c=>({
    keyword:c.keyword,
    summary:c.summary,
    relatedKeywords:c.relatedKeywords||[],
    articles:c.articleIds.map(i=>articles[i]).filter(Boolean)
  }));
}

async function generateScript(cluster) {
  // 기사 제목만 사용 (짧은 대본용)
  const articleTitles = cluster.articles
    .map(a => a.title)
    .join(', ');

  const prompt = `
1분짜리 경제 뉴스 팟캐스트 대본을 작성하세요.

주제: ${cluster.keyword}
요약: ${cluster.summary}
관련 기사: ${articleTitles}

규칙:
- 정확히 250~300자 (1분 분량)
- 구어체로 친근하게
- 핵심만 간결하게

구성:
1. 짧은 인사 (1문장)
2. 오늘의 핵심 뉴스 (2~3문장)
3. 왜 중요한지 (1문장)
4. 마무리 인사 (1문장)

예시:
"안녕하세요, 오늘의 경제 브리핑입니다. 삼성전자가 새로운 AI 칩을 발표했는데요, 이번 칩은 기존보다 성능이 2배 향상됐다고 합니다. 스마트폰 성능이 더 좋아질 전망이에요. 내일 또 만나요!"

대본만 출력하세요:
`;

  const responseText = await invokeClaudeOnBedrock(prompt, 500, 0.7);
  return responseText.trim();
}

async function generateAudio(script, id) {
  try {
    // ElevenLabs는 최대 5000자까지 처리 가능
    const maxLength = 4500;
    let audioChunks = [];

    // 대본을 4500자 단위로 분할
    if (script.length > maxLength) {
      console.log(`Script too long (${script.length} chars), splitting...`);
      const parts = [];
      for (let i = 0; i < script.length; i += maxLength) {
        parts.push(script.substring(i, i + maxLength));
      }

      // 각 부분을 순차적으로 처리
      for (let i = 0; i < parts.length; i++) {
        console.log(`Generating audio part ${i + 1}/${parts.length} with ElevenLabs`);

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: parts[i],
              model_id: 'eleven_multilingual_v2',
              voice_settings: VOICE_SETTINGS
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        audioChunks.push(Buffer.from(arrayBuffer));

        // Rate limit 방지를 위해 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // 짧은 대본은 한 번에 처리
      console.log(`Generating audio with ElevenLabs (${script.length} chars)`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: VOICE_SETTINGS
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      audioChunks.push(Buffer.from(arrayBuffer));
    }

    // 모든 오디오 청크를 하나로 합치기
    const audioBuffer = Buffer.concat(audioChunks);
    console.log(`Audio generated with ElevenLabs: ${audioBuffer.length} bytes`);

    // S3에 업로드
    const key = `podcasts/${id}.mp3`;
    const audioUrl = `https://sedaily-news-xml-storage.s3.amazonaws.com/${key}`;

    await s3.send(new PutObjectCommand({
      Bucket: 'sedaily-news-xml-storage',
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg'
    }));

    console.log(`Audio uploaded to S3: ${key}`);
    console.log(`Audio URL: ${audioUrl}`);

    // MP3 duration 계산 (ElevenLabs 평균 비트레이트 128kbps)
    const bitrate = 128000;
    const durationSeconds = Math.floor((audioBuffer.length * 8) / bitrate);

    console.log(`Calculated duration: ${durationSeconds} seconds`);

    const result = {
      audioUrl: audioUrl,
      duration: durationSeconds
    };

    console.log(`Returning audio result:`, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error('Error generating audio with ElevenLabs:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // 실패 시에도 duration은 반환
    return {
      audioUrl: '',
      duration: Math.floor(script.length / 5)
    };
  }
}

async function fetchArticles(date) {
try {
  const xml = await s3.send(new GetObjectCommand({
    Bucket: 'sedaily-news-xml-storage',
    Key: `daily-xml/${date}.xml`
  }));

  const text = await xml.Body.transformToString();
  const parser = new XMLParser({ignoreAttributes: false, attributeNamePrefix: '@_'});
  const items = parser.parse(text).items?.item || [];

  return items
    .filter(i => ECONOMY_CODES.includes(i.category?.['@_code']))
    .map((i, idx) => ({
      id: `eco-${date}-${idx}`,
      title: i.title || '',
      content: i.content || '',
      image: i.image?.['@_href'] || '',
      date: date
    }));
} catch (error) {
  console.log(`No articles found for ${date}`);
  return [];
}
}

export const handler = async ()=> {
const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10).replace(/-/g,'');

try {
  // 오늘 기사 가져오기
  let articles = await fetchArticles(today);
  console.log(`Today's articles: ${articles.length}`);

  // 오늘 기사가 5개 미만이면 어제 기사 추가
  if (articles.length < 5) {
    const yesterdayArticles = await fetchArticles(yesterday);
    console.log(`Yesterday's articles: ${yesterdayArticles.length}`);
    
    const needed = 10 - articles.length;
    articles = [...articles, ...yesterdayArticles.slice(0, needed)];
    console.log(`Combined articles: ${articles.length}`);
  } else {
    articles = articles.slice(0, 10);
  }

  const clusters=await extractKeywords(articles);
  const grouped=clusterArticles(articles,clusters);

  const podcasts=[];
  
  // 최소 4개, 최대 5개 팟캐스트 생성
  const targetCount = Math.min(Math.max(grouped.length, 4), 5);
  
  for (let i = 0; i < targetCount; i++) {
    const c = grouped[i];
    try {
      const id=`podcast-${today}-${i}`;
      
      console.log(`Processing podcast ${i + 1}/${grouped.length}: ${c.keyword}`);
      
      const script=await generateScript(c);
      console.log(`Script generated: ${script.length} characters`);
      
      // 대본 생성 후 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const audio=await generateAudio(script,id);
      console.log(`Audio result for ${id}:`, JSON.stringify(audio));
      
      if (!audio.audioUrl) {
        console.error(`WARNING: Empty audioUrl for podcast ${i} (${c.keyword})`);
      } else {
        console.log(`SUCCESS: Audio URL set for ${c.keyword}: ${audio.audioUrl}`);
      }
      
      // 오디오 생성 후 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      podcasts.push({...c,id,script,...audio});
    } catch (error) {
      console.error(`Error processing podcast ${i}:`, error);
      console.error(`Error stack:`, error.stack);
      // 에러 발생 시 해당 팟캐스트 스킵
      continue;
    }
  }

  const colors=['#6b9b8e','#8b7ba8','#7ba3c0','#7cb89d','#c08b7b'];

  console.log(`Generated ${podcasts.length} podcasts`);

  // 키워드 간 연관도 계산
  const connections = [];
  podcasts.forEach((p1, i) => {
    podcasts.forEach((p2, j) => {
      if (i < j) {
        // 연관 키워드에 서로 포함되어 있는지 확인
        const isRelated = p1.relatedKeywords?.includes(p2.keyword) || 
                         p2.relatedKeywords?.includes(p1.keyword);
        
        if (isRelated) {
          connections.push({
            source: p1.keyword,
            target: p2.keyword,
            strength: 0.8
          });
        } else {
          // 기사 중복도로 연관도 계산
          const articles1 = new Set(p1.articles.map(a => a.id));
          const articles2 = new Set(p2.articles.map(a => a.id));
          const intersection = [...articles1].filter(id => articles2.has(id)).length;
          const union = new Set([...articles1, ...articles2]).size;
          const similarity = union > 0 ? intersection / union : 0;
          
          if (similarity > 0.1) {
            connections.push({
              source: p1.keyword,
              target: p2.keyword,
              strength: similarity
            });
          }
        }
      }
    });
  });

  const reactData=podcasts.reduce((acc,p,i)=>{
    const key=p.keyword.replace(/\s+/g,'_').toLowerCase();
    const lines=p.script.split('\n').filter(Boolean);

    const totalChars=lines.reduce((s,l)=>s+l.length,0);
    let t=0;

    // 실제 오디오 길이를 사용하여 transcript 타이밍 조정
    const transcript=lines.map(l=>{
      const d=(l.length/totalChars)*p.duration;
      const seg={start:Math.floor(t),end:Math.floor(t+d),text:l};
      t+=d;
      return seg;
    });

    acc[key]={
      keyword:p.keyword,
      title:p.summary,
      duration:p.duration,
      audioUrl:p.audioUrl,
      coverColor:colors[i%colors.length],
      coverImage:p.articles[0]?.image||'',
      relatedKeywords:p.relatedKeywords||[],
      summary:{
        keyPoints:p.articles.slice(0,3).map(a=>a.title),
        stats:[],
        topics:p.articles.map(a=>a.title)
      },
      transcript
    };

    return acc;
  },{});

  // 연결 정보 추가
  reactData._connections = connections;

  await s3.send(new PutObjectCommand({
    Bucket:'sedaily-news-xml-storage',
    Key:`podcasts/data-${today}.json`,
    Body:JSON.stringify(reactData,null,2),
    ContentType:'application/json'
  }));

  return {statusCode:200,body:JSON.stringify(reactData)};

} catch(e) {
  console.error(e);
  return {statusCode:500,body:e.message};
}
};