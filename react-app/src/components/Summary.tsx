import type { Podcast } from '../types/podcast';

interface SummaryProps {
  podcast: Podcast;
  isActive: boolean;
  onClose: () => void;
}

function Summary({ podcast, isActive, onClose }: SummaryProps) {
  const { summary } = podcast;

  return (
    <div className={`summary-panel ${isActive ? 'active' : ''}`}>
      <div className="summary-header">
        <span className="summary-header-title">AI 요약</span>
        <button className="summary-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="summary-content">
        <h2 className="summary-title">{podcast.title}</h2>
        <div className="summary-keyword">#{podcast.keyword}</div>

        <div className="summary-section">
          <h3 className="summary-section-title">핵심 포인트</h3>
          <ul className="summary-list">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="summary-list-item">
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">주요 지표</h3>
          <div className="stats-grid">
            {summary.stats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">다룬 주제</h3>
          <ul className="summary-list">
            {summary.topics.map((topic, index) => (
              <li key={index} className="summary-list-item">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Summary;
