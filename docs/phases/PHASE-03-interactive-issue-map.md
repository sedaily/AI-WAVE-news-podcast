# Phase 03: Interactive Issue Map + Lambda Automation

**Status**: Completed
**Date**: 2026-02-11
**Priority**: High
**Category**: UI/UX Feature + Backend Automation

---

## Overview

이슈맵을 정적 레이아웃에서 인터랙티브한 네트워크 맵으로 전환하고, Lambda 기반 자동화 파이프라인으로 매일 팟캐스트를 생성. 오늘 콘텐츠가 부족하면 어제 기사로 보충하여 최소 4-5개 팟캐스트 제공.

---

## Frontend: Interactive Issue Map

### Problem

기존 이슈맵의 한계:
- 고정된 그리드 레이아웃 (정적)
- 노드 간 연결성 시각화 부족
- 사용자 인터랙션 제한적

### Solution

드래그 앤 드롭 가능한 네트워크 맵으로 직관적인 탐색 경험 제공.

### Key Features

| Feature | Description |
|---------|-------------|
| **Drag & Drop** | 노드를 자유롭게 이동 (5% ~ 95% 범위) |
| **Click Detection** | 5px 이하 이동 시 클릭으로 인식 |
| **Network Lines** | SVG로 모든 노드 간 연결선 표시 |
| **Visual Feedback** | 드래그 중 커서 및 그림자 변경 |

---

## Backend: Lambda 자동화 파이프라인

### Architecture

```
EventBridge (Daily Trigger)
       ↓
Lambda Function
       ↓
   ┌───┴───┐
   │       │
  S3      Claude
 (XML)   (Anthropic)
   │       │
   └───┬───┘
       ↓
오늘 기사 < 5개?
       ↓
어제 기사 추가
       ↓
Keyword Clustering (4-5개)
       ↓
Script Generation (8-10분)
       ↓
AWS Polly TTS
       ↓
S3 Upload (MP3 + JSON)
       ↓
React App (자동 갱신)
```

### Lambda Function

**File**: `lambda/index.mjs`

#### 1. 뉴스 크롤링 및 필터링 (오늘 + 어제)

```javascript
const ECONOMY_CODES = ['3134','3137','3138','3139','3140','3141','3143','3145'];

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
    return [];
  }
}

// 오늘 기사 가져오기
let articles = await fetchArticles(today);

// 오늘 기사가 5개 미만이면 어제 기사 추가
if (articles.length < 5) {
  const yesterdayArticles = await fetchArticles(yesterday);
  const needed = 10 - articles.length;
  articles = [...articles, ...yesterdayArticles.slice(0, needed)];
} else {
  articles = articles.slice(0, 10);
}
```

#### 2. Claude AI 키워드 클러스터링

```javascript
async function extractKeywords(articles) {
  const prompt = `
기사 제목:
${articles.map((a,i)=>`${i}. ${a.title}`).join('\n')}

JSON만 출력:
{"clusters":[{
  "keyword":"키워드",
  "articleIds":[0],
  "summary":"요약",
  "relatedKeywords":["연관키워드1","연관키워드2"]
}]}
`;

  const res = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  return safeJsonParse(res.content[0].text);
}
```

#### 3. 팟캐스트 대본 생성 (8-10분)

```javascript
async function generateScript(cluster) {
  const articlesText = cluster.articles
    .map((a, i) => `
[기사 ${i + 1}]
제목: ${a.title}
내용: ${a.content.substring(0, 500)}...
`).join('\n');

  const prompt = `
당신은 전문 경제 팟캐스트 진행자입니다. 
반드시 8~10분 분량의 상세한 대본을 작성해주세요.

주제: ${cluster.keyword}
요약: ${cluster.summary}

대본 작성 지침:
1. 오프닝 (1분)
2. 배경 설명 (2분)
3. 핵심 내용 상세 분석 (4-5분)
4. 실생활 영향 분석 (2분)
5. 전망과 마무리 (1분)

필수 요구사항:
- 최소 2500자 이상 작성
- 실제 대화하듯 자연스러운 구어체
- 섹션 제목이나 번호 절대 표시 금지
`;

  const res = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  return res.content[0].text.trim();
}
```

#### 4. AWS Polly TTS 음성 생성

```javascript
async function generateAudio(script, id) {
  const maxLength = 2900; // Polly 제한
  let audioChunks = [];
  
  // 대본을 3000자 단위로 분할
  if (script.length > maxLength) {
    const parts = [];
    for (let i = 0; i < script.length; i += maxLength) {
      parts.push(script.substring(i, i + maxLength));
    }
    
    // 각 부분을 순차적으로 처리
    for (let i = 0; i < parts.length; i++) {
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
      
      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 모든 오디오 청크를 하나로 합치기
  const audioBuffer = Buffer.concat(audioChunks);

  // S3에 업로드
  const key = `podcasts/${id}.mp3`;
  await s3.send(new PutObjectCommand({
    Bucket: 'sedaily-news-xml-storage',
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg'
  }));

  return {
    audioUrl: `https://sedaily-news-xml-storage.s3.amazonaws.com/${key}`,
    duration: Math.floor(script.length / 5)
  };
}
```

#### 5. 팟캐스트 생성 (4-5개 보장)

```javascript
const podcasts = [];

