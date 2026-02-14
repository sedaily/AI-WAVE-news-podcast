@echo off
REM Lambda 배포 스크립트
REM 사용법: scripts\deploy.bat (프로젝트 루트에서 실행)

SET FUNCTION_NAME=economy-podcast-generator
SET BACKEND_DIR=backend

echo 📂 Moving to backend directory...
cd %~dp0..
cd %BACKEND_DIR%

echo 📦 Installing dependencies...
call npm install

echo 🗜️ Creating deployment package...
powershell Compress-Archive -Path * -DestinationPath function.zip -Force

echo 🚀 Updating Lambda function...
aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://function.zip

echo ⏳ Waiting for update to complete...
aws lambda wait function-updated --function-name %FUNCTION_NAME%

echo ✅ Deployment complete!

REM Clean up
del function.zip
