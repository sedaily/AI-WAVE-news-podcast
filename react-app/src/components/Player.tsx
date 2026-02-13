import { useState, useEffect, useRef, useCallback } from 'react';
import type { Podcast } from '../types/podcast';
import { markNewsRead } from '../utils/historyStorage';

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
  const [_audioUrl, setAudioUrl] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else if (!audioRef.current) {
      // S3에 저장된 오디오 URL 사용
      if (podcast.audioUrl) {
        loadAudioFromUrl(podcast.audioUrl);
      } else {
        console.log('No audio URL available');
      }
    }
  }, [isActive, podcast.audioUrl]);

  // 컴포넌트 언마운트 또는 팟캐스트 변경 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioUrl(null);
    };
  }, [podcast.audioUrl]);

  const loadAudioFromUrl = (url: string) => {
    if (audioRef.current) return;
    
    console.log('Loading audio from S3:', url);
    setAudioUrl(url);
    
    const audio = new Audio(url);
    audio.volume = 1.0;
    audioRef.current = audio;
    
    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    console.log('Audio ready:', url);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const activeLine = lyricsRef.current?.querySelector('.lyrics-line.active');
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
      });
      setIsPlaying(true);
      // 뉴스를 재생하면 읽음으로 기록
      markNewsRead();
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration || podcast.duration, audioRef.current.currentTime + 10);
    }
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !audioRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audioRef.current.currentTime = percentage * (audioRef.current.duration || podcast.duration);
    },
    [podcast.duration]
  );

  const handleProgressDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !progressRef.current || !audioRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audioRef.current.currentTime = percentage * (audioRef.current.duration || podcast.duration);
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
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
    }
  };

  const progress = (currentTime / podcast.duration) * 100;

  const getLyricClass = (start: number, end: number): string => {
    if (currentTime >= start && currentTime < end) return 'lyrics-line active';
    if (currentTime >= end) return 'lyrics-line past';
    return 'lyrics-line';
  };

  const coverStyle = podcast.coverImage
    ? { backgroundImage: `url('${podcast.coverImage}')` }
    : { background: 'linear-gradient(135deg, #ff6b35, #4ecdc4)' };

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
              <button className="control-btn" onClick={skipBackward} disabled={!audioRef.current}>
                -10s
              </button>
              <button className="control-btn play-btn" onClick={togglePlay} disabled={!audioRef.current}>
                {!audioRef.current ? '...' : isPlaying ? '❚❚' : '▶'}
              </button>
              <button className="control-btn" onClick={skipForward} disabled={!audioRef.current}>
                +10s
              </button>
            </div>
            {!podcast.audioUrl && <p style={{ textAlign: 'center', color: '#ff6b35', marginTop: '12px' }}>오디오가 아직 생성되지 않았습니다</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
