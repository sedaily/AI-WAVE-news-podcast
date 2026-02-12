# Phase 03: Interactive Issue Map

**Status**: Completed
**Date**: 2026-02-11
**Priority**: High
**Category**: UI/UX Feature

---

## Overview

이슈맵을 정적 레이아웃에서 인터랙티브한 네트워크 맵으로 전환. 사용자가 노드를 드래그하여 위치를 조정하고, 클릭하여 팟캐스트를 선택할 수 있는 직관적인 탐색 경험 제공.

---

## Problem

기존 이슈맵의 한계:
- 고정된 그리드 레이아웃 (정적)
- 노드 간 연결성 시각화 부족
- 사용자 인터랙션 제한적
- 음악 앱 스타일의 탐색 경험 부재

---

## Solution

### Architecture

```
Issue Map Component
       ↓
Node Positions State (x, y, size)
       ↓
Drag & Drop System
   ↓         ↓
Click      Drag Move
   ↓         ↓
Select   Update Position
Podcast   (with boundary check)
       ↓
SVG Connection Lines
(dynamic rendering)
```

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Direct Manipulation | 마우스 드래그로 노드 위치 조정 |
| Visual Feedback | 드래그 중 커서 변경 (grab → grabbing) |
| Network Visualization | SVG 라인으로 노드 간 연결 표시 |
| Responsive Layout | 퍼센트 기반 위치 (5% ~ 95%) |

---

## Before vs After

### 레이아웃

**Before**
```
Grid Layout (2x2)
┌─────────┬─────────┐
│ Node 1  │ Node 2  │
├─────────┼─────────┤
│ Node 3  │ Node 4  │
└─────────┴─────────┘
```

**After**
```
Network Map (자유 배치)
    Node 1 ─────── Node 2
      │    ╲    ╱    │
      │     ╲  ╱     │
      │      ╳       │
      │     ╱  ╲     │
      │    ╱    ╲    │
    Node 3 ─────── Node 4
```

### 인터랙션

**Before**
```
클릭 → 팟캐스트 선택
(위치 고정)
```

**After**
```
클릭 → 팟캐스트 선택
드래그 → 노드 위치 이동
  ↓
5px 이상 이동 시 드래그로 인식
(클릭과 드래그 구분)
```

---

## Implementation

### 1. 노드 위치 상태 관리

**File**: `src/components/IssueMap.tsx`

#### 타입 정의
```typescript
interface NodePosition {
  x: number;        // 0-100% (퍼센트)
  y: number;        // 0-100% (퍼센트)
  size: 'large' | 'medium';
}

const initialNodePositions: NodePosition[] = [
  { x: 30, y: 35, size: 'large' },
  { x: 70, y: 40, size: 'large' },
  { x: 25, y: 75, size: 'medium' },
  { x: 75, y: 80, size: 'medium' },
];
```

#### 상태 초기화
```typescript
const [nodePositions, setNodePositions] = useState<NodePosition[]>(initialNodePositions);
const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
const dragStartPos = useRef<{ x: number; y: number } | null>(null);
const hasMoved = useRef(false);
```

### 2. 드래그 앤 드롭 시스템

#### 드래그 시작
```typescript
const handleMouseDown = (e: React.MouseEvent, index: number) => {
  e.preventDefault();
  setDraggingIndex(index);
  dragStartPos.current = { x: e.clientX, y: e.clientY };
  hasMoved.current = false;
};
```

#### 드래그 이동
```typescript
const handleMouseMove = (e: MouseEvent) => {
  if (draggingIndex === null || !containerRef.current) return;

  const deltaX = e.clientX - dragStartPos.current.x;
  const deltaY = e.clientY - dragStartPos.current.y;
  
  // 5px 이상 움직이면 드래그로 간주
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    hasMoved.current = true;
  }

  const rect = containerRef.current.getBoundingClientRect();
  const newX = ((e.clientX - rect.left) / rect.width) * 100;
  const newY = ((e.clientY - rect.top) / rect.height) * 100;

  // 경계 체크 (5% ~ 95%)
  const clampedX = Math.max(5, Math.min(95, newX));
  const clampedY = Math.max(5, Math.min(95, newY));

  setNodePositions(prev => {
    const newPositions = [...prev];
    newPositions[draggingIndex] = {
      ...newPositions[draggingIndex],
      x: clampedX,
      y: clampedY,
    };
    return newPositions;
  });
};
```

