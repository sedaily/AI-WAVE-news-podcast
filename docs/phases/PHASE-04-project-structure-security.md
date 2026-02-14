# Phase 04: Project Structure & Security Improvements

**Status**: Completed
**Date**: 2026-02-14
**Priority**: High
**Category**: DevOps, Security

---

## Overview

프로젝트 폴더 구조를 정리하고 보안 취약점을 개선. 프로토타입 파일 분리, .gitignore 추가, API 키 노출 제거 및 환경변수 방식으로 전환.

---

## Problem

기존 프로젝트의 문제점:
- 루트 디렉토리에 프로토타입 파일 혼재 (app.js, data.js, index.html 등)
- `.gitignore` 파일 부재로 민감한 파일 커밋 위험
- docs에 ElevenLabs API 키가 그대로 노출
- 환경변수 템플릿 없음
- README가 실제 구조와 불일치

---

## Solution

### Architecture

```
Before                          After
─────────────────────────────────────────────────
/                               /
├── app.js          →          ├── prototype/
├── data.js         →          │   ├── app.js
├── index.html      →          │   ├── data.js
├── styles.css      →          │   ├── index.html
├── image.png       →          │   ├── styles.css
├── create-thumbnail.js →      │   └── image.png
├── react-app/                 ├── scripts/
├── lambda/                    │   └── create-thumbnail.js
└── docs/                      ├── react-app/
                               │   └── .env.example  ✨ NEW
                               ├── lambda/
                               ├── docs/
                               └── .gitignore  ✨ NEW
```

### Key Changes

| Category | Before | After |
|----------|--------|-------|
| **폴더 구조** | 루트에 프로토타입 혼재 | `prototype/`, `scripts/` 분리 |
| **API 키** | 코드/문서에 하드코딩 | 환경변수 사용 |
| **Git 관리** | .gitignore 없음 | node_modules, .env 등 제외 |
| **문서** | 구조 불일치 | README 최신화 |

---

## Implementation

### 1. .gitignore 생성

**File**: `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/
*.zip

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Lambda deployment artifacts
lambda/*.zip
lambda/**/node_modules/
```

### 2. API 키 환경변수 전환

**Before** (하드코딩)
```typescript
export const ELEVENLABS_CONFIG = {
  apiKey: 'sk_xxxxxxxxxxxxx',  // 노출 위험!
  voiceId: 'zgDzx5jLLCqEp6Fl7Kl7',
};
```

**After** (환경변수)
```typescript
export const ELEVENLABS_CONFIG = {
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || '',
};
```

### 3. 환경변수 템플릿

**File**: `react-app/.env.example`

```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

### 4. 프로토타입 파일 이동

```bash
mkdir -p prototype scripts
git mv app.js data.js index.html styles.css image.png prototype/
git mv create-thumbnail.js scripts/
```

---

## Files Modified/Created

### 신규 생성
| File | Description |
|------|-------------|
| `.gitignore` | Git 제외 파일 설정 |
| `react-app/.env.example` | 환경변수 템플릿 |
| `prototype/` | 프로토타입 파일 디렉토리 |
| `scripts/` | 유틸리티 스크립트 디렉토리 |

### 수정
| File | Description |
|------|-------------|
| `docs/phases/PHASE-02-*.md` | API 키 placeholder로 교체 |
| `react-app/src/config/elevenlabs.ts` | 환경변수 사용으로 변경 |
| `README.md` | 프로젝트 구조 및 설정 방법 업데이트 |

---

## Security Checklist

- [x] API 키 하드코딩 제거
- [x] .gitignore로 민감 파일 제외
- [x] 환경변수 템플릿 제공
- [x] 문서에서 실제 키 값 제거

---

## Setup Guide

### 개발 환경 설정

```bash
# 1. 환경변수 파일 생성
cp react-app/.env.example react-app/.env

# 2. API 키 설정 (직접 편집)
# react-app/.env 파일에 실제 API 키 입력

# 3. 의존성 설치 및 실행
cd react-app
npm install
npm run dev
```

---

## Commits

| Hash | Message |
|------|---------|
| `f6ca933` | fix: API 키 노출 제거 및 .gitignore 추가 |
| `1c0b791` | refactor: 프로젝트 폴더 구조 정리 |

---

**Phase 04 Completed**

프로젝트 구조 정리 및 보안 개선 완료. 환경변수 기반 설정으로 전환하여 API 키 노출 위험 제거.
