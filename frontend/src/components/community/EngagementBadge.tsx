import './Community.css';

interface EngagementBadgeProps {
  listenCount: number;
  highlightCount?: number;
  commentCount?: number;
  onClick?: () => void;
}

function EngagementBadge({
  listenCount,
  highlightCount = 0,
  commentCount = 0,
  onClick,
}: EngagementBadgeProps) {
  const formatCount = (count: number): string => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}만`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}천`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="engagement-badge" onClick={onClick}>
      <div className="engagement-main">
        <div className="engagement-listeners">
          <div className="listener-avatars">
            <span className="listener-avatar" />
            <span className="listener-avatar" />
            <span className="listener-avatar" />
          </div>
          <span className="listener-text">
            지금 <strong>{formatCount(listenCount)}명</strong>이 함께 듣고 있어요
          </span>
        </div>
      </div>

      {(highlightCount > 0 || commentCount > 0) && (
        <div className="engagement-stats">
          {highlightCount > 0 && (
            <span className="engagement-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              {highlightCount}
            </span>
          )}
          {commentCount > 0 && (
            <span className="engagement-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {commentCount}
            </span>
          )}
        </div>
      )}

      <div className="engagement-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>
    </div>
  );
}

export default EngagementBadge;
