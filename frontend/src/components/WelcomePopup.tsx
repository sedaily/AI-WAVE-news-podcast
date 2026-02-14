import { useEffect, useState } from 'react';
import type { EconomyPodcast } from '../hooks/useEconomyNews';
import { calculateRecommendationScore } from '../utils/userPreferences';
import './WelcomePopup.css';

interface WelcomePopupProps {
  podcasts: EconomyPodcast[];
  onPlay: (index: number) => void;
  onClose: () => void;
  onPlayAndStart: (index: number) => void;
}

export default function WelcomePopup({ podcasts, onPlay, onClose, onPlayAndStart }: WelcomePopupProps) {
  const [randomPodcast, setRandomPodcast] = useState<{ podcast: EconomyPodcast; index: number } | null>(null);

  useEffect(() => {
    if (podcasts.length > 0) {
      // 각 팟캐스트의 추천 점수 계산
      const podcastsWithScores = podcasts.map((podcast, index) => ({
        podcast,
        index,
        score: podcast.relatedKeywords ? calculateRecommendationScore(podcast.relatedKeywords) : 0
      }));

      // 점수가 가장 높은 팟캐스트 선택
      const maxScore = Math.max(...podcastsWithScores.map(p => p.score));
      
      // 점수가 0보다 크면 추천, 아니면 랜덤
      const selected = maxScore > 0
        ? podcastsWithScores.find(p => p.score === maxScore)!
        : podcastsWithScores[Math.floor(Math.random() * podcastsWithScores.length)];

      setRandomPodcast({ podcast: selected.podcast, index: selected.index });
    }
  }, [podcasts]);

  if (!randomPodcast) return null;

  const { podcast, index } = randomPodcast;
  const truncatedKeyword = podcast.keyword.length > 15 
    ? podcast.keyword.substring(0, 15) + '...' 
    : podcast.keyword;

  return (
    <div className="welcome-popup-overlay" onClick={onClose}>
      <div className="welcome-popup" onClick={(e) => e.stopPropagation()}>
        <button className="welcome-close" onClick={onClose}>✕</button>
        <div className="welcome-label">바로 듣기</div>
        <div 
          className="welcome-cover"
          style={{ 
            backgroundImage: `url(${podcast.coverImage})`,
            backgroundColor: podcast.coverColor 
          }}
        />
        <h3 className="welcome-title">{truncatedKeyword}</h3>
        <button 
          className="welcome-play-btn"
          onClick={() => {
            onPlayAndStart(index);
            onClose();
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
