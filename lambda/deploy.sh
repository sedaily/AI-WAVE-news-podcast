#!/bin/bash

# Lambda 함수 이름
FUNCTION_NAME="economy-podcast-generator"

echo "📦 Installing dependencies..."
npm install

echo "🗜️ Creating deployment package..."
zip -r function.zip . -x "*.git*" "deploy.sh" "*.md"

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
