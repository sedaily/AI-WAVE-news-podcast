# 이슈캐스트 - AI 경제 뉴스 팟캐스트

음악 앱 스타일의 모바일 최적화 팟캐스트 플랫폼. 매일 경제 뉴스를 AI가 분석하여 팟캐스트로 자동 생성.

**Tech Stack**: React + Vite + AWS Lambda + Claude AI + AWS Polly

---

## 주요 기능

- 이슈맵 기반 팟캐스트 탐색 (인터랙티브 네트워크)
- AI 대본 생성 (Claude 3.5 Haiku)
- TTS 음성 생성 (AWS Polly / ElevenLabs)
- 가사 스타일 인터랙티브 대본
- 모바일 최적화 UI

---

## Quick Start

### 프론트엔드

```bash
cd frontend
cp .env.example .env   # 환경변수 설정
npm install
npm run dev
```

http://localhost:5173 접속

### 백엔드 (Lambda)

```bash
cd backend
npm install

# 배포
../scripts/deploy.sh
```

---

## AWS 리소스

### 프론트엔드 (ap-northeast-2)

| 서비스 | 리소스명 | 용도 |
|--------|----------|------|
| **S3** | `news-podcast-app-20260211` | 프론트엔드 정적 호스팅 |
| **CloudFront** | `E24UFRZVWBF3J0` | CDN 배포 |

### 백엔드 (us-east-1)

| 서비스 | 리소스명 | 용도 |
|--------|----------|------|
| **S3** | `sedaily-news-xml-storage` | 뉴스 XML, 팟캐스트 MP3/JSON 저장 |
| **Lambda** | `economy-podcast-generator` | 팟캐스트 자동 생성 |
| **Polly** | Seoyeon (Neural) | 한국어 TTS |

### URL

| 항목 | URL |
|------|-----|
| **웹사이트** | https://d3jebiel18f4l2.cloudfront.net |
| Lambda URL | `https://or4di2zz5sefbmpy5niafkm6bu0uamot.lambda-url.us-east-1.on.aws` |
| S3 Podcasts | `https://sedaily-news-xml-storage.s3.amazonaws.com/podcasts/` |

### S3 구조

```
news-podcast-app-20260211/          # 프론트엔드 (ap-northeast-2)
└── dist/                           # Vite 빌드 결과물

sedaily-news-xml-storage/           # 백엔드 데이터 (us-east-1)
├── daily-xml/{YYYYMMDD}.xml        # 뉴스 XML
└── podcasts/
    ├── data-{YYYYMMDD}.json        # 팟캐스트 메타데이터
    └── podcast-{date}-{n}.mp3      # 오디오 파일
```

### 환경변수

**Lambda** (AWS 콘솔에서 설정)
| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 |

**Frontend** (`frontend/.env`)
| 변수 | 설명 |
|------|------|
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API 키 |
| `VITE_ELEVENLABS_VOICE_ID` | ElevenLabs 음성 ID |

---

## 프로젝트 구조

```
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/ # Player, IssueMap, Quiz 등
│   │   ├── hooks/      # useEconomyNews
│   │   ├── services/   # newsService
│   │   └── types/      # TypeScript 타입
│   └── .env.example
├── backend/            # AWS Lambda (Node.js)
│   ├── index.mjs       # Lambda 핸들러
│   └── package.json
├── scripts/            # 배포 스크립트
│   ├── deploy-frontend.sh
│   └── deploy.sh
└── docs/               # 문서
    ├── phases/         # PHASE-01 ~ 04
    └── deployment.md
```

---

## 배포

```bash
# 프론트엔드 배포 (CloudFront)
./scripts/deploy-frontend.sh

# 백엔드 배포 (Lambda)
./scripts/deploy.sh
```

---

## 문서

- [배포 가이드](docs/deployment.md)
- [PHASE-01: 초기 UI](docs/phases/PHASE-01-initial-mobile-ui.md)
- [PHASE-02: ElevenLabs TTS](docs/phases/PHASE-02-elevenlabs-tts-integration.md)
- [PHASE-03: Lambda 자동화](docs/phases/PHASE-03-interactive-issue-map.md)
- [PHASE-04: 프로젝트 정리](docs/phases/PHASE-04-project-structure-security.md)

---

## License

Apache License 2.0 - Seoul Economic Daily (서울경제신문)
