import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { XMLParser } from 'fast-xml-parser';
import Anthropic from '@anthropic-ai/sdk';

const s3 = new S3Client({ region: 'us-east-1' });
const polly = new PollyClient({ region: 'us-east-1' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-3-5-haiku-20241022';

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

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role:'user', content: prompt }]
  });

  const parsed = safeJsonParse(res.content[0].text);

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
  // 기사 제목과 내용을 모두 포함
  const articlesText = cluster.articles
    .map((a, i) => `
[기사 ${i + 1}]
제목: ${a.title}
내용: ${a.content.substring(0, 500)}...
`)
    .join('\n');

  const prompt = `
당신은 "어려운 경제 뉴스를 일상 언어로 풀어주는 설명형 팟캐스트 진행자"입니다.

목표:
경제 지식이 거의 없는 일반 사람도 이해할 수 있게,
모든 경제 용어와 현상을 생활 예시 중심으로 설명하세요.

주제: ${cluster.keyword}
요약: ${cluster.summary}

관련 기사 내용:
${articlesText}

대본 작성 방식:

- 경제 용어가 나오면 반드시 바로 풀어서 설명
  예:
  "금리 인상, 쉽게 말하면 은행 이자가 올라서 대출 부담이 커진다는 뜻이에요"

- 숫자나 지표가 나오면 반드시 현실 예시 추가
  예:
  "이건 월급 300만 원 받는 직장인이 매달 10만 원 더 내는 느낌이에요"

- 항상 이렇게 말하듯 설명:
  "쉽게 말하면"
  "예를 들어"
  "우리 일상으로 보면"
  "만약 여러분이라면"

구성:

1. 자연스러운 인사 + 오늘 주제 소개
2. 이 이슈가 왜 중요한지 생활 예시로 설명
3. 기사 내용 하나씩 풀어서 설명
   - 전문 용어 → 생활 언어
   - 정책 → 개인에게 어떤 영향인지
   - 기업 이야기 → 소비자 입장에서 설명
4. 청년 / 직장인 / 자영업자 / 투자자 각각 어떤 영향 있는지
5. 앞으로 우리가 주의해야 할 점 정리
6. 관련된 경제 용어 하나 소개
7. 부드러운 마무리

필수 규칙:

- 최소 2500자 이상
- 실제 말하는 것처럼 구어체
- "여러분", "~거든요", "~잖아요", "~죠" 적극 사용
- 경제 용어는 반드시 풀어서 설명
- 어려운 표현 절대 사용 금지
- 교수처럼 말하지 말 것
- 뉴스 읽듯 말하지 말 것
- 친구에게 설명하듯 말할 것
- 섹션 제목, 번호 절대 쓰지 말 것
- 효과음 관련 내용 절대 쓰지 말 것
- (), [], ** 같은 연출 금지
- 진행자 이름 언급 금지

핵심 철학:

"경제 공부하는 방송"이 아니라  
"경제 뉴스를 같이 이해하는 대화"

위 조건을 지켜서
친절하고 생활 밀착형 대본만 출력하세요.
`;

const res = await anthropic.messages.create({
  model: MODEL,
  max_tokens: 4096,
  temperature: 0.7,
  messages:[{role:'user',content:prompt}]
});

return res.content[0].text.trim();
}

async function generateAudio(script, id) {
try {
  // Polly는 최대 3000자까지 처리 가능
  const maxLength = 2900;
  let audioChunks = [];
  
  // 대본을 3000자 단위로 분할
  if (script.length > maxLength) {
    console.log(`Script too long (${script.length} chars), splitting...`);
    const parts = [];
    for (let i = 0; i < script.length; i += maxLength) {
      parts.push(script.substring(i, i + maxLength));
    }
    
    // 각 부분을 순차적으로 처리
    for (let i = 0; i < parts.length; i++) {
      console.log(`Generating audio part ${i + 1}/${parts.length}`);
      const command = new SynthesizeSpeechCommand({
        Text: parts[i],
        OutputFormat: 'mp3',
        VoiceId: 'Seoyeon',
        Engine: 'neural',
        LanguageCode: 'ko-KR'
      });
      
      const response = await polly.send(command);
      const chunks = [];
      for await (const chunk of response.AudioStream) {
        chunks.push(chunk);
      }
      audioChunks.push(Buffer.concat(chunks));
      
      // Rate limit 방지를 위해 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    // 짧은 대본은 한 번에 처리
    const command = new SynthesizeSpeechCommand({
      Text: script,
      OutputFormat: 'mp3',
      VoiceId: 'Seoyeon',
      Engine: 'neural',
      LanguageCode: 'ko-KR'
    });

    const response = await polly.send(command);
    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    audioChunks.push(Buffer.concat(chunks));
  }
  
  // 모든 오디오 청크를 하나로 합치기
  const audioBuffer = Buffer.concat(audioChunks);
  console.log(`Audio generated: ${audioBuffer.length} bytes`);

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

  // Duration 계산 (대략적으로 한국어 1분에 약 300자)
  const estimatedDuration = Math.floor(script.length / 5);

  const result = {
    audioUrl: audioUrl,
    duration: estimatedDuration
  };
  
  console.log(`Returning audio result:`, JSON.stringify(result));
  
  return result;
} catch (error) {
  console.error('Error generating audio with Polly:', error);
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