#### 드래그 종료
```typescript
const handleMouseUp = () => {
  if (draggingIndex !== null && !hasMoved.current) {
    // 드래그하지 않고 클릭만 했을 때
    onSelectPodcast(draggingIndex);
  }
  
  setDraggingIndex(null);
  dragStartPos.current = null;
  hasMoved.current = false;
};
```

#### 전역 이벤트 리스너
```typescript
useEffect(() => {
  if (draggingIndex !== null) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [draggingIndex]);
```

### 3. SVG 연결선 렌더링

#### 연결 생성 (모든 노드 간)
```typescript
const connections: { from: number; to: number }[] = [];

for (let i = 0; i < Math.min(podcasts.length, 4); i++) {
  for (let j = i + 1; j < Math.min(podcasts.length, 4); j++) {
    connections.push({ from: i, to: j });
  }
}
```

#### SVG 라인 렌더링
```typescript
<svg className="network-lines">
  {connections.map((conn) => {
    const fromNode = nodePositions[conn.from];
    const toNode = nodePositions[conn.to];
    return (
      <line
        key={`${conn.from}-${conn.to}`}
        x1={`${fromNode.x}%`}
        y1={`${fromNode.y}%`}
        x2={`${toNode.x}%`}
        y2={`${toNode.y}%`}
        strokeWidth="2"
      />
    );
  })}
</svg>
```

### 4. 노드 렌더링

```typescript
{podcasts.slice(0, 4).map((podcast, index) => {
  const pos = nodePositions[index];
  const color = nodeColors[index];
  const isDragging = draggingIndex === index;
  
  return (
    <div
      key={podcast.title}
      className={`issue-node ${pos.size} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={(e) => handleMouseDown(e, index)}
    >
      <div className="issue-node-inner">
        <span className="issue-node-keyword">{podcast.keyword}</span>
        <span className="issue-node-duration">{formatDuration(podcast.duration)}</span>
      </div>
    </div>
  );
})}
```

### 5. CSS 스타일링

**File**: `src/App.css`

```css
.issue-network {
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  overflow: hidden;
}

.network-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.network-lines line {
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
}

