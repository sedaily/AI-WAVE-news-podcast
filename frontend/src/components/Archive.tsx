import { useState, useEffect } from 'react';
import {
  fetchAllArchivedPodcasts,
  formatDateFull,
  type ArchivedPodcast
} from '../services/archiveService';

// Warm muted cover colors that match the Japanese aesthetic
const warmCoverColors = [
  '#8b7355', // warm brown
  '#6b7c6b', // muted sage
  '#7d6b5d', // taupe
  '#5d6b6b', // muted teal
  '#8b7b6b', // sand brown
  '#6b6b7b', // muted slate
  '#7b6b6b', // dusty rose
  '#6b7b7b', // gray green
];
import {
  getBookmarks,
  toggleBookmark,
  isBookmarkedPodcast,
  type BookmarkedPodcast
} from '../services/bookmarkService';
import './Archive.css';

interface ArchiveProps {
  onPlayPodcast: (podcast: ArchivedPodcast) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

type TabType = 'all' | 'bookmarks';

function Archive({ onPlayPodcast }: ArchiveProps) {
  const [episodesByDate, setEpisodesByDate] = useState<Map<string, ArchivedPodcast[]>>(new Map());
  const [bookmarks, setBookmarks] = useState<BookmarkedPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [bookmarkUpdated, setBookmarkUpdated] = useState(0);

  useEffect(() => {
    async function loadArchive() {
      setLoading(true);
      try {
        const podcasts = await fetchAllArchivedPodcasts(14);

        // 날짜별로 그룹핑
        const grouped = new Map<string, ArchivedPodcast[]>();
        podcasts.forEach(podcast => {
          if (!grouped.has(podcast.date)) {
            grouped.set(podcast.date, []);
          }
          grouped.get(podcast.date)!.push(podcast);
        });

        setEpisodesByDate(grouped);
        setBookmarks(getBookmarks());
      } catch (error) {
        console.error('Failed to load archive:', error);
      } finally {
        setLoading(false);
      }
    }

    loadArchive();
  }, []);

  // 북마크 업데이트 시 리로드
  useEffect(() => {
    setBookmarks(getBookmarks());
  }, [bookmarkUpdated]);

  const handleBookmarkToggle = (episode: ArchivedPodcast, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = `${episode.date}-${episode.keyword}`;
    toggleBookmark({
      id,
      date: episode.date,
      keyword: episode.keyword,
      title: episode.title,
      audioUrl: episode.audioUrl,
      coverColor: episode.coverColor,
      duration: episode.duration
    });
    setBookmarkUpdated(prev => prev + 1);
  };

  const sortedDates = Array.from(episodesByDate.keys()).sort((a, b) => b.localeCompare(a));

  const renderEpisodeCard = (episode: ArchivedPodcast, index: number, showDate = false) => {
    const id = `${episode.date}-${episode.keyword}`;
    const isBookmarked = isBookmarkedPodcast(id);
    const coverColor = warmCoverColors[index % warmCoverColors.length];

    return (
      <div
        key={`${episode.date}-${index}`}
        className="library-card"
        onClick={() => onPlayPodcast(episode)}
      >
        <div
          className="library-card-cover"
          style={{ background: `linear-gradient(145deg, ${coverColor}, ${coverColor}dd)` }}
        >
          <div className="library-card-duration">{formatDuration(episode.duration)}</div>
          <button
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={(e) => handleBookmarkToggle(episode, e)}
            aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
        <div className="library-card-info">
          <h4 className="library-card-title">{episode.keyword}</h4>
          <p className="library-card-desc">{episode.title}</p>
          {showDate && (
            <span className="library-card-date">{formatDateFull(episode.date)}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="library-container">
      {/* 헤더 */}
      <div className="library-header">
        <h2>내 서재</h2>
        <p>경제 브리핑을 모아보세요</p>
      </div>

      {/* 탭 */}
      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체
        </button>
        <button
          className={`library-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          북마크 {bookmarks.length > 0 && <span className="badge">{bookmarks.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="library-loading">
          <div className="loading-spinner" />
          <p>불러오는 중...</p>
        </div>
      ) : activeTab === 'bookmarks' ? (
        /* 북마크 탭 */
        <div className="library-content">
          {bookmarks.length === 0 ? (
            <div className="library-empty">
              <span className="empty-icon">☆</span>
              <p>북마크한 브리핑이 없어요</p>
              <span className="empty-hint">마음에 드는 브리핑에 ★를 눌러보세요</span>
            </div>
          ) : (
            <div className="library-grid">
              {bookmarks.map((bookmark, index) => {
                const episode: ArchivedPodcast = {
                  keyword: bookmark.keyword,
                  title: bookmark.title,
                  duration: bookmark.duration,
                  audioUrl: bookmark.audioUrl,
                  coverColor: bookmark.coverColor,
                  coverImage: '',
                  chartHeights: [60, 85, 45, 70, 55, 90],
                  summary: { keyPoints: [], stats: [], topics: [] },
                  transcript: [],
                  relatedKeywords: [],
                  date: bookmark.date
                };
                return renderEpisodeCard(episode, index, true);
              })}
            </div>
          )}
        </div>
      ) : (
        /* 전체 탭 */
        <div className="library-content">
          {sortedDates.map(date => (
            <div key={date} className="library-date-section">
              <div className="library-date-header">
                <span className="date-label">{formatDateFull(date)}</span>
                <span className="date-count">{episodesByDate.get(date)!.length}개</span>
              </div>
              <div className="library-grid">
                {episodesByDate.get(date)!.map((episode, index) =>
                  renderEpisodeCard(episode, index)
                )}
              </div>
            </div>
          ))}

          {sortedDates.length === 0 && (
            <div className="library-empty">
              <p>아카이브된 브리핑이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Archive;
