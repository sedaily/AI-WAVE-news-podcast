import { formatDateFull, type TopicGroup, type ArchivedPodcast } from '../services/archiveService';

interface TopicDetailProps {
  topicGroup: TopicGroup;
  onBack: () => void;
  onPlayPodcast: (podcast: ArchivedPodcast) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function TopicDetail({ topicGroup, onBack, onPlayPodcast }: TopicDetailProps) {
  // 날짜별로 그룹핑
  const episodesByDate = new Map<string, ArchivedPodcast[]>();

  topicGroup.episodes.forEach(episode => {
    if (!episodesByDate.has(episode.date)) {
      episodesByDate.set(episode.date, []);
    }
    episodesByDate.get(episode.date)!.push(episode);
  });

  const sortedDates = Array.from(episodesByDate.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="topic-detail-container">
      <div className="topic-detail-header">
        <button className="back-btn" onClick={onBack}>
          <span>←</span>
          <span>뒤로</span>
        </button>
        <div className="topic-detail-title">
          <h2>{topicGroup.topic}</h2>
          <p>{topicGroup.episodeCount}개 에피소드</p>
        </div>
      </div>

      <div className="topic-detail-hero" style={{ '--hero-color': topicGroup.coverColor } as React.CSSProperties}>
        <div className="hero-gradient" />
        <div className="hero-content">
          <span className="hero-keyword">{topicGroup.topic}</span>
          <p className="hero-description">
            최근 2주간의 {topicGroup.topic} 관련 브리핑을 모아봤어요
          </p>
        </div>
      </div>

      <div className="episode-list">
        {sortedDates.map(date => (
          <div key={date} className="date-group">
            <div className="date-label">{formatDateFull(date)}</div>
            {episodesByDate.get(date)!.map((episode, index) => (
              <div
                key={`${date}-${index}`}
                className="episode-card"
                onClick={() => onPlayPodcast(episode)}
              >
                <div
                  className="episode-thumbnail"
                  style={{ background: `linear-gradient(135deg, ${episode.coverColor}60, ${episode.coverColor}30)` }}
                >
                  <span className="play-icon">▶</span>
                </div>
                <div className="episode-info">
                  <h4 className="episode-title">{episode.title}</h4>
                  <div className="episode-meta">
                    <span className="episode-duration">{formatDuration(episode.duration)}</span>
                    {episode.summary?.keyPoints?.[0] && (
                      <span className="episode-summary">{episode.summary.keyPoints[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopicDetail;
