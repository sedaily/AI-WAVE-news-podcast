import { useState, useEffect, useRef, useCallback } from 'react';
import type { Podcast } from '../types/podcast';
import { markNewsRead } from '../utils/historyStorage';
import { updateKeywordScores } from '../utils/userPreferences';
import { recordListeningSession } from '../utils/listeningTracker';
import { HighlightCreateModal, HighlightPanel, type Highlight } from './highlight';
import { CommunityPanel } from './community';
import { HighlightedText } from './glossary';
import './Player.css';

interface PlayerProps {
  podcast: Podcast;
  isActive: boolean;
  onClose: () => void;
}

interface Bookmark {
  id: string;
  time: number;
  label: string;
  createdAt: number;
}

// 배속 옵션
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// 슬립 타이머 옵션 (분)
const SLEEP_TIMER_OPTIONS = [
  { label: '5분', value: 5 },
  { label: '10분', value: 10 },
  { label: '15분', value: 15 },
  { label: '30분', value: 30 },
  { label: '1시간', value: 60 },
];

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
  const [scoreType, setScoreType] = useState<'none' | 'play' | 'skip'>('none');

  // 배속 조절
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // 슬립 타이머
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [_showSleepMenu, setShowSleepMenu] = useState(false);
  void _showSleepMenu; // suppress unused warning
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 구간 반복 (A-B)
  const [repeatStart, setRepeatStart] = useState<number | null>(null);
  const [repeatEnd, setRepeatEnd] = useState<number | null>(null);
  const [isRepeatActive, setIsRepeatActive] = useState(false);

  // 북마크
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [_showBookmarks, setShowBookmarks] = useState(false);
  void _showBookmarks; // suppress unused warning

  // 하이라이트
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showHighlightPanel, setShowHighlightPanel] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // 커뮤니티
  const [showCommunityPanel, setShowCommunityPanel] = useState(false);
  const [listenCount] = useState(() => Math.floor(Math.random() * 2000) + 500); // 임시 데이터

  // 더보기 메뉴 (extra controls)
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 청취 추적용
  const sessionStartRef = useRef<number | null>(null);
  const listenedSecondsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const hasRecordedRef = useRef<boolean>(false);

  // 세션 기록 함수
  const recordSession = useCallback(() => {
    if (hasRecordedRef.current || !sessionStartRef.current) return;
    if (listenedSecondsRef.current < 3) return; // 3초 미만은 무시

    const duration = audioRef.current?.duration || podcast.duration;
    const completionRate = Math.min(1, listenedSecondsRef.current / duration);

    recordListeningSession({
      podcastId: podcast.keyword + '_' + Date.now(),
      keyword: podcast.keyword,
      relatedKeywords: podcast.relatedKeywords || [],
      startedAt: sessionStartRef.current,
      endedAt: Date.now(),
      duration: Math.floor(duration),
      listenedSeconds: Math.floor(listenedSecondsRef.current),
      completionRate,
      skipped: scoreType === 'skip',
      replayed: false
    });

    hasRecordedRef.current = true;
  }, [podcast.keyword, podcast.relatedKeywords, podcast.duration, scoreType]);

  useEffect(() => {
    if (!isActive) {
      // 플레이어 닫힐 때 세션 기록
      recordSession();

      setIsPlaying(false);
      setCurrentTime(0);
      setScoreType('none');
      sessionStartRef.current = null;
      listenedSecondsRef.current = 0;
      lastTimeRef.current = 0;
      hasRecordedRef.current = false;

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
  }, [isActive, podcast.audioUrl, recordSession]);

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
      setScoreType('none');
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
      const newTime = Math.floor(audio.currentTime);
      setCurrentTime(newTime);

      // 실제 청취 시간 추적 (앞으로 진행한 시간만)
      if (newTime > lastTimeRef.current) {
        listenedSecondsRef.current += (newTime - lastTimeRef.current);
      }
      lastTimeRef.current = newTime;
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // 완료 시 점수 부여
      if (podcast.relatedKeywords && podcast.relatedKeywords.length > 0) {
        updateKeywordScores(podcast.relatedKeywords, true, false);
        setScoreType('none'); // 완료 후 초기화
      }
      // 완료 시 세션 기록
      recordSession();
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
      markNewsRead();

      // 세션 시작 시간 기록 (첫 재생 시)
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
      }

      // 첫 재생 시에만 부분 점수 부여
      if (scoreType === 'none' && podcast.relatedKeywords && podcast.relatedKeywords.length > 0) {
        updateKeywordScores(podcast.relatedKeywords, false, false);
        setScoreType('play');
      }
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration || podcast.duration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
      
      // 스킵 시 감점 부여 (한 번만)
      if (scoreType === 'none' && podcast.relatedKeywords && podcast.relatedKeywords.length > 0) {
        updateKeywordScores(podcast.relatedKeywords, false, true);
        setScoreType('skip');
      }
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

  // 배속 변경
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // 슬립 타이머 설정
  const handleSleepTimer = (minutes: number) => {
    // 기존 타이머 취소
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }

    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);
    setShowSleepMenu(false);

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          // 타이머 종료 - 재생 중지
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          if (sleepTimerRef.current) {
            clearInterval(sleepTimerRef.current);
          }
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 슬립 타이머 취소
  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(null);
  };

  // 구간 반복 - A점 설정
  const setRepeatPointA = () => {
    if (audioRef.current) {
      setRepeatStart(audioRef.current.currentTime);
      setRepeatEnd(null);
      setIsRepeatActive(false);
    }
  };

  // 구간 반복 - B점 설정 및 활성화
  const setRepeatPointB = () => {
    if (audioRef.current && repeatStart !== null) {
      const endTime = audioRef.current.currentTime;
      if (endTime > repeatStart) {
        setRepeatEnd(endTime);
        setIsRepeatActive(true);
      }
    }
  };

  // 구간 반복 취소
  const clearRepeat = () => {
    setRepeatStart(null);
    setRepeatEnd(null);
    setIsRepeatActive(false);
  };

  // 구간 반복 로직
  useEffect(() => {
    if (!isRepeatActive || repeatStart === null || repeatEnd === null) return;

    const checkRepeat = () => {
      if (audioRef.current && audioRef.current.currentTime >= repeatEnd) {
        audioRef.current.currentTime = repeatStart;
      }
    };

    const interval = setInterval(checkRepeat, 100);
    return () => clearInterval(interval);
  }, [isRepeatActive, repeatStart, repeatEnd]);

  // 북마크 저장 키
  const bookmarkKey = `podcast_bookmarks_${podcast.keyword}`;

  // 북마크 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(bookmarkKey);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      } else {
        setBookmarks([]);
      }
    } catch {
      setBookmarks([]);
    }
  }, [bookmarkKey]);

  // 북마크 추가
  const addBookmark = () => {
    if (!audioRef.current) return;

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      time: audioRef.current.currentTime,
      label: `북마크 ${bookmarks.length + 1}`,
      createdAt: Date.now(),
    };

    const updated = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
    setBookmarks(updated);
    localStorage.setItem(bookmarkKey, JSON.stringify(updated));
  };

  // 북마크 삭제
  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(bookmarkKey, JSON.stringify(updated));
  };

  // 북마크로 이동
  const goToBookmark = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setShowBookmarks(false);
  };

  // 슬립 타이머 정리
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, []);

  // 슬립 타이머 남은 시간 포맷
  const formatSleepRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 하이라이트 저장 키
  const highlightKey = `podcast_highlights_${podcast.keyword}`;

  // 하이라이트 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(highlightKey);
      if (saved) {
        setHighlights(JSON.parse(saved));
      } else {
        setHighlights([]);
      }
    } catch {
      setHighlights([]);
    }
  }, [highlightKey]);

  // 텍스트 선택 핸들러
  const handleTextSelection = (text: string, segmentStart: number, segmentEnd: number) => {
    if (text.trim()) {
      setSelectedText(text);
      setSelectionStart(segmentStart);
      setSelectionEnd(segmentEnd);
      setShowHighlightModal(true);
    }
  };

  // 하이라이트 저장
  const handleSaveHighlight = (data: { startTime: number; endTime: number; text: string; memo: string; isPublic: boolean }) => {
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      startTime: data.startTime,
      endTime: data.endTime,
      text: data.text,
      memo: data.memo,
      isPublic: data.isPublic,
      createdAt: Date.now(),
    };

    const updated = [...highlights, newHighlight].sort((a, b) => a.startTime - b.startTime);
    setHighlights(updated);
    localStorage.setItem(highlightKey, JSON.stringify(updated));
  };

  // 하이라이트 삭제
  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    localStorage.setItem(highlightKey, JSON.stringify(updated));
  };

  // 하이라이트로 이동
  const handleHighlightClick = (highlight: Highlight) => {
    if (audioRef.current) {
      audioRef.current.currentTime = highlight.startTime;
    }
    setShowHighlightPanel(false);
  };

  const progress = audioRef.current && audioRef.current.duration 
    ? (currentTime / audioRef.current.duration) * 100 
    : (currentTime / podcast.duration) * 100;

  const getLyricClass = (start: number, end: number): string => {
    if (currentTime >= start && currentTime < end) return 'lyrics-line active';
    if (currentTime >= end) return 'lyrics-line past';
    return 'lyrics-line';
  };

  return (
    <div className={`player-screen ${isActive ? 'active' : ''}`}>
      <div className="player-handle" />
      <div className="player-layout">
        {/* Content */}
        <div className="player-content">
          <div className="player-header-minimal">
            <button className="player-close-minimal" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="player-keyword-tag">{podcast.keyword}</span>
            <span className="player-listener-count" onClick={() => setShowCommunityPanel(true)}>
              {listenCount.toLocaleString()}명
            </span>
          </div>

          <div className="player-info-minimal">
            <h2 className="player-title-main">{podcast.title}</h2>
          </div>

          {/* Lyrics Style Transcript */}
          <div className="lyrics-container" ref={lyricsRef}>
            {podcast.transcript.map((segment, index) => (
              <p
                key={index}
                className={getLyricClass(segment.start, segment.end)}
                onClick={() => handleLyricClick(segment.start)}
                onMouseUp={() => {
                  const selection = window.getSelection();
                  if (selection && selection.toString().trim()) {
                    handleTextSelection(selection.toString(), segment.start, segment.end);
                  }
                }}
              >
                <HighlightedText text={segment.text} knowledgeLevel="beginner" />
              </p>
            ))}
            {/* 하이라이트 마커 표시 */}
            {highlights.map(h => (
              <div
                key={h.id}
                className="highlight-marker"
                style={{
                  top: `${(h.startTime / (audioRef.current?.duration || podcast.duration)) * 100}%`
                }}
                onClick={() => handleHighlightClick(h)}
                title={h.memo || h.text.slice(0, 30)}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="player-controls-wrapper">
            <div className="progress-container">
              {/* 구간 반복 표시 */}
              {repeatStart !== null && (
                <div
                  className="repeat-range"
                  style={{
                    left: `${(repeatStart / (audioRef.current?.duration || podcast.duration)) * 100}%`,
                    width: repeatEnd
                      ? `${((repeatEnd - repeatStart) / (audioRef.current?.duration || podcast.duration)) * 100}%`
                      : '2px'
                  }}
                />
              )}
              {/* 북마크 마커 */}
              {bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="bookmark-marker"
                  style={{
                    left: `${(bookmark.time / (audioRef.current?.duration || podcast.duration)) * 100}%`
                  }}
                  onClick={() => goToBookmark(bookmark.time)}
                  title={bookmark.label}
                />
              ))}
              {/* 하이라이트 마커 */}
              {highlights.map(h => (
                <div
                  key={h.id}
                  className="highlight-progress-marker"
                  style={{
                    left: `${(h.startTime / (audioRef.current?.duration || podcast.duration)) * 100}%`
                  }}
                  onClick={() => handleHighlightClick(h)}
                  title={h.memo || h.text.slice(0, 30)}
                />
              ))}
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
                <span>{formatTime(Math.floor((audioRef.current?.duration || podcast.duration) / 10) * 10)}</span>
              </div>
            </div>

            <div className="controls-main">
              {/* 배속 버튼 (왼쪽) */}
              <button
                className={`speed-btn ${playbackSpeed !== 1 ? 'active' : ''}`}
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="speed-popup">
                  {PLAYBACK_SPEEDS.map(speed => (
                    <button
                      key={speed}
                      className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}

              {/* 메인 컨트롤 (중앙) */}
              <div className="controls-center">
                <button className="skip-btn" onClick={skipBackward} disabled={!audioRef.current}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                  <span>10</span>
                </button>
                <button className="play-btn-main" onClick={togglePlay} disabled={!audioRef.current}>
                  {!audioRef.current ? (
                    <span className="loading-dots">•••</span>
                  ) : isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <button className="skip-btn" onClick={skipForward} disabled={!audioRef.current}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  </svg>
                  <span>10</span>
                </button>
              </div>

              {/* 더보기 버튼 (오른쪽) */}
              <button className="more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>

            {/* 더보기 메뉴 */}
            {showMoreMenu && (
              <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}>
                <div className="more-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="more-menu-header">
                    <span>설정</span>
                    <button onClick={() => setShowMoreMenu(false)}>×</button>
                  </div>

                  {/* 슬립 타이머 */}
                  <div className="more-menu-item">
                    <div className="more-menu-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                      슬립 타이머
                    </div>
                    <div className="more-menu-options">
                      {SLEEP_TIMER_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={sleepTimerMinutes === option.value ? 'active' : ''}
                          onClick={() => handleSleepTimer(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                      {sleepTimerMinutes !== null && (
                        <button className="cancel" onClick={cancelSleepTimer}>해제</button>
                      )}
                    </div>
                    {sleepTimerRemaining !== null && (
                      <div className="sleep-timer-status">
                        {formatSleepRemaining(sleepTimerRemaining)} 후 종료
                      </div>
                    )}
                  </div>

                  {/* 구간 반복 */}
                  <div className="more-menu-item">
                    <div className="more-menu-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="17,1 21,5 17,9"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7,23 3,19 7,15"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                      구간 반복
                    </div>
                    <div className="more-menu-options">
                      <button
                        className={repeatStart !== null && !repeatEnd ? 'active' : ''}
                        onClick={setRepeatPointA}
                      >
                        시작점 {repeatStart !== null ? `(${formatTime(Math.floor(repeatStart))})` : ''}
                      </button>
                      <button
                        className={repeatEnd !== null ? 'active' : ''}
                        onClick={setRepeatPointB}
                        disabled={repeatStart === null}
                      >
                        끝점 {repeatEnd !== null ? `(${formatTime(Math.floor(repeatEnd))})` : ''}
                      </button>
                      {isRepeatActive && (
                        <button className="cancel" onClick={clearRepeat}>해제</button>
                      )}
                    </div>
                  </div>

                  {/* 북마크 */}
                  <div className="more-menu-item">
                    <div className="more-menu-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      북마크
                      {bookmarks.length > 0 && <span className="count">{bookmarks.length}</span>}
                    </div>
                    <button className="more-menu-action" onClick={addBookmark}>
                      현재 위치 저장
                    </button>
                    {bookmarks.length > 0 && (
                      <div className="bookmark-list">
                        {bookmarks.map(bookmark => (
                          <div key={bookmark.id} className="bookmark-list-item">
                            <button onClick={() => goToBookmark(bookmark.time)}>
                              <span className="time">{formatTime(Math.floor(bookmark.time))}</span>
                              <span className="label">{bookmark.label}</span>
                            </button>
                            <button className="delete" onClick={() => removeBookmark(bookmark.id)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 하이라이트 */}
                  <div className="more-menu-item">
                    <div className="more-menu-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      하이라이트
                      {highlights.length > 0 && <span className="count">{highlights.length}</span>}
                    </div>
                    <button
                      className="more-menu-action"
                      onClick={() => { setShowHighlightPanel(true); setShowMoreMenu(false); }}
                    >
                      하이라이트 보기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!podcast.audioUrl && <p className="no-audio-msg">오디오가 아직 생성되지 않았습니다</p>}
          </div>
        </div>
      </div>

      {/* 하이라이트 생성 모달 */}
      <HighlightCreateModal
        isOpen={showHighlightModal}
        onClose={() => setShowHighlightModal(false)}
        selectedText={selectedText}
        startTime={selectionStart}
        endTime={selectionEnd}
        onSave={handleSaveHighlight}
      />

      {/* 하이라이트 패널 */}
      <HighlightPanel
        isOpen={showHighlightPanel}
        onClose={() => setShowHighlightPanel(false)}
        highlights={highlights}
        onHighlightClick={handleHighlightClick}
        onDelete={handleDeleteHighlight}
      />

      {/* 커뮤니티 패널 */}
      <CommunityPanel
        isOpen={showCommunityPanel}
        onClose={() => setShowCommunityPanel(false)}
      />
    </div>
  );
}

export default Player;
