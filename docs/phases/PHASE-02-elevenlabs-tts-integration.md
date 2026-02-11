# Phase 02: ElevenLabs TTS Integration

**Status**: In Progress
**Date**: 2026-02-11
**Priority**: High
**Category**: Audio Feature

---

## Overview

ElevenLabs Text-to-Speech API를 연동하여 팟캐스트 트랜스크립트를 실제 음성으로 변환. 플레이어에서 재생 버튼 클릭 시 실시간으로 음성을 생성하고 재생하는 기능 구현.

---

## Problem

기존 플레이어의 한계:
- 시뮬레이션 타이머만 동작 (실제 오디오 없음)
- 트랜스크립트 텍스트만 표시
- 실제 팟캐스트 경험 제공 불가

---

## Solution

### Architecture

```
User clicks Play
       ↓
Transcript text extraction
       ↓
ElevenLabs API (eleven_multilingual_v2)
       ↓
Audio Blob response
       ↓
HTML5 Audio element
       ↓
Real-time playback + Lyrics sync
```

### ElevenLabs Configuration

| Setting | Value |
|---------|-------|
| API Endpoint | `https://api.elevenlabs.io/v1/text-to-speech/` |
| Voice ID | `zgDzx5jLLCqEp6Fl7Kl7` |
| Model | `eleven_multilingual_v2` |
| Stability | 0.5 |
| Similarity Boost | 0.75 |

---

## Before vs After

### Player 동작

**Before**
```
재생 버튼 클릭 → setInterval 타이머 시작
                → currentTime++ 시뮬레이션
                → 실제 오디오 없음
```

**After**
```
플레이어 열림 → ElevenLabs API 호출 (자동)
             → "음성 생성 중..." 표시
             → Audio blob 수신
             → audioRef에 저장

재생 버튼 클릭 → audioRef.current.play()
             → timeupdate 이벤트로 currentTime 동기화
             → 가사 스타일 하이라이트 실시간 반영
```

### 코드 변경

**Before (시뮬레이션)**
```typescript
useEffect(() => {
  if (isPlaying && currentTime < podcast.duration) {
    interval = window.setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
  }
}, [isPlaying]);
```

**After (실제 오디오)**
```typescript
const generateAudio = async () => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_CONFIG.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_CONFIG.apiKey
      },
      body: JSON.stringify({
        text: fullText,
        model_id: ELEVENLABS_CONFIG.model,
        voice_settings: ELEVENLABS_CONFIG.voiceSettings
      })
    }
  );

  const audioBlob = await response.blob();
  const url = URL.createObjectURL(audioBlob);
  audioRef.current = new Audio(url);
};
```

---

## Implementation

### 1. Config 파일 생성

**File**: `src/config/elevenlabs.ts`

```typescript
export const ELEVENLABS_CONFIG = {
  apiKey: 'sk_ce1357648ecc0ee7a2248034ac018ef53ea2f7517214beb2',
  voiceId: 'zgDzx5jLLCqEp6Fl7Kl7',
  model: 'eleven_multilingual_v2',
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75
  }
};
```

### 2. Player 컴포넌트 수정

**File**: `src/components/Player.tsx`

#### 상태 추가
```typescript
const [audioUrl, setAudioUrl] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);
```

#### 오디오 생성 함수
```typescript
const generateAudio = async () => {
  if (isGenerating || audioRef.current) return;
  setIsGenerating(true);

  const fullText = podcast.transcript.map(s => s.text).join(' ');

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_CONFIG.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_CONFIG.apiKey
        },
        body: JSON.stringify({
          text: fullText,
          model_id: ELEVENLABS_CONFIG.model,
          voice_settings: ELEVENLABS_CONFIG.voiceSettings
        })
      }
    );

    if (response.ok) {
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.volume = 1.0;
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(Math.floor(audio.currentTime));
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  } catch (error) {
    console.error('Failed to generate audio:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

#### 자동 생성 트리거
```typescript
useEffect(() => {
  if (!isActive) {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  } else if (!audioRef.current && !isGenerating) {
    generateAudio();
  }
}, [isActive]);
```

#### 로딩 UI
```typescript
<button className="control-btn play-btn" onClick={togglePlay} disabled={isGenerating}>
  {isGenerating ? '...' : isPlaying ? '❚❚' : '▶'}
</button>
{isGenerating && <p style={{ color: '#ff6b35' }}>음성 생성 중...</p>}
```

### 3. 목업 데이터 축소

**File**: `src/data/podcastData.ts`

```typescript
// Before: 20분 이상
duration: 1245,
transcript: [
  { start: 0, end: 180, text: "..." },
  // ... 7개 세그먼트
]

// After: 1분
duration: 60,
transcript: [
  { start: 0, end: 15, text: "안녕하세요, 오늘은 AI의 미래에 대해 이야기합니다. " },
  { start: 15, end: 30, text: "생성형 AI가 빠르게 발전하고 있습니다. " },
  { start: 30, end: 45, text: "기업들의 AI 도입이 가속화되고 있죠. " },
  { start: 45, end: 60, text: "AI 시대를 함께 준비해야 합니다." }
]
```

---

## Files Modified/Created

### 신규 생성
- `src/config/elevenlabs.ts` - ElevenLabs API 설정

### 수정
- `src/components/Player.tsx` - TTS 연동 및 실제 오디오 재생
- `src/data/podcastData.ts` - 1분 목업 데이터로 축소

---

## API 사용량

| 항목 | 값 |
|------|-----|
| 텍스트 길이 | ~100자 (1분 분량) |
| 예상 비용 | ~$0.003/요청 |
| 응답 시간 | 2-5초 |

---

## Testing

```bash
# 개발 서버 실행
cd react-app
npm run dev

# 테스트 순서
1. http://localhost:4001 접속
2. 이슈 노드 클릭
3. "음성 생성 중..." 메시지 확인
4. 재생 버튼 활성화 후 클릭
5. 음성 출력 및 가사 동기화 확인
```

---

## Known Issues

1. **CORS**: 브라우저에서 직접 API 호출 시 CORS 에러 가능
2. **API Key 노출**: 클라이언트 사이드에서 API 키가 노출됨 (프로덕션에서는 백엔드 프록시 필요)
3. **캐싱 없음**: 매번 새로 음성 생성 (추후 S3 캐싱 필요)

---

## Future Enhancements

1. **Backend Proxy**: Lambda를 통한 API 호출로 키 보호
2. **Audio Caching**: S3에 생성된 오디오 저장
3. **Streaming**: 청크 단위 스트리밍으로 즉시 재생 시작
4. **Voice Selection**: 사용자가 목소리 선택 가능

---

**Phase 02 In Progress**

ElevenLabs TTS API 연동 완료. 실제 음성 생성 및 재생 테스트 진행 중.
