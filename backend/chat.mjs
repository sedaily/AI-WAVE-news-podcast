import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import Anthropic from '@anthropic-ai/sdk';

const s3 = new S3Client({ region: 'us-east-1' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-3-5-haiku-20241022';

// 오늘 뉴스 데이터 가져오기
async function getTodayNews() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  try {
    const response = await s3.send(new GetObjectCommand({
      Bucket: 'sedaily-news-xml-storage',
      Key: `podcasts/data-${today}.json`
    }));

    const text = await response.Body.transformToString();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching today news:', error);
    return null;
  }
}

// 뉴스 컨텍스트를 문자열로 변환
function formatNewsContext(newsData) {
  if (!newsData) return '오늘의 뉴스 데이터를 불러올 수 없습니다.';

  const articles = [];

  Object.entries(newsData).forEach(([key, value]) => {
    if (key === '_connections') return;

    articles.push(`
## ${value.keyword}
${value.title}

주요 내용:
${value.summary?.keyPoints?.join('\n- ') || ''}

스크립트 요약:
${value.transcript?.slice(0, 3).map(t => t.text).join(' ') || ''}
`);
  });

  return articles.join('\n---\n');
}

export const handler = async (event) => {
  // CORS 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { message, history = [] } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '메시지가 필요합니다' })
      };
    }

    // 오늘 뉴스 가져오기
    const newsData = await getTodayNews();
    const newsContext = formatNewsContext(newsData);

    // 시스템 프롬프트
    const systemPrompt = `당신은 "경제뉴스캐스트"의 AI 어시스턴트입니다.
사용자가 오늘의 경제 뉴스에 대해 질문하면 친절하고 쉽게 설명해주세요.

## 오늘의 뉴스 컨텍스트:
${newsContext}

## 규칙:
1. 위 뉴스 컨텍스트를 기반으로 답변하세요
2. 경제 용어는 쉽게 풀어서 설명하세요
3. 뉴스에 없는 내용은 "오늘 뉴스에는 해당 내용이 없습니다"라고 안내하세요
4. 짧고 명확하게 답변하세요 (3-5문장)
5. 친근한 말투를 사용하세요 (~요, ~죠, ~거든요)
6. 투자 조언은 하지 마세요

## 응답 스타일:
- 핵심만 간단히
- 예시를 들어 설명
- 어려운 용어 풀이`;

    // 대화 히스토리 구성
    const messages = [
      ...history.map((h) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    // Claude API 호출
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      })
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '죄송합니다. 잠시 후 다시 시도해주세요.',
        details: error.message
      })
    };
  }
};
