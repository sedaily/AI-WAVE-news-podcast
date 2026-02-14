# 이슈캐스트 - 모바일 팟캐스트 웹앱

음악 앱 스타일의 모바일 최적화 팟캐스트 플랫폼

## 기능

- 📱 모바일 최적화 UI
- 🎧 이슈맵 기반 팟캐스트 탐색
- 🎵 음악 앱 스타일 플레이어
- 🎤 ElevenLabs TTS 음성 생성
- 📊 인터랙티브 대본 (가사 스타일)

## 실행 방법

### React 앱 (메인)

```bash
cd react-app
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 프로토타입 (HTML/JS)

```bash
cd prototype
# 간단히 index.html을 브라우저에서 열기
# 또는 로컬 서버 실행
python -m http.server 8000
```

브라우저에서 http://localhost:8000 접속

## 설정

### ElevenLabs API 키 설정

1. `react-app/.env.example`을 복사하여 `react-app/.env` 생성
2. 환경변수 설정:

```bash
cp react-app/.env.example react-app/.env
```

```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

## 향후 확장 계획

### AWS 연동
- S3: 팟캐스트 오디오 파일 저장
- CloudFront: CDN을 통한 빠른 콘텐츠 전송
- Lambda: 팟캐스트 자동 생성 (TTS)
- DynamoDB: 메타데이터 저장
- API Gateway: REST API 엔드포인트

### 팟캐스트 자동화
- AI 기반 뉴스 크롤링 및 요약
- TTS를 통한 자동 음성 생성
- 자동 인포그래픽 생성
- 스케줄링된 콘텐츠 업데이트

## 프로젝트 구조

```
├── react-app/              # React + TypeScript 메인 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── config/         # API 설정
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── services/       # API 서비스
│   │   ├── types/          # TypeScript 타입
│   │   ├── utils/          # 유틸리티 함수
│   │   └── data/           # 더미 데이터
│   ├── .env.example        # 환경변수 템플릿
│   └── package.json
├── lambda/                 # AWS Lambda 함수
│   ├── index.mjs           # Lambda 핸들러
│   └── economy-news-api/   # 경제뉴스 API
├── prototype/              # HTML/JS 프로토타입
│   ├── index.html
│   ├── app.js
│   ├── data.js
│   └── styles.css
├── scripts/                # 유틸리티 스크립트
│   └── create-thumbnail.js
├── docs/                   # 문서
│   └── phases/             # 개발 단계별 문서
└── .gitignore
```
