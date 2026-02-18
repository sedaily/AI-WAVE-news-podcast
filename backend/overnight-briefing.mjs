/**
 * Overnight Briefing Lambda
 *
 * 매일 새벽 6시에 실행되어 오버나이트 브리핑 생성
 * - 한국은행 API: 환율, 금리
 * - Yahoo Finance: 미국 증시
 * - Claude AI: 브리핑 스크립트 생성
 * - AWS Polly: 음성 변환
 */

import Anthropic from '@anthropic-ai/sdk';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const anthropic = new Anthropic();
const polly = new PollyClient({ region: 'ap-northeast-2' });
const s3 = new S3Client({ region: 'ap-northeast-2' });

const BOK_API_KEY = process.env.BOK_API_KEY || 'RMS6EX8U2U97YR3PGXXK';
const S3_BUCKET = process.env.S3_BUCKET || 'news-podcast-audio-bucket';

// 한국은행 API에서 주요 지표 가져오기
async function fetchBOKData() {
  const url = `https://ecos.bok.or.kr/api/KeyStatisticList/${BOK_API_KEY}/json/kr/1/50`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data?.KeyStatisticList?.row || [];

    const result = {
      baseRate: null,
      usdKrw: null,
      jpyKrw: null,
      eurKrw: null,
      cnyKrw: null,
      gdpGrowth: null,
      unemployment: null,
      currentAccount: null,
      bondYield5y: null,
    };

    for (const row of rows) {
      const name = row.KEYSTAT_NAME;
      const value = parseFloat(row.DATA_VALUE);
      const cycle = row.CYCLE;

      if (name.includes('기준금리')) {
        result.baseRate = { value, cycle };
      } else if (name.includes('원/달러')) {
        result.usdKrw = { value, cycle };
      } else if (name.includes('원/엔')) {
        result.jpyKrw = { value, cycle };
      } else if (name.includes('원/유로')) {
        result.eurKrw = { value, cycle };
      } else if (name.includes('원/위안')) {
        result.cnyKrw = { value, cycle };
      } else if (name.includes('경제성장률')) {
        result.gdpGrowth = { value, cycle };
      } else if (name === '실업률') {
        result.unemployment = { value, cycle };
      } else if (name.includes('경상수지')) {
        result.currentAccount = { value, cycle };
      } else if (name.includes('국고채수익률(5년)')) {
        result.bondYield5y = { value, cycle };
      }
    }

    return result;
  } catch (error) {
    console.error('BOK API error:', error);
    return null;
  }
}

// Yahoo Finance에서 미국 증시 데이터 가져오기
async function fetchUSMarketData() {
  const symbols = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^DJI', name: 'Dow Jones' },
    { symbol: 'BTC-USD', name: 'Bitcoin' },
  ];

  const results = {};

  for (const { symbol, name } of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const data = await response.json();

      const quote = data?.chart?.result?.[0];
      if (quote) {
        const closes = quote.indicators?.quote?.[0]?.close || [];
        const prevClose = closes[closes.length - 2] || closes[0];
        const lastClose = closes[closes.length - 1];
        const change = lastClose - prevClose;
        const changePercent = (change / prevClose) * 100;

        results[name] = {
          price: lastClose?.toFixed(2),
          change: change?.toFixed(2),
          changePercent: changePercent?.toFixed(2),
        };
      }
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
    }
  }

  return results;
}

