import { useState, useEffect } from 'react';

interface FloatingActionButtonProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  hasActiveEpisode: boolean;
  currentTitle?: string;
}

export function FloatingActionButton({
  isPlaying,
  onTogglePlay,
  hasActiveEpisode,
  currentTitle,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide FAB when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (!hasActiveEpisode) return null;

  return (
    <div
      className={`fab-container ${isVisible ? 'fab-visible' : 'fab-hidden'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <button
        className={`fab-button ${isPlaying ? 'fab-playing' : ''}`}
        onClick={onTogglePlay}
        aria-label={isPlaying ? '일시정지' : '재생'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {isExpanded && currentTitle && (
        <div className="fab-tooltip">
          <span className="fab-tooltip-text">{currentTitle}</span>
        </div>
      )}
    </div>
  );
}

export default FloatingActionButton;
