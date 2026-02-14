# 이슈캐스트 Backend (AWS Lambda)

경제 뉴스 팟캐스트 자동 생성 Lambda 함수

## 기능

- S3에서 일일 뉴스 XML 파일 읽기
- Claude AI로 키워드 클러스터링 및 대본 생성
- AWS Polly로 TTS 음성 생성
- S3에 팟캐스트 데이터 저장

## 기술 스택

- **Runtime**: Node.js 18+ (ES Modules)
- **AI**: Claude 3.5 Haiku (Anthropic API)
- **TTS**: AWS Polly (Neural, Seoyeon 음성)
- **Storage**: AWS S3

## 환경변수

Lambda 콘솔에서 설정:

| 변수명 | 설명 |
|--------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 |

## 의존성

```json
{
  "@aws-sdk/client-s3": "S3 파일 읽기/쓰기",
  "@aws-sdk/client-polly": "TTS 음성 생성",
  "@anthropic-ai/sdk": "Claude AI API",
  "fast-xml-parser": "XML 파싱"
}
```

## 배포

프로젝트 루트에서:

```bash
# Linux/Mac
./scripts/deploy.sh

# Windows
scripts\deploy.bat
```

또는 수동 배포:

```bash
cd backend
npm install
zip -r function.zip . -x "*.git*" "*.md"
aws lambda update-function-code \
  --function-name economy-podcast-generator \
  --zip-file fileb://function.zip
rm function.zip
```

## Lambda 설정

| 항목 | 값 |
|------|-----|
| **Function name** | `economy-podcast-generator` |
| **Runtime** | Node.js 18.x |
| **Handler** | `index.handler` |
| **Timeout** | 5분 (300초) |
| **Memory** | 512MB |

## 출력 형식

S3에 저장되는 JSON 구조:

```json
{
  "keyword_name": {
    "keyword": "키워드",
    "title": "요약",
    "duration": 180,
    "audioUrl": "https://s3.../podcasts/podcast-xxx.mp3",
    "coverColor": "#6b9b8e",
    "coverImage": "https://...",
    "relatedKeywords": ["연관1", "연관2"],
    "summary": {
      "keyPoints": ["포인트1", "포인트2"],
      "topics": ["주제1", "주제2"]
    },
    "transcript": [
      {"start": 0, "end": 5, "text": "대본 내용..."}
    ]
  },
  "_connections": [
    {"source": "키워드1", "target": "키워드2", "strength": 0.8}
  ]
}
```

## 프로젝트 구조

```
backend/
├── index.mjs        # Lambda 핸들러
├── package.json     # 의존성 정의
└── README.md        # 이 문서
```
