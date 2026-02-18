# Phase 05: BigKinds API Integration & IssueMap Network Visualization

**Status**: Completed
**Date**: 2026-02-16
**Priority**: High
**Category**: UI/UX Feature, API Integration

---

## Overview

BigKinds 뉴스 빅데이터 API를 연동하여 실시간 트렌드 키워드를 표시하고, D3 Force-directed graph 기반의 네트워크 시각화 구현. 연관 키워드(relatedKeywords) 기반으로 노드 간 직선 연결.

---

## Problem

기존 IssueMap의 한계:
- 거리 기반 노드 연결 (의미 없는 연결)
- 노드 중심점과 SVG 선 좌표 불일치 (선이 어긋남)
- 불필요한 D3 forceLink로 복잡한 물리 시뮬레이션
- 사용하지 않는 코드/인터페이스 누적

---

## Solution

### Architecture

```
BigKinds API (issue_ranking)
       ↓
useBigKindsKeywords Hook
       ↓
IssueMap Component
   ↓         ↓
D3 Simulation   keywordConnections
(충돌+반발+중심)  (relatedKeywords 기반)
       ↓         ↓
    Nodes      SVG Lines
 (CSS center)  (직선 연결)
```

### Key Changes

| Before | After |
|--------|-------|
| 거리 기반 연결 (250px 이내) | 연관 키워드 기반 연결 |
| D3 forceLink 사용 | forceLink 제거 (단순화) |
| transform 호버 시에만 적용 | 항상 translate(-50%, -50%) |
| simpleLinks 폴백 | 폴백 제거, keywordConnections만 |

---

## Implementation

### 1. BigKinds API 서비스

**File**: `src/services/bigkindsService.ts`

#### 연관어 분석 타입 정의
```typescript
// 연관어 분석 API 응답 타입
export interface WordCloudNode {
  id: string;
  name: string;
  level: number;   // 1: 중심어, 2: 연관어
  weight: number;  // 가중치 (연관도)
}

export interface WordCloudResponse {
  result: number;
  return_object: {
    nodes: WordCloudNode[];
  };
}

// 연관어 관계 타입 (노드간 연결용)
export interface KeywordRelation {
  sourceKeyword: string;
  targetKeyword: string;
  weight: number;
}
```

#### issue_ranking API 활용
```typescript
export async function fetchIssueRanking(): Promise<BigKindsKeyword[]> {
  const response = await fetch(`${BIGKINDS_API_URL}/issue_ranking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: BIGKINDS_ACCESS_KEY,
      argument: { date: todayDate }
    })
  });

  // topic_keyword 필드에서 연관 키워드 추출
  return data.return_object.topics.map((topic) => {
    const relatedKeywords = topic.topic_keyword
      ? topic.topic_keyword.split(',').map(k => k.trim())
      : [];

    return {
      keyword: topic.topic,
      newsCount: topic.news_cluster?.length || 10,
      rank: topic.topic_rank,
      relatedKeywords,  // 연관 키워드 배열
      topicContent: topic.topic_content,
      newsClusterIds: topic.news_cluster
    };
  });
}
```

### 2. 연관 키워드 기반 연결 계산

**File**: `src/components/IssueMap.tsx`

#### 연결 관계 타입
```typescript
interface KeywordConnection {
  sourceIdx: number;
  targetIdx: number;
  weight: number;
  reason: 'direct' | 'shared';
}
```

#### 연결 계산 로직
```typescript
useEffect(() => {
  if (bigKindsKeywords.length === 0) return;

  const displayKeywords = bigKindsKeywords.slice(0, 12);
  const connections: KeywordConnection[] = [];
  const addedPairs = new Set<string>();

  for (let i = 0; i < displayKeywords.length; i++) {
    const kwA = displayKeywords[i];
    const relatedA = kwA.relatedKeywords?.map(k => k.toLowerCase()) || [];

    for (let j = i + 1; j < displayKeywords.length; j++) {
      const kwB = displayKeywords[j];
      const relatedB = kwB.relatedKeywords?.map(k => k.toLowerCase()) || [];

      let weight = 0;
      let reason: 'direct' | 'shared' = 'shared';

      // 1. 직접 연관: A의 연관키워드에 B가 있거나 반대
      if (relatedA.includes(kwB.keyword.toLowerCase())) {
        weight += 3;
        reason = 'direct';
      }
      if (relatedB.includes(kwA.keyword.toLowerCase())) {
        weight += 3;
        reason = 'direct';
      }

      // 2. 공유 연관어: A와 B가 같은 연관키워드 공유
      const sharedKeywords = relatedA.filter(k => relatedB.includes(k));
      weight += sharedKeywords.length;

      if (weight > 0) {
        connections.push({
          sourceIdx: i,
          targetIdx: j,
          weight: Math.min(weight, 10),
          reason
        });
        addedPairs.add(`${i}-${j}`);
      }
    }
  }

  setKeywordConnections(connections);
}, [bigKindsKeywords]);
```

### 3. D3 시뮬레이션 단순화

**Before** (복잡한 링크 기반)
```typescript
const simulation = forceSimulation<NodeData>(newNodes)
  .force('charge', forceManyBody().strength(-180))
  .force('center', forceCenter(width/2, height/2))
  .force('link', forceLink(newLinks)  // 제거됨
    .id(d => d.id)
    .distance(120)
    .strength(0.5))
  .force('collision', forceCollide().radius(d => d.radius + 15));
