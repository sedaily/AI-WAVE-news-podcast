# 이슈캐스트 - 모바일 팟캐스트 웹앱

음악 앱 스타일의 모바일 최적화 팟캐스트 플랫폼

## 기능

- 📱 모바일 최적화 UI
- 🎧 이슈맵 기반 팟캐스트 탐색
- 🎵 음악 앱 스타일 플레이어
- 📊 인포그래픽 요약

## 실행 방법

```bash
# 간단히 index.html을 브라우저에서 열기
# 또는 로컬 서버 실행
python -m http.server 8000
```

브라우저에서 http://localhost:8000 접속

## 향후 확장 계획

### AWS 연동
- S3: 팟캐스트 오디오 파일 저장
- CloudFront: CDN을 통한 빠른 콘텐츠 전송
- Lambda: 팟캐스트 자동 생성 (TTS)
- DynamoDB: 메타데이터 저장
- API Gateway: REST API 엔드포인트

### 팟캐스트 자동화
- AI 기반 뉴스 크롤링 및 요약
- TTS를 통한 자동 음성 생성
- 자동 인포그래픽 생성
- 스케줄링된 콘텐츠 업데이트

## 파일 구조

```
├── index.html      # 메인 HTML
├── styles.css      # 스타일시트
├── app.js          # 앱 로직
└── data.js         # 더미 데이터 (추후 API로 대체)
```
