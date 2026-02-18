import './Highlight.css';

export interface Highlight {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  memo?: string;
  isPublic: boolean;
  createdAt: number;
}

interface HighlightPanelProps {
  isOpen: boolean;
  highlights: Highlight[];
  onClose: () => void;
  onHighlightClick: (highlight: Highlight) => void;
  onShare?: (highlight: Highlight) => void;
  onDelete?: (highlightId: string) => void;
}

function HighlightPanel({
  isOpen,
  highlights = [],
  onClose,
  onHighlightClick,
  onShare,
  onDelete,
}: HighlightPanelProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`highlight-panel ${isOpen ? 'open' : ''}`}>
      <div className="highlight-panel-header">
        <h3>내 하이라이트</h3>
        <button className="highlight-panel-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="highlight-panel-list">
        {highlights.length === 0 ? (
          <div className="highlight-empty">
            <div className="highlight-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h4>아직 하이라이트가 없어요</h4>
            <p>
              놓친 이야기를 정리하고,<br />
              중요한 내용을 기록해보세요
            </p>
          </div>
        ) : (
          highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="highlight-item"
              onClick={() => onHighlightClick(highlight)}
            >
              <div className="highlight-item-header">
                <span className="highlight-item-time">
                  {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                </span>
                {highlight.isPublic && (
                  <span className="highlight-item-public">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    공개
                  </span>
                )}
              </div>
              <p className="highlight-item-text">"{highlight.text}"</p>
              {highlight.memo && (
                <div className="highlight-item-memo">{highlight.memo}</div>
              )}
              <div className="highlight-item-actions">
                <button
                  className="highlight-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(highlight);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  공유
                </button>
                <button
                  className="highlight-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(highlight.id);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HighlightPanel;