// Claude로 브리핑 스크립트 생성
async function generateBriefingScript(bokData, usMarket) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  const prompt = `당신은 경제 뉴스 앵커입니다. 아래 데이터를 바탕으로 출근길에 듣는 3분 분량의 오버나이트 브리핑 스크립트를 작성해주세요.

## 오늘 날짜
${dateStr}

## 한국 경제 지표 (한국은행)
- 기준금리: ${bokData?.baseRate?.value || 'N/A'}%
- 원/달러 환율: ${bokData?.usdKrw?.value?.toLocaleString() || 'N/A'}원
- 원/엔(100엔): ${bokData?.jpyKrw?.value || 'N/A'}원
- 원/유로: ${bokData?.eurKrw?.value?.toLocaleString() || 'N/A'}원
- 국고채 5년물: ${bokData?.bondYield5y?.value || 'N/A'}%
- 경제성장률(전분기 대비): ${bokData?.gdpGrowth?.value || 'N/A'}%

## 미국 증시 (어젯밤 마감)
- S&P 500: ${usMarket?.['S&P 500']?.price || 'N/A'} (${usMarket?.['S&P 500']?.changePercent > 0 ? '+' : ''}${usMarket?.['S&P 500']?.changePercent || 0}%)
- 나스닥: ${usMarket?.['NASDAQ']?.price || 'N/A'} (${usMarket?.['NASDAQ']?.changePercent > 0 ? '+' : ''}${usMarket?.['NASDAQ']?.changePercent || 0}%)
- 다우존스: ${usMarket?.['Dow Jones']?.price || 'N/A'} (${usMarket?.['Dow Jones']?.changePercent > 0 ? '+' : ''}${usMarket?.['Dow Jones']?.changePercent || 0}%)
- 비트코인: $${usMarket?.['Bitcoin']?.price || 'N/A'} (${usMarket?.['Bitcoin']?.changePercent > 0 ? '+' : ''}${usMarket?.['Bitcoin']?.changePercent || 0}%)

## 작성 지침
1. "좋은 아침입니다"로 시작
2. 친근하고 따뜻한 톤으로 (일본 라디오 느낌)
3. 핵심 숫자만 언급 (너무 많은 숫자 나열 X)
4. 오늘 시장에 미칠 영향 한 줄 코멘트
5. "좋은 하루 되세요"로 마무리
6. 3분 분량 (약 450-500자)

스크립트만 출력하세요.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// Polly로 음성 변환
async function textToSpeech(text, voiceId = 'Seoyeon') {
  const command = new SynthesizeSpeechCommand({
    Engine: 'neural',
    LanguageCode: 'ko-KR',
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: voiceId,
    TextType: 'text',
  });

  try {
    const response = await polly.send(command);
    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Polly error:', error);
    return null;
  }
}

// S3에 저장
async function saveToS3(audioBuffer, script, bokData, usMarket) {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0]; // 2026-02-16

  // 오디오 저장
  const audioKey = `overnight/${dateKey}/briefing.mp3`;
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: audioKey,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  }));

  // 메타데이터 저장
  const metaKey = `overnight/${dateKey}/metadata.json`;
  const metadata = {
    date: dateKey,
    generatedAt: today.toISOString(),
    script,
    data: {
      bok: bokData,
      usMarket,
    },
    audioUrl: `https://${S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${audioKey}`,
  };

  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: metaKey,
    Body: JSON.stringify(metadata, null, 2),
    ContentType: 'application/json',
  }));

  return metadata;
}

// 오늘의 브리핑 가져오기
async function getTodayBriefing() {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const metaKey = `overnight/${dateKey}/metadata.json`;

  try {
    const response = await s3.send(new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: metaKey,
    }));
    const body = await response.Body.transformToString();
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

// Lambda 핸들러
export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method;

  try {
    // GET /overnight/data - 실시간 데이터만 조회 (음성 생성 없이)
    // NOTE: /overnight/data를 먼저 체크해야 함 (더 구체적인 경로)
    if (method === 'GET' && path.includes('/overnight/data')) {
      console.log('Fetching overnight data only...');
      const [bokData, usMarket] = await Promise.all([
        fetchBOKData(),
        fetchUSMarketData(),
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          date: new Date().toISOString(),
          bok: bokData,
          usMarket,
        }),
      };
    }

    // GET /overnight - 오늘의 브리핑 조회 (전체 브리핑 + 오디오)
    if (method === 'GET' && path.includes('/overnight')) {
      // 먼저 오늘 브리핑이 있는지 확인
      let briefing = await getTodayBriefing();

      if (!briefing) {
        // 없으면 새로 생성
        console.log('Generating new overnight briefing...');

        const [bokData, usMarket] = await Promise.all([
          fetchBOKData(),
          fetchUSMarketData(),
        ]);

        const script = await generateBriefingScript(bokData, usMarket);

        if (!script) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to generate script' }),
          };
        }

        const audioBuffer = await textToSpeech(script);

        if (!audioBuffer) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to generate audio' }),
          };
        }

        briefing = await saveToS3(audioBuffer, script, bokData, usMarket);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(briefing),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
