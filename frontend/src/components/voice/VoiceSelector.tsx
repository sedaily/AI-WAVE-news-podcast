import { useState, useRef, useEffect } from 'react';
import './VoiceSelector.css';

export interface VoiceOption {
  id: string;
  name: string;
  nameKr: string;
  gender: 'female' | 'male';
  nationality: string;
  description: string;
  tags: string[];
  engine: 'neural' | 'standard';
  previewText: string;
  avatar?: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Seoyeon',
    name: 'Seoyeon',
    nameKr: '서연',
    gender: 'female',
    nationality: '한국 여성',
    description: 'Neural 엔진 - 가장 자연스러운 음성',
    tags: ['차분한', '신뢰감'],
    engine: 'neural',
    previewText: '안녕하세요, 오늘의 경제 뉴스를 전해드립니다.',
  },
  {
    id: 'Subin',
    name: 'Subin',
    nameKr: '수빈',
    gender: 'female',
    nationality: '한국 여성',
    description: 'Standard 엔진 - 밝고 친근한 톤',
    tags: ['밝은', '친근한'],
    engine: 'standard',
    previewText: '안녕하세요, 오늘의 경제 뉴스를 전해드립니다.',
  },
];

// localStorage 키
const VOICE_STORAGE_KEY = 'newscast_voice_preference';

// 저장된 음성 가져오기
export function getSavedVoice(): string {
  try {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved && VOICE_OPTIONS.find(v => v.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'Seoyeon'; // 기본값
}

// 음성 저장하기
export function saveVoicePreference(voiceId: string): void {
  try {
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
  } catch {
    // ignore
  }
}

export interface VoiceSelectorProps {
  selectedVoice?: string;
  onSelectVoice?: (voiceId: string) => void;
  onPreview?: (voiceId: string) => void;
  isPreviewLoading?: boolean;
}

function VoiceSelector({
  selectedVoice: externalSelectedVoice,
  onSelectVoice,
  onPreview,
  isPreviewLoading = false,
}: VoiceSelectorProps) {
  const [internalSelectedVoice, setInternalSelectedVoice] = useState(() => getSavedVoice());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const selectedVoice = externalSelectedVoice ?? internalSelectedVoice;

  // 초기 인덱스 설정
  useEffect(() => {
    const index = VOICE_OPTIONS.findIndex(v => v.id === selectedVoice);
    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [selectedVoice]);

  const handleSelect = (voiceId: string) => {
    if (onSelectVoice) {
      onSelectVoice(voiceId);
    } else {
      setInternalSelectedVoice(voiceId);
      saveVoicePreference(voiceId);

      // 저장 메시지 표시
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    }
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 160 + 12; // card width + gap
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = 160 + 12;
      const newIndex = Math.round(carouselRef.current.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const getAvatarGradient = (voice: VoiceOption) => {
    if (voice.engine === 'neural') {
      return 'linear-gradient(135deg, #ff7a5c 0%, #f59e0b 100%)';
    }
    return 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)';
  };

  return (
    <div className="voice-selector-v2">
      <div className="voice-selector-header">
        <h3>성우 선택</h3>
        <p>원하는 목소리로 뉴스를 들어보세요</p>
      </div>

      {/* 카드 캐러셀 */}
      <div
        className="voice-carousel"
        ref={carouselRef}
        onScroll={handleScroll}
      >
        {VOICE_OPTIONS.map((voice) => (
          <div
            key={voice.id}
            className={`voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
            onClick={() => handleSelect(voice.id)}
          >
            {selectedVoice === voice.id && (
              <div className="voice-card-badge">MY</div>
            )}

            <div
              className="voice-card-avatar"
              style={{ background: getAvatarGradient(voice) }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 14c2.21 0 4-1.79 4-4V6c0-2.21-1.79-4-4-4S8 3.79 8 6v4c0 2.21 1.79 4 4 4z" />
                <path d="M19 10v1c0 3.87-3.13 7-7 7s-7-3.13-7-7v-1" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>

            <div className="voice-card-nationality">{voice.nationality}</div>
            <div className="voice-card-name">{voice.nameKr}</div>

            <div className="voice-card-tags">
              {voice.tags.map((tag, idx) => (
                <span key={idx} className="voice-tag">{tag}</span>
              ))}
            </div>

            {voice.engine === 'neural' && (
              <div className="voice-card-neural">Neural</div>
            )}
          </div>
        ))}
      </div>

      {/* 페이지네이션 닷 */}
      <div className="voice-pagination">
        {VOICE_OPTIONS.map((_, index) => (
          <button
            key={index}
            className={`voice-dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      {/* 미리듣기 & 선택 버튼 */}
      <div className="voice-actions">
        <button
          className="voice-preview-btn"
          onClick={() => onPreview?.(selectedVoice)}
          disabled={isPreviewLoading}
        >
          {isPreviewLoading ? (
            <span className="loading-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
          <span>미리듣기</span>
        </button>
      </div>

      {/* 선택된 성우 정보 */}
      <div className="voice-selected-info">
        <div className="voice-selected-label">선택된 성우</div>
        <div className="voice-selected-name">
          {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.nameKr}
          {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.engine === 'neural' && (
            <span className="neural-badge">Neural</span>
          )}
        </div>
        <div className="voice-selected-desc">
          {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.description}
        </div>
      </div>

      {/* 저장 완료 메시지 */}
      {showSavedMessage && (
        <div className="voice-saved-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>선호 성우가 저장되었습니다</span>
        </div>
      )}
    </div>
  );
}

export default VoiceSelector;
export { VOICE_OPTIONS };