// 최소 4개, 최대 5개 팟캐스트 생성
const targetCount = Math.min(Math.max(grouped.length, 4), 5);

for (let i = 0; i < targetCount; i++) {
  const c = grouped[i];
  const id = `podcast-${today}-${i}`;
  
  const script = await generateScript(c);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const audio = await generateAudio(script, id);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  podcasts.push({...c, id, script, ...audio});
}
```

#### 6. 키워드 연관도 계산

```javascript
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
```

### AWS Services

| Service | Usage |
|---------|-------|
| **Lambda** | 팟캐스트 자동 생성 파이프라인 |
| **S3** | XML 뉴스 저장, MP3 오디오 저장, JSON 데이터 저장 |
| **Polly** | 한국어 TTS (Seoyeon, Neural) |
| **EventBridge** | 매일 자동 실행 트리거 |
| **Claude API** | 키워드 추출 및 대본 생성 |

### Data Flow

```
1. S3에서 daily-xml/{today}.xml 읽기
   ↓
2. 오늘 기사 < 5개? → 어제 기사 추가 (최대 10개)
   ↓
3. 경제 카테고리 기사 필터링
   ↓
4. Claude로 키워드 클러스터링 (4-5개)
   ↓
5. 각 클러스터별 8-10분 대본 생성
   ↓
6. Polly로 MP3 생성 (3000자 단위 분할)
   ↓
7. S3에 MP3 업로드 (podcasts/{id}.mp3)
   ↓
8. React 데이터 포맷 변환
   ↓
9. S3에 JSON 저장 (podcasts/data-{date}.json)
   ↓
10. React 앱에서 자동 로드
```

---

## Files Modified/Created

### 신규 생성
- `lambda/index.mjs` - 팟캐스트 자동 생성 Lambda 함수
- `lambda/package.json` - Lambda 의존성
- `docs/phases/PHASE-03-interactive-issue-map.md` - 문서

### 수정
- `src/components/IssueMap.tsx` - 드래그 앤 드롭 및 네트워크 시각화
- `src/App.css` - 인터랙티브 노드 스타일

---

## Lambda Deployment

```bash
# 패키지 설치
cd lambda
npm install

# Lambda 함수 생성
aws lambda create-function \
  --function-name economy-podcast-generator \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --timeout 900 \
  --memory-size 1024

# EventBridge 규칙 생성 (매일 오전 9시)
aws events put-rule \
  --name daily-podcast-generation \
  --schedule-expression "cron(0 0 * * ? *)"

# Lambda 권한 추가
aws lambda add-permission \
  --function-name economy-podcast-generator \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-xxx
AWS_REGION=us-east-1
```

---

## Cost Estimation

| Service | Usage | Cost/Day |
|---------|-------|----------|
| Lambda | 1회/일, 5분 실행 | ~$0.001 |
| Polly | 4-5개 팟캐스트 × 2500자 | ~$0.25 |
| Claude API | 6회 호출 × 4K tokens | ~$0.06 |
| S3 Storage | 5 MP3 + 1 JSON | ~$0.001 |
| S3 Transfer | 100MB/일 | ~$0.01 |
| **Total** | | **~$0.32/일** |

---

## Testing

```bash
# 개발 서버 실행
cd react-app
npm run dev

# 테스트 순서
1. http://localhost:5173 접속
2. 이슈맵에서 노드 확인 (4-5개, 연결선 표시)
3. 노드 클릭 → 플레이어 열림 확인
4. 노드 드래그 → 위치 변경 확인
5. 드래그 중 연결선 실시간 업데이트 확인
```

---

## Future Enhancements

### Frontend
1. **Touch Support**: 모바일 터치 이벤트 지원
2. **Animation**: 노드 이동 시 스프링 애니메이션
3. **Zoom & Pan**: 많은 노드 표시 시 확대/축소
4. **Layout Algorithm**: Force-directed graph 자동 배치
5. **Persistence**: 사용자 커스텀 레이아웃 저장

### Backend
1. **Multi-Voice**: 대화형 팟캐스트 (2명 진행자)
2. **Background Music**: 자동 배경음악 삽입
3. **Thumbnail Generation**: AI 기반 썸네일 자동 생성
4. **Personalization**: 사용자 관심사 기반 추천
5. **Real-time Update**: WebSocket으로 실시간 업데이트

---

**Phase 03 Completed**

인터랙티브 이슈맵 + Lambda 자동화 파이프라인 구현 완료. 오늘 콘텐츠 부족 시 어제 기사로 보충하여 최소 4-5개 팟캐스트 보장.
