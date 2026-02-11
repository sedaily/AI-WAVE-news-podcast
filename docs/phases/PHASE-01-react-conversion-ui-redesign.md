# Phase 01: React Conversion & UI Redesign

**Status**: Completed
**Date**: 2026-02-11
**Priority**: High
**Category**: Frontend Development

---

## Overview

Vanilla JavaScript 기반의 뉴스 팟캐스트 웹앱을 **React + TypeScript**로 전환하고, 모던하고 트렌디한 다크 테마 UI로 리디자인. 바텀시트 스타일 플레이어와 가사 스타일 트랜스크립트를 구현하여 사용자 경험을 크게 개선함.

---

## Problem

기존 Vanilla JS 프로젝트의 한계:
- 컴포넌트 재사용 어려움
- 상태 관리 복잡
- 타입 안정성 부재
- 유지보수 어려움
- 구식 UI 디자인

---

## Solution

### Architecture

```
React + TypeScript + Vite
        ↓
    Components
   ┌─────────────────────┐
   │  App.tsx            │ ← 메인 상태 관리
   │    ├── IssueMap     │ ← 원형 노드 네트워크
   │    └── Player       │ ← 바텀시트 플레이어
   └─────────────────────┘
        ↓
    AWS Deployment
   ┌─────────────────────┐
   │  S3 (Static Host)   │
   │        ↓            │
   │  CloudFront (CDN)   │
   └─────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | CSS Custom Properties |
| Hosting | AWS S3 |
| CDN | AWS CloudFront |

---

## Before vs After

### 프로젝트 구조

**Before (Vanilla JS)**
```
├── index.html
├── styles.css
├── app.js
└── data.js
```

**After (React + TypeScript)**
```
react-app/
├── src/
│   ├── components/
│   │   ├── IssueMap.tsx
│   │   └── Player.tsx
│   ├── data/
│   │   └── podcastData.ts
│   ├── types/
│   │   └── podcast.ts
│   ├── assets/
│   │   └── image.png
│   ├── App.tsx
│   └── App.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### UI 디자인

**Before**
- 밝은 배경
- 카드 기반 레이아웃
- 전통적인 플레이어 UI
- 이모지 사용

**After**
- 다크 테마 (#0f0f0f 배경)
- 원형 노드 네트워크 (SVG 연결선)
- 바텀시트 스타일 플레이어
- 가사 스타일 트랜스크립트
- 깔끔한 미니멀 디자인

### 플레이어 인터랙션

**Before**
```
전체 화면 전환 → 플레이어 표시
```

**After**
```
노드 클릭 → 바텀시트 슬라이드 업 (55vh)
          → 좌측: 커버 이미지
          → 우측: 가사 스타일 트랜스크립트
```

---

## Implementation

### 1. React 프로젝트 생성

```bash
npm create vite@latest react-app -- --template react-ts
cd react-app
npm install
```

### 2. TypeScript 타입 정의

**File**: `src/types/podcast.ts`

```typescript
export type PodcastKey = 'ai' | 'economy' | 'tech' | 'climate';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Podcast {
  keyword: string;
  title: string;
  duration: number;
  audioUrl: string;
  coverColor: string;
  coverImage?: string;
  transcript: TranscriptSegment[];
  summary: {
    keyPoints: string[];
    stats: { number: string; label: string }[];
    topics: string[];
  };
}
```

### 3. 다크 테마 CSS 변수

**File**: `src/App.css`

```css
:root {
  --color-bg: #0f0f0f;
  --color-bg-card: #1a1a1a;
  --color-bg-elevated: #242424;
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-text-muted: rgba(255, 255, 255, 0.5);
  --color-border: rgba(255, 255, 255, 0.1);
  --color-accent: #ff6b35;
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 4. 원형 노드 네트워크

**File**: `src/components/IssueMap.tsx`

```tsx
function IssueMap({ onSelectPodcast }: IssueMapProps) {
  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
  ];

  return (
    <section className="issue-map-section">
      <div className="issue-network">
        {/* SVG Connection Lines */}
        <svg className="network-lines">
          {connections.map((conn, index) => (
            <line
              key={index}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
            />
          ))}
        </svg>

        {/* Issue Nodes */}
        {issueNodes.map((node) => (
          <div
            className={`issue-node ${node.size}`}
            onClick={() => onSelectPodcast(node.key)}
          />
        ))}
      </div>
    </section>
  );
}
```

### 5. 바텀시트 플레이어

**File**: `src/App.css`

```css
.player-screen {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55vh;
  background: #1a1a1a;
  z-index: 200;
  border-radius: 24px 24px 0 0;
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -20px 80px rgba(0, 0, 0, 0.8);
}

