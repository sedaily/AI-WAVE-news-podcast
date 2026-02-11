import { useState, useEffect, useRef, useCallback } from 'react';
import type { Podcast } from '../types/podcast';

interface PlayerProps {
  podcast: Podcast;
  isActive: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function Player({ podcast, isActive, onClose }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);

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
    const activeLine = lyricsRef.current?.querySelector('.lyrics-line.active');
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const handleLyricClick = (startTime: number) => {
    setCurrentTime(startTime);
  };

  const progress = (currentTime / podcast.duration) * 100;

  const getLyricClass = (start: number, end: number): string => {
    if (currentTime >= start && currentTime < end) return 'lyrics-line active';
    if (currentTime >= end) return 'lyrics-line past';
    return 'lyrics-line';
  };

  const coverStyle = podcast.coverImage
    ? { backgroundImage: `url('${podcast.coverImage}')` }
    : { backgroundColor: podcast.coverColor };

  return (
    <div className={`player-screen ${isActive ? 'active' : ''}`}>
      <div className="player-handle" />
      <div className="player-layout">
        {/* Left: Visual */}
        <div className="player-visual">
          <div className="player-cover-wrapper">
            <div className="player-cover" style={coverStyle} />
            <div className="player-cover-glow" style={coverStyle} />
          </div>
        </div>

        {/* Right: Content */}
        <div className="player-content">
          <div className="player-header">
            <span>Now Playing</span>
            <button className="player-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="player-info">
            <div className="player-keyword">#{podcast.keyword}</div>
            <h2 className="player-title">{podcast.title}</h2>
          </div>

          {/* Lyrics Style Transcript */}
          <div className="lyrics-container" ref={lyricsRef}>
            {podcast.transcript.map((segment, index) => (
              <p
                key={index}
                className={getLyricClass(segment.start, segment.end)}
                onClick={() => handleLyricClick(segment.start)}
              >
                {segment.text}
              </p>
            ))}
          </div>

          {/* Controls */}
          <div className="player-controls-wrapper">
            <div className="progress-container">
              <div
                className="progress-bar"
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(podcast.duration)}</span>
              </div>
            </div>

            <div className="controls">
              <button className="control-btn" onClick={skipBackward}>
                -10s
              </button>
              <button className="control-btn play-btn" onClick={togglePlay}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button className="control-btn" onClick={skipForward}>
                +10s
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
