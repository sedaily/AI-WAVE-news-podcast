@echo off
REM Lambda 함수 이름
SET FUNCTION_NAME=economy-podcast-generator

echo 📦 Installing dependencies...
call npm install

echo 🗜️ Creating deployment package...
powershell Compress-Archive -Path * -DestinationPath function.zip -Force -Exclude deploy.bat,deploy.sh,*.md,.git*

echo 🚀 Updating Lambda function...
aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://function.zip

echo ⏳ Waiting for update to complete...
aws lambda wait function-updated --function-name %FUNCTION_NAME%

echo ✅ Deployment complete!

REM Clean up
del function.zip