```

**After** (단순화)
```typescript
const simulation = forceSimulation<NodeData>(newNodes)
  .force('charge', forceManyBody<NodeData>()
    .strength(-200)
    .distanceMax(400))
  .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2)
    .strength(0.08))
  .force('collision', forceCollide<NodeData>()
    .radius(d => d.radius + 20)
    .strength(1)
    .iterations(3))
  .velocityDecay(0.2)
  .alphaDecay(0.01);
```

### 4. SVG 직선 렌더링

```tsx
<svg className="network-lines" width={dimensions.width} height={dimensions.height}>
  {keywordConnections.map((conn, idx) => {
    const sourceNode = nodes[conn.sourceIdx];
    const targetNode = nodes[conn.targetIdx];

    if (!sourceNode || !targetNode) return null;

    const x1 = sourceNode.x ?? 0;
    const y1 = sourceNode.y ?? 0;
    const x2 = targetNode.x ?? 0;
    const y2 = targetNode.y ?? 0;

    // 가중치에 따라 선 두께 조절
    const strokeWidth = 1 + (conn.weight / 5);
    const opacity = conn.reason === 'direct' ? 0.55 : 0.3;

    return (
      <line
        key={`conn-${idx}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`rgba(184, 149, 106, ${opacity})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  })}
</svg>
```

### 5. 노드 중심점 정렬 수정

**Before** (버그: 호버 시에만 중심 정렬)
```tsx
style={{
  left: node.x,
  top: node.y,
  transform: isHovered ? 'translate(-50%, -50%) scale(1.12)' : undefined,
}}
```

**After** (항상 중심 정렬)
```tsx
style={{
  left: node.x,
  top: node.y,
  transform: isHovered
    ? 'translate(-50%, -50%) scale(1.12)'
    : 'translate(-50%, -50%)',
}}
```

---

## Code Cleanup

### 제거된 코드

| 항목 | 이유 |
|------|------|
| `forceLink` import | 링크 물리 시뮬레이션 제거 |
| `LinkData` interface | D3 링크 데이터 타입 불필요 |
| `SimpleLinkData` interface | 폴백 렌더링 제거 |
| `simpleLinks` state | 폴백 렌더링 제거 |
| `mouseVelocity` ref | 미사용 |
| 거리 기반 링크 생성 로직 | 연관어 기반으로 대체 |
| SVG defs (gradient, glow) | 미사용 |
| console.log 문들 | 프로덕션 코드 정리 |

### 수정된 버그

| 버그 | 수정 |
|------|------|
| 터치 드래그 시 fx, x 업데이트 누락 | handleTouchMove에 fx, x 할당 추가 |
| 노드 중심점 불일치 | transform 항상 적용 |

---

## Files Modified

### 수정
| File | Description |
|------|-------------|
| `src/components/IssueMap.tsx` | 연관어 기반 연결, D3 단순화, 버그 수정 |
| `src/services/bigkindsService.ts` | 연관어 분석 API 타입 추가 |

---

## Visual Comparison

### Before
```
    Node 1 ─────────────────── Node 2
      │ ╲                    ╱ │
      │   ╲                ╱   │
      │     ╲            ╱     │   ← 거리 기반: 의미 없는 연결
      │       ╲        ╱       │
      │         ╲    ╱         │
    Node 3 ─────────────────── Node 4
```

### After
```
    금리 ────────────── 환율
      │
      │   (연관어: 한국은행)
      │
    부동산              반도체 ──── AI

                       (연관어: 기술주)
```

---

## Connection Types

| Type | Description | Weight | Opacity |
|------|-------------|--------|---------|
| **direct** | A의 연관키워드에 B 포함 | +3 | 0.55 |
| **shared** | A와 B가 공통 연관키워드 공유 | +1 per 공유 | 0.3 |

---

## Performance

- API 호출: issue_ranking 1회만 (추가 word_cloud 호출 제거)
- 연결 계산: O(n²) (12개 노드 기준 최대 66회 비교)
- 렌더링: 실제 연관 있는 노드만 선 렌더링

---

## Testing

```bash
# 개발 서버 실행
cd frontend
npm run dev

# 테스트 순서
1. http://localhost:5180 접속
2. 이슈맵에서 키워드 노드 확인 (최대 12개)
3. 연관 키워드 있는 노드 간 직선 연결 확인
4. 노드 드래그 → 연결선 실시간 업데이트 확인
5. 노드 클릭 → 키워드 상세 모달 확인
6. 콘솔에서 연결 로그 확인
```

---

**Phase 05 Completed**

BigKinds API 연관어 기반 네트워크 시각화 구현 완료. 의미 있는 키워드 연결만 표시하고, 노드 중심점 정렬 버그 수정.
