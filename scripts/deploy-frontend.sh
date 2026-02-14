#!/bin/bash

# 프론트엔드 CloudFront 배포 스크립트
# 사용법: ./scripts/deploy-frontend.sh

set -e

# 설정
S3_BUCKET="news-podcast-app-20260211"
CLOUDFRONT_ID="E24UFRZVWBF3J0"
REGION="ap-northeast-2"
FRONTEND_DIR="frontend"

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 프론트엔드 배포 시작${NC}"

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.." || exit

# 1. 빌드
echo -e "${GREEN}📦 빌드 중...${NC}"
cd "$FRONTEND_DIR"
npm install
npm run build

# 2. S3 업로드
echo -e "${GREEN}☁️  S3 업로드 중...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# index.html은 캐시 없이 업로드
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
  --region "$REGION" \
  --cache-control "no-cache, no-store, must-revalidate"

# 3. CloudFront 캐시 무효화
echo -e "${GREEN}🔄 CloudFront 캐시 무효화 중...${NC}"
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "웹사이트: https://d3jebiel18f4l2.cloudfront.net"
