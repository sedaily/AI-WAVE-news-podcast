@echo off
SET BUCKET_NAME=your-bucket-name
SET DISTRIBUTION_ID=your-cloudfront-id

echo 📦 Building React app...
cd react-app
call npm run build

echo 🚀 Deploying to S3...
aws s3 sync dist/ s3://%BUCKET_NAME%/ --delete

echo 🔄 Invalidating CloudFront cache...
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"

echo ✅ Deployment complete!
cd ..
