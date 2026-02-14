# 이슈캐스트 - 모바일 팟캐스트 웹앱

음악 앱 스타일의 모바일 최적화 팟캐스트 플랫폼

## 기능

- 📱 모바일 최적화 UI
- 🎧 이슈맵 기반 팟캐스트 탐색
- 🎵 음악 앱 스타일 플레이어
- 🎤 ElevenLabs TTS 음성 생성
- 📊 인터랙티브 대본 (가사 스타일)

## 실행 방법

### 프론트엔드 (React)

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 프로토타입 (HTML/JS)

```bash
cd prototype
python -m http.server 8000
```

브라우저에서 http://localhost:8000 접속

## 설정

### ElevenLabs API 키 설정

1. `frontend/.env.example`을 복사하여 `frontend/.env` 생성
2. 환경변수 설정:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

## 배포

Lambda 배포는 [docs/deployment.md](docs/deployment.md) 참조

```bash
# Linux/Mac
./scripts/deploy.sh

# Windows
scripts\deploy.bat
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
├── frontend/               # React + TypeScript 프론트엔드
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
├── backend/                # AWS Lambda 백엔드
│   ├── index.mjs           # Lambda 핸들러
│   └── package.json
├── prototype/              # HTML/JS 프로토타입
│   ├── index.html
│   ├── app.js
│   ├── data.js
│   └── styles.css
├── scripts/                # 배포 및 유틸리티 스크립트
│   ├── deploy.sh           # Lambda 배포 (Linux/Mac)
│   ├── deploy.bat          # Lambda 배포 (Windows)
│   └── create-thumbnail.js # 썸네일 생성
├── docs/                   # 문서
│   ├── phases/             # 개발 단계별 문서
│   └── deployment.md       # 배포 가이드
└── .gitignore
```
