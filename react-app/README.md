# 이슈캐스트 React App

음악 앱 스타일의 모바일 최적화 팟캐스트 플레이어

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** - 빌드 도구
- **ElevenLabs API** - TTS 음성 생성

## 시작하기

### 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:5173 접속

### 4. 프로덕션 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/         # React 컴포넌트
│   ├── Player.tsx      # 팟캐스트 플레이어
│   ├── IssueMap.tsx    # 인터랙티브 이슈맵
│   ├── Quiz.tsx        # 키워드 퀴즈
│   ├── History.tsx     # 히스토리 페이지
│   ├── Summary.tsx     # 요약 컴포넌트
│   └── WelcomePopup.tsx
├── hooks/              # 커스텀 훅
│   └── useEconomyNews.ts
├── services/           # API 서비스
│   └── newsService.ts
├── config/             # 설정
│   ├── elevenlabs.ts   # ElevenLabs 설정
│   └── elevenlabs.example.ts
├── types/              # TypeScript 타입
│   ├── podcast.ts
│   ├── quiz.ts
│   └── history.ts
├── utils/              # 유틸리티
│   ├── historyStorage.ts
│   └── userPreferences.ts
├── data/               # 더미 데이터
│   ├── podcastData.ts
│   └── quizData.ts
├── assets/             # 이미지 등 정적 파일
├── App.tsx             # 메인 앱
├── App.css             # 스타일
└── main.tsx            # 엔트리포인트
```

## 주요 기능

### 이슈맵 (IssueMap)
- 드래그 앤 드롭으로 노드 이동
- 클릭하여 팟캐스트 선택
- SVG 네트워크 연결선 시각화

### 플레이어 (Player)
- ElevenLabs TTS 실시간 음성 생성
- 가사 스타일 트랜스크립트 동기화
- 재생/일시정지, 시간 탐색

### 퀴즈 (Quiz)
- 키워드 기반 경제 퀴즈
- 점수 계산 및 히스토리 저장

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | ESLint 검사 |