.player-screen.active {
  transform: translateY(0);
}
```

### 6. 가사 스타일 트랜스크립트

**File**: `src/components/Player.tsx`

```tsx
const getLyricClass = (start: number, end: number): string => {
  if (currentTime >= start && currentTime < end) return 'lyrics-line active';
  if (currentTime >= end) return 'lyrics-line past';
  return 'lyrics-line';
};

return (
  <div className="lyrics-container">
    {podcast.transcript.map((segment, index) => (
      <p
        key={index}
        className={getLyricClass(segment.start, segment.end)}
        onClick={() => handleLyricClick(segment.start)}
      >
        {segment.text}
      </p>
    ))}
  </div>
);
```

**CSS**:
```css
.lyrics-line {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-muted);
  cursor: pointer;
}

.lyrics-line.active {
  color: var(--color-text-primary);
  font-weight: 600;
}

.lyrics-line.past {
  color: var(--color-text-muted);
  opacity: 0.6;
}
```

---

## Deployment

### AWS S3 + CloudFront 배포

```bash
# 1. 빌드
cd react-app
npm run build

# 2. S3 버킷 생성
aws s3 mb s3://news-podcast-app-20260211 --region ap-northeast-2

# 3. 파일 업로드
aws s3 sync dist s3://news-podcast-app-20260211 --delete

# 4. CloudFront OAC 생성
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "news-podcast-oac",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }'

# 5. CloudFront 배포 생성
aws cloudfront create-distribution \
  --distribution-config file://cf-config.json

# 6. S3 버킷 정책 설정 (CloudFront 접근 허용)
aws s3api put-bucket-policy --bucket news-podcast-app-20260211 \
  --policy file://bucket-policy.json
```

### 배포 정보

| Resource | Value |
|----------|-------|
| S3 Bucket | `news-podcast-app-20260211` |
| CloudFront ID | `E24UFRZVWBF3J0` |
| Domain | `d3jebiel18f4l2.cloudfront.net` |
| Region | ap-northeast-2 (Seoul) |

---

## Files Modified/Created

### 신규 생성
- `react-app/` - 전체 React 프로젝트
- `react-app/src/components/IssueMap.tsx` - 이슈 노드 네트워크
- `react-app/src/components/Player.tsx` - 바텀시트 플레이어
- `react-app/src/types/podcast.ts` - TypeScript 타입
- `react-app/src/data/podcastData.ts` - 팟캐스트 데이터
- `react-app/src/App.tsx` - 메인 컴포넌트
- `react-app/src/App.css` - 스타일시트

### 수정
- `README.md` - 프로젝트 문서 업데이트

---

## Visual Comparison

### Home Screen

| Before | After |
|--------|-------|
| 카드 리스트 레이아웃 | 원형 노드 네트워크 |
| 밝은 배경 | 다크 테마 (#0f0f0f) |
| 이모지 포함 | 클린 미니멀 디자인 |

### Player Screen

| Before | After |
|--------|-------|
| 전체 화면 전환 | 바텀시트 슬라이드 업 |
| 단순 텍스트 자막 | 가사 스타일 트랜스크립트 |
| 고정 레이아웃 | 좌측 커버 + 우측 컨텐츠 |

---

## Live Demo

**URL**: https://d3jebiel18f4l2.cloudfront.net

---

## Future Enhancements

1. **실제 오디오 연동**: AWS Polly TTS 또는 실제 팟캐스트 오디오
2. **백엔드 API**: DynamoDB + Lambda로 동적 데이터 제공
3. **모바일 최적화**: 터치 제스처, 스와이프 닫기
4. **다크/라이트 테마 전환**: 사용자 설정

---

**Phase 01 Complete**

Vanilla JS 프로젝트를 React + TypeScript로 성공적으로 전환하고, 모던한 다크 테마 UI와 바텀시트 플레이어, 가사 스타일 트랜스크립트를 구현하여 AWS S3 + CloudFront에 배포 완료.
