import { useState, useEffect, useRef, useCallback } from 'react';
import type { Podcast } from '../types/podcast';

interface PlayerProps {
  podcast: Podcast;
  isActive: boolean;
  onClose: () => void;
  onShowSummary: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function Player({ podcast, isActive, onClose, onShowSummary }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isActive]);

  useEffect(() => {
    let interval: number | undefined;

    if (isPlaying && currentTime < podcast.duration) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= podcast.duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, podcast.duration, currentTime]);

  useEffect(() => {
    const activeSegment = transcriptRef.current?.querySelector('.active');
    if (activeSegment) {
      activeSegment.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    setCurrentTime((prev) => Math.min(podcast.duration, prev + 10));
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      setCurrentTime(Math.floor(percentage * podcast.duration));
    },
    [podcast.duration]
  );

  const handleProgressDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      setCurrentTime(Math.floor(percentage * podcast.duration));
    },
    [isDragging, podcast.duration]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleProgressDrag);
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleProgressDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleProgressDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleProgressDrag, handleDragEnd]);

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const progress = (currentTime / podcast.duration) * 100;

  const getSegmentClass = (start: number, end: number): string => {
    if (currentTime >= start && currentTime < end) return 'transcript-segment active';
    if (currentTime >= end) return 'transcript-segment past';
    return 'transcript-segment';
  };

  const coverStyle = podcast.coverImage
    ? { background: `url('${podcast.coverImage}') center/cover` }
    : { background: podcast.coverColor };

  return (
    <div className={`screen ${isActive ? 'active' : ''}`} id="player">
      <div className="player-header">
        <span></span>
        <button className="close-btn" onClick={handleClose}>
          ˅
        </button>
      </div>
      <div className="player-container">
        <div className="album-cover" style={coverStyle}></div>
        <div className="track-info">
          <h2>{podcast.title}</h2>
          <p>#{podcast.keyword}</p>
        </div>
        <div className="transcript-container" ref={transcriptRef}>
          <div className="transcript-content">
            {podcast.transcript.map((segment, index) => (
              <span
                key={index}
                className={getSegmentClass(segment.start, segment.end)}
              >
                {segment.text}
              </span>
            ))}
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress"
            ref={progressRef}
            onClick={handleProgressClick}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          ></div>
          <div className="time-info">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="total-time">{formatTime(podcast.duration)}</span>
          </div>
        </div>
        <div className="controls">
          <button
            className="control-btn hidden-btn"
            style={{ opacity: 0, pointerEvents: 'none' }}
          >
            ⏮
          </button>
          <button className="control-btn skip-btn" onClick={skipBackward}>
            ⏪
          </button>
          <button className="control-btn play-btn" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn skip-btn" onClick={skipForward}>
            ⏩
          </button>
          <button className="control-btn summary-btn" onClick={onShowSummary}>
            🤖
          </button>
        </div>
      </div>
    </div>
  );
}

export default Player;
