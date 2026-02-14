#!/bin/bash

# Lambda 배포 스크립트
# 사용법: ./scripts/deploy.sh (프로젝트 루트에서 실행)

FUNCTION_NAME="economy-podcast-generator"
BACKEND_DIR="backend"

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.." || exit

echo "📂 Moving to backend directory..."
cd "$BACKEND_DIR" || exit

echo "📦 Installing dependencies..."
npm install

echo "🗜️ Creating deployment package..."
zip -r function.zip . -x "*.git*" "*.md" "*.bat" "*.sh"

echo "🚀 Updating Lambda function..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip

echo "⏳ Waiting for update to complete..."
aws lambda wait function-updated \
  --function-name $FUNCTION_NAME

echo "✅ Deployment complete!"

# Clean up
rm function.zip
