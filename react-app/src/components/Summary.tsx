import type { Podcast } from '../types/podcast';

interface SummaryProps {
  podcast: Podcast;
  isActive: boolean;
  onClose: () => void;
}

function Summary({ podcast, isActive, onClose }: SummaryProps) {
  const { summary } = podcast;

  return (
    <div className={`screen ${isActive ? 'active' : ''}`} id="summary">
      <div className="summary-header">
        <span></span>
        <button className="close-btn" onClick={onClose}>
          ˅
        </button>
      </div>
      <div className="summary-container">
        <h2>{podcast.title}</h2>
        <div className="infographic">
          <div className="info-section">
            <h3>📌 핵심 포인트</h3>
            <ul>
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="info-section">
            <h3>📊 주요 지표</h3>
            <div className="stat-grid">
              {summary.stats.map((stat, index) => (
                <div className="stat-card" key={index}>
                  <div className="number">{stat.number}</div>
                  <div className="label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="info-section">
            <h3>💡 다룬 주제</h3>
            <ul>
              {summary.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summary;
