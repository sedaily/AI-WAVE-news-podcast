# 이슈캐스트 - 뉴스 팟캐스트 웹앱

뉴스 이슈를 팟캐스트 형태로 제공하는 웹 애플리케이션

## 데모

**Live URL:** https://d3jebiel18f4l2.cloudfront.net

## 기능

- 이슈맵: 원형 노드 네트워크로 오늘의 핵심 이슈 시각화
- 바텀시트 플레이어: 아래에서 올라오는 모던한 플레이어 UI
- 가사 스타일 트랜스크립트: 음악 가사처럼 실시간 하이라이트되는 자막
- 다크 테마: 눈에 편한 어두운 배경 디자인

## 기술 스택

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** CSS (Custom Properties)
- **Deployment:** AWS S3 + CloudFront

## 실행 방법

```bash
# 의존성 설치
cd react-app
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

브라우저에서 http://localhost:5173 접속

## 배포

```bash
# 빌드
npm run build

# S3 업로드
aws s3 sync dist s3://news-podcast-app-20260211 --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id E24UFRZVWBF3J0 --paths "/*"
```

## 프로젝트 구조

```
react-app/
├── src/
│   ├── components/
│   │   ├── IssueMap.tsx    # 이슈 노드 네트워크
│   │   └── Player.tsx      # 바텀시트 플레이어
│   ├── data/
│   │   └── podcastData.ts  # 팟캐스트 데이터
│   ├── types/
│   │   └── podcast.ts      # TypeScript 타입 정의
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── App.css             # 스타일
├── package.json
└── vite.config.ts
```

## AWS 인프라

- **S3 Bucket:** news-podcast-app-20260211
- **CloudFront Distribution:** E24UFRZVWBF3J0
- **Region:** ap-northeast-2 (Seoul)
