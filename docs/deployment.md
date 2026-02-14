# 배포 가이드

이슈캐스트 프로젝트의 배포 방법을 설명합니다.

## 프론트엔드 배포 (CloudFront)

### 배포 스크립트 (권장)

```bash
./scripts/deploy-frontend.sh
```

### 스크립트 동작 과정

1. `frontend/` 폴더에서 `npm run build` 실행
2. `dist/` 폴더를 S3에 업로드
3. CloudFront 캐시 무효화

### AWS 리소스

| 항목 | 값 |
|------|-----|
| S3 버킷 | `news-podcast-app-20260211` |
| CloudFront ID | `E24UFRZVWBF3J0` |
| 리전 | `ap-northeast-2` |
| URL | https://d3jebiel18f4l2.cloudfront.net |

### 수동 배포

```bash
cd frontend
npm install
npm run build

# S3 업로드
aws s3 sync dist/ s3://news-podcast-app-20260211/ \
  --region ap-northeast-2 --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E24UFRZVWBF3J0 \
  --paths "/*"
```

---

## 백엔드 (Lambda) 배포

### 사전 요구사항

- AWS CLI 설치 및 설정
- Lambda 함수 생성 완료 (`economy-podcast-generator`)

### 배포 스크립트

프로젝트 루트에서 실행:

```bash
# Linux / Mac
./scripts/deploy.sh

# Windows
scripts\deploy.bat
```

### 스크립트 동작 과정

1. `backend/` 폴더로 이동
2. `npm install`로 의존성 설치
3. `function.zip` 생성
4. AWS Lambda 함수 코드 업데이트
5. 업데이트 완료 대기
6. 임시 zip 파일 삭제

### 수동 배포

```bash
cd backend

# 의존성 설치
npm install

# zip 파일 생성
zip -r function.zip . -x "*.git*" "*.md"

# Lambda 업데이트
aws lambda update-function-code \
  --function-name economy-podcast-generator \
  --zip-file fileb://function.zip

# 정리
rm function.zip
```

---

## 환경변수

### 프론트엔드

| 변수명 | 설명 |
|--------|------|
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API 키 |
| `VITE_ELEVENLABS_VOICE_ID` | 사용할 음성 ID |

설정 방법:
```bash
cp frontend/.env.example frontend/.env
# .env 파일 편집
```

### 백엔드 (Lambda)

Lambda 콘솔에서 환경변수 설정:

| 변수명 | 설명 |
|--------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `S3_BUCKET` | S3 버킷 이름 |

---

## 유틸리티 스크립트

### 썸네일 생성

```bash
# 프로젝트 루트에서
node scripts/create-thumbnail.js
```

결과: `frontend/src/assets/image.png` 생성

---

## 트러블슈팅

### Lambda 배포 실패

```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# Lambda 함수 존재 확인
aws lambda get-function --function-name economy-podcast-generator
```

### 빌드 오류

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```
