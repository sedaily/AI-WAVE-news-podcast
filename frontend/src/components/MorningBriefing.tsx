import { useState, useEffect, useRef } from 'react';
import './MorningBriefing.css';

interface MarketData {
  price: string;
  change: string;
  changePercent: string;
}

interface BriefingData {
  date: string;
  generatedAt: string;
  script: string;
  audioUrl: string;
  data: {
    bok: {
      baseRate: { value: number; cycle: string } | null;
      usdKrw: { value: number; cycle: string } | null;
      jpyKrw: { value: number; cycle: string } | null;
      eurKrw: { value: number; cycle: string } | null;
      bondYield5y: { value: number; cycle: string } | null;
    };
    usMarket: {
      'S&P 500'?: MarketData;
      'NASDAQ'?: MarketData;
      'Dow Jones'?: MarketData;
      'Bitcoin'?: MarketData;
    };
  };
}

interface MorningBriefingProps {
  onClose: () => void;
  onDismissToday: () => void;
}

const API_BASE = import.meta.env.VITE_OVERNIGHT_API_URL || 'https://csh5ye72kne43tqupebtnn7jte0opzvb.lambda-url.ap-northeast-2.on.aws';

export function MorningBriefing({ onClose, onDismissToday }: MorningBriefingProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 먼저 실시간 데이터만 빠르게 가져오기
      const dataRes = await fetch(`${API_BASE}/overnight/data`);
      if (dataRes.ok) {
        const data = await dataRes.json();
        // 임시로 데이터만 표시
        setBriefing({
          date: data.date,
          generatedAt: data.date,
          script: '',
          audioUrl: '',
          data: {
            bok: data.bok,
            usMarket: data.usMarket,
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch briefing data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // 오디오가 없으면 전체 브리핑 생성 요청
    if (!briefing?.audioUrl) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/overnight`);
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);

          if (data.audioUrl) {
            audioRef.current = new Audio(data.audioUrl);
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } catch (err) {
        console.error('Failed to generate briefing:', err);
        setError('브리핑 생성 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 이미 오디오가 있으면 재생
    if (briefing.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(briefing.audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '-';
    return num.toLocaleString();
  };

  const getChangeClass = (change: string | undefined) => {
    if (!change) return '';
    const num = parseFloat(change);
    if (num > 0) return 'positive';
    if (num < 0) return 'negative';
    return '';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  return (
    <div className="morning-briefing-overlay">
      <div className="morning-briefing-container">
        {/* Header */}
        <div className="morning-briefing-header">
          <button className="morning-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="morning-briefing-content">
          {/* Greeting */}
          <div className="morning-greeting">
            <span className="morning-icon">☀️</span>
            <h1>{getGreeting()}</h1>
            <p className="morning-subtitle">밤사이 시장이 움직였어요</p>
          </div>

          {isLoading && !briefing ? (
            <div className="morning-loading">
              <div className="morning-spinner" />
              <span>데이터를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="morning-error">
              <span>{error}</span>
              <button onClick={fetchBriefing}>다시 시도</button>
            </div>
          ) : briefing && (
            <>
              {/* Key Stats */}
              <div className="morning-stats">
                {/* 환율 */}
                <div className="morning-stat-card primary">
                  <div className="stat-label">원/달러</div>
                  <div className="stat-value">
                    {formatNumber(briefing.data.bok?.usdKrw?.value)}
                    <span className="stat-unit">원</span>
                  </div>
                </div>

                {/* 미국 증시 */}
                <div className="morning-stat-row">
                  <div className="morning-stat-card">
                    <div className="stat-label">S&P 500</div>
                    <div className={`stat-value ${getChangeClass(briefing.data.usMarket?.['S&P 500']?.changePercent)}`}>
                      {briefing.data.usMarket?.['S&P 500']?.changePercent ? (
                        <>
                          {parseFloat(briefing.data.usMarket['S&P 500'].changePercent) > 0 ? '+' : ''}
                          {briefing.data.usMarket['S&P 500'].changePercent}%
                        </>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="morning-stat-card">
                    <div className="stat-label">나스닥</div>
                    <div className={`stat-value ${getChangeClass(briefing.data.usMarket?.['NASDAQ']?.changePercent)}`}>
                      {briefing.data.usMarket?.['NASDAQ']?.changePercent ? (
                        <>
                          {parseFloat(briefing.data.usMarket['NASDAQ'].changePercent) > 0 ? '+' : ''}
                          {briefing.data.usMarket['NASDAQ'].changePercent}%
                        </>
                      ) : '-'}
                    </div>
                  </div>
                </div>

                {/* 금리 & 비트코인 */}
                <div className="morning-stat-row">
                  <div className="morning-stat-card">
                    <div className="stat-label">기준금리</div>
                    <div className="stat-value">
                      {briefing.data.bok?.baseRate?.value ?? '-'}%
                    </div>
                  </div>
                  <div className="morning-stat-card">
                    <div className="stat-label">비트코인</div>
                    <div className={`stat-value ${getChangeClass(briefing.data.usMarket?.['Bitcoin']?.changePercent)}`}>
                      {briefing.data.usMarket?.['Bitcoin']?.changePercent ? (
                        <>
                          {parseFloat(briefing.data.usMarket['Bitcoin'].changePercent) > 0 ? '+' : ''}
                          {briefing.data.usMarket['Bitcoin'].changePercent}%
                        </>
                      ) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <button
                className={`morning-play-btn ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handlePlay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="morning-spinner small" />
                    <span>브리핑 생성 중...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>3분 브리핑 듣기</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="morning-briefing-footer">
          <button className="morning-dismiss-btn" onClick={onDismissToday}>
            오늘은 안 볼게요
          </button>
        </div>
      </div>
    </div>
  );
}

export default MorningBriefing;
