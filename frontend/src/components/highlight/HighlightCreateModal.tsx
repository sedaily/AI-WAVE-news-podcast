import { useState } from 'react';
import './Highlight.css';

export interface HighlightData {
  startTime: number;
  endTime: number;
  text: string;
  memo: string;
  isPublic: boolean;
}

interface HighlightCreateModalProps {
  isOpen: boolean;
  selectedText: string;
  startTime: number;
  endTime: number;
  onClose: () => void;
  onSave: (data: HighlightData) => void;
}

function HighlightCreateModal({
  isOpen,
  selectedText,
  startTime,
  endTime,
  onClose,
  onSave,
}: HighlightCreateModalProps) {
  const [memo, setMemo] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      startTime,
      endTime,
      text: selectedText,
      memo,
      isPublic,
    });
    setMemo('');
    setIsPublic(false);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="highlight-modal-overlay" onClick={onClose}>
      <div className="highlight-modal" onClick={(e) => e.stopPropagation()}>
        <div className="highlight-modal-header">
          <h3>하이라이트 추가</h3>
          <button className="highlight-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="highlight-modal-content">
          <div className="highlight-time-badge">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>

          <div className="highlight-selected-text">
            <p>"{selectedText}"</p>
          </div>

          <div className="highlight-memo-section">
            <label>메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="이 부분을 기억해두고 싶으시군요! 메모도 남겨보세요."
              rows={3}
            />
          </div>

          <div className="highlight-public-section">
            <label className="highlight-toggle">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="highlight-toggle-slider" />
              <span className="highlight-toggle-label">
                커뮤니티에 공유하기
              </span>
            </label>
            <p className="highlight-public-hint">
              나와 비슷한 분들과 이야기를 나눠보세요
            </p>
          </div>
        </div>

        <div className="highlight-modal-actions">
          <button className="highlight-cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="highlight-save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default HighlightCreateModal;
