@echo off
REM 오늘 날짜 가져오기 (YYYYMMDD 형식)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TODAY=%datetime:~0,8%

echo 📅 Checking thumbnails for date: %TODAY%
echo.

echo 🖼️ Thumbnails in S3:
aws s3 ls s3://sedaily-news-xml-storage/podcasts/thumbnails/ --recursive | findstr %TODAY%

echo.
echo 🎵 Audio files in S3:
aws s3 ls s3://sedaily-news-xml-storage/podcasts/ | findstr %TODAY%

echo.
echo 📄 JSON data file:
aws s3 ls s3://sedaily-news-xml-storage/podcasts/ | findstr "data-%TODAY%"

echo.
echo 🌐 Thumbnail URLs:
for /L %%i in (0,1,4) do (
    echo https://sedaily-news-xml-storage.s3.amazonaws.com/podcasts/thumbnails/podcast-%TODAY%-%%i.png
)