.issue-node {
  position: absolute;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.issue-node.large {
  width: 120px;
  height: 120px;
}

.issue-node.medium {
  width: 100px;
  height: 100px;
}

.issue-node.dragging {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.issue-node:hover:not(.dragging) {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}
```

---

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
Keyword Clustering
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

#### 1. 뉴스 크롤링 및 필터링

```javascript
const ECONOMY_CODES = ['3134','3137','3138','3139','3140','3141','3143','3145'];

const xml = await s3.send(new GetObjectCommand({
  Bucket: 'sedaily-news-xml-storage',
  Key: `daily-xml/${today}.xml`
}));

const articles = items
  .filter(i => ECONOMY_CODES.includes(i.category?.['@_code']))
  .slice(0, 10)
  .map((i, idx) => ({
    id: `eco-${idx}`,
    title: i.title || '',
    content: i.content || '',
    image: i.image?.['@_href'] || ''
  }));
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

#### 5. 키워드 연관도 계산

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

#### 6. React 데이터 포맷 생성

```javascript
const reactData = podcasts.reduce((acc, p, i) => {
  const key = p.keyword.replace(/\s+/g, '_').toLowerCase();
  const lines = p.script.split('\n').filter(Boolean);
  const totalChars = lines.reduce((s, l) => s + l.length, 0);
  
  let t = 0;
  const transcript = lines.map(l => {
    const d = (l.length / totalChars) * p.duration;
    const seg = { start: Math.floor(t), end: Math.floor(t + d), text: l };
    t += d;
    return seg;
  });

  acc[key] = {
    keyword: p.keyword,
    title: p.summary,
    duration: p.duration,
    audioUrl: p.audioUrl,
    coverColor: colors[i % colors.length],
    relatedKeywords: p.relatedKeywords || [],
    transcript
  };

  return acc;
}, {});

// 연결 정보 추가
reactData._connections = connections;

// S3에 저장
await s3.send(new PutObjectCommand({
  Bucket: 'sedaily-news-xml-storage',
  Key: `podcasts/data-${today}.json`,
  Body: JSON.stringify(reactData, null, 2),
  ContentType: 'application/json'
}));
```

### AWS Services

| Service | Usage |
|---------|-------|
| **Lambda** | 팟캐스트 자동 생성 파이프라인 |
| **S3** | XML 뉴스 저장, MP3 오디오 저장, JSON 데이터 저장 |
| **Polly** | 한국어 TTS (Seoyeon, Neural) |
| **EventBridge** | 매일 자동 실행 트리거 |
| **Claude API** | 키워드 추출 및 대본 생성 |

### Dependencies

**File**: `lambda/package.json`

```json
{
  "name": "economy-news-api",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.400.0",
    "@aws-sdk/client-polly": "^3.400.0",
    "fast-xml-parser": "^4.3.0",
    "@anthropic-ai/sdk": "^0.27.0"
  }
}
```

### Data Flow

```
1. S3에서 daily-xml/{date}.xml 읽기
   ↓
2. 경제 카테고리 기사 필터링 (최대 10개)
   ↓
3. Claude로 키워드 클러스터링 (최대 4개)
   ↓
4. 각 클러스터별 8-10분 대본 생성
   ↓
5. Polly로 MP3 생성 (3000자 단위 분할)
   ↓
6. S3에 MP3 업로드 (podcasts/{id}.mp3)
   ↓
7. React 데이터 포맷 변환
   ↓
8. S3에 JSON 저장 (podcasts/data-{date}.json)
   ↓
9. React 앱에서 자동 로드
```

---

## Files Modified/Created

### 신규 생성
- `lambda/index.mjs` - 팟캐스트 자동 생성 Lambda 함수
- `lambda/package.json` - Lambda 의존성

### 수정
- `src/components/IssueMap.tsx` - 드래그 앤 드롭 및 네트워크 시각화
- `src/App.css` - 인터랙티브 노드 스타일

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Drag & Drop** | 노드를 자유롭게 이동 (5% ~ 95% 범위) |
| **Click Detection** | 5px 이하 이동 시 클릭으로 인식 |
| **Network Lines** | SVG로 모든 노드 간 연결선 표시 |
| **Visual Feedback** | 드래그 중 커서 및 그림자 변경 |
| **Boundary Check** | 노드가 화면 밖으로 나가지 않도록 제한 |
| **Responsive** | 퍼센트 기반 위치로 반응형 지원 |

---

## UX Improvements

### 1. 클릭 vs 드래그 구분
```
마우스 다운 → 5px 이하 이동 → 마우스 업
                ↓
            클릭으로 인식
            팟캐스트 선택

마우스 다운 → 5px 이상 이동 → 마우스 업
                ↓
            드래그로 인식
            위치 변경만 수행
```

### 2. 시각적 피드백
- **Hover**: scale(1.05) + 그림자
- **Dragging**: grabbing 커서 + 강한 그림자
- **Idle**: grab 커서

### 3. 경계 제한
- 최소: 5% (노드가 잘리지 않도록)
- 최대: 95% (노드가 잘리지 않도록)

---

## Testing

```bash
# 개발 서버 실행
cd react-app
npm run dev

# 테스트 순서
1. http://localhost:5173 접속
2. 이슈맵에서 노드 확인 (4개, 연결선 표시)
3. 노드 클릭 → 플레이어 열림 확인
4. 노드 드래그 → 위치 변경 확인
5. 드래그 중 연결선 실시간 업데이트 확인
6. 경계 밖으로 드래그 시도 → 제한 확인
```

---

## Performance Considerations

1. **SVG 최적화**: 최대 6개 연결선 (4개 노드 기준)
2. **상태 업데이트**: 드래그 중에만 리렌더링
3. **이벤트 리스너**: 드래그 시작 시에만 전역 리스너 등록
4. **메모리 관리**: 컴포넌트 언마운트 시 리스너 정리

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
| Polly | 4개 팟캐스트 × 2500자 | ~$0.20 |
| Claude API | 5회 호출 × 4K tokens | ~$0.05 |
| S3 Storage | 4 MP3 + 1 JSON | ~$0.001 |
| S3 Transfer | 100MB/일 | ~$0.01 |
| **Total** | | **~$0.26/일** |

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

인터랙티브 이슈맵 구현 완료. 드래그 앤 드롭, 네트워크 시각화, 클릭/드래그 구분 기능 정상 동작.
