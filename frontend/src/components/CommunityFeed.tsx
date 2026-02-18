import { useState, useEffect } from 'react';
import {
  getSharedThoughts,
  toggleLike,
  type SharedThought
} from '../services/communityService';
import {
  fetchSedailyArticles,
  filterEconomicArticles,
  type SedailyArticle
} from '../services/sedailyService';
import './CommunityFeed.css';

interface CommunityFeedProps {
  onNavigateToPodcast?: (keyword: string, date: string) => void;
}

function CommunityFeed({ onNavigateToPodcast }: CommunityFeedProps) {
  const [thoughts, setThoughts] = useState<SharedThought[]>([]);
  const [filter, setFilter] = useState<'all' | 'popular' | 'latest'>('all');
  const [room, setRoom] = useState<'general' | 'expert'>('general');
  const [selectedPost, setSelectedPost] = useState<SharedThought | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SedailyArticle | null>(null);
  const [commentText, setCommentText] = useState('');
  const [expertArticles, setExpertArticles] = useState<SedailyArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  useEffect(() => {
    loadThoughts();
  }, []);

  // 전문가 룸 진입 시 기사 로드
  useEffect(() => {
    if (room === 'expert' && expertArticles.length === 0) {
      loadExpertArticles();
    }
  }, [room]);

  const loadExpertArticles = async () => {
    setIsLoadingArticles(true);
    try {
      const articles = await fetchSedailyArticles(3); // 최근 3일
      // 경제/금융/증권/부동산 관련 기사만 필터링
      const economicArticles = filterEconomicArticles(articles);
      setExpertArticles(economicArticles.slice(0, 30)); // 상위 30개
      console.log(`[Expert] Filtered ${economicArticles.length} economic articles from ${articles.length} total`);
    } catch (error) {
      console.error('Failed to load expert articles:', error);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const loadThoughts = () => {
    const allThoughts = getSharedThoughts();
    setThoughts(allThoughts);
  };

  const handleLike = (thoughtId: string) => {
    toggleLike(thoughtId);
    setThoughts(prev => prev.map(t => {
      if (t.id === thoughtId) {
        const updated = {
          ...t,
          isLiked: !t.isLiked,
          likeCount: t.isLiked ? t.likeCount - 1 : t.likeCount + 1
        };
        // 상세 모달에서도 업데이트
        if (selectedPost?.id === thoughtId) {
          setSelectedPost(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  const filteredThoughts = filter === 'popular'
    ? [...thoughts].sort((a, b) => b.likeCount - a.likeCount)
    : filter === 'latest'
    ? [...thoughts].reverse()
    : thoughts;

  // 인기글 여부 (좋아요 5개 이상)
  const isHot = (likeCount: number) => likeCount >= 5;

  return (
    <div className="community-feed">
      {/* 헤더 */}
      <div className="feed-header">
        <h2>커뮤니티</h2>
        <div className="feed-stats">
          <span className="stat-live"></span>
          <span>{room === 'general' ? '1,523' : '47'}명 접속중</span>
        </div>
      </div>

      {/* 룸 선택 세그먼트 */}
      <div className="room-segment">
        <button
          className={`room-btn ${room === 'general' ? 'active' : ''}`}
          onClick={() => setRoom('general')}
        >
          일반
        </button>
        <button
          className={`room-btn ${room === 'expert' ? 'active' : ''}`}
          onClick={() => setRoom('expert')}
        >
          <span>전문가</span>
          {room !== 'expert' && <span className="expert-badge">PRO</span>}
        </button>
        <div className={`room-indicator ${room}`} />
      </div>

      {/* 필터 - 우측 dot 스타일 */}
      <div className="feed-filter-row">
        <div className="filter-options">
          <button
            className={`filter-option ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-dot" />
            전체
          </button>
          <button
            className={`filter-option ${filter === 'latest' ? 'active' : ''}`}
            onClick={() => setFilter('latest')}
          >
            <span className="filter-dot" />
            최신순
          </button>
          <button
            className={`filter-option ${filter === 'popular' ? 'active' : ''}`}
            onClick={() => setFilter('popular')}
          >
            <span className="filter-dot" />
            인기순
          </button>
        </div>
      </div>

      {/* 게시글 리스트 */}
      <div className="post-list">
        {room === 'general' ? (
          // 일반 사용자 게시글
          filteredThoughts.map(thought => (
            <article
              key={thought.id}
              className="post-item"
              onClick={() => setSelectedPost(thought)}
            >
              <div className="post-main">
                {isHot(thought.likeCount) && (
                  <span className="tag-hot">HOT</span>
                )}
                <p className="post-content">{thought.content}</p>
                <div
                  className="post-keyword"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToPodcast?.(thought.podcastKeyword, thought.podcastDate);
                  }}
                >
                  #{thought.podcastKeyword}
                </div>
              </div>
              <div className="post-meta">
                <div className="meta-left">
                  <span className="author">{thought.user.displayName}</span>
                  <span className="divider">·</span>
                  <span className="time">{thought.listenedAt}</span>
                </div>
                <div className="meta-right">
                  <button
                    className={`meta-btn ${thought.isLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(thought.id);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={thought.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{thought.likeCount}</span>
                  </button>
                  <button
                    className="meta-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(thought);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>0</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          // 전문가 기사 (빅카인즈)
          isLoadingArticles ? (
            <div className="loading-articles">
              <div className="loading-spinner" />
              <span>경제 전문 기사를 불러오는 중...</span>
            </div>
          ) : expertArticles.length > 0 ? (
            expertArticles.map(article => (
              <article
                key={article.id}
                className="post-item expert-article"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="article-header">
                  <span className="article-provider">서울경제</span>
                  <span className="article-date">{article.publishedAt}</span>
                </div>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-summary">
                  {article.content.substring(0, 120)}...
                </p>
                <div className="article-meta">
                  <span className="article-byline">{article.writer}</span>
                  <span className="article-category">{article.category}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-articles">
              <p>기사를 불러올 수 없습니다</p>
              <button onClick={loadExpertArticles}>다시 시도</button>
            </div>
          )
        )}
      </div>

      {/* 글쓰기 유도 (간단하게) */}
      <div className="write-cta">
        <p>플레이어에서 공유 버튼을 눌러 의견을 남겨보세요</p>
      </div>

      {/* 전문가 기사 상세 모달 */}
      {selectedArticle && (
        <>
          <div className="post-detail-overlay" onClick={() => setSelectedArticle(null)} />
          <div className="post-detail-sheet article-detail">
            <div className="post-detail-header">
              <button className="post-detail-close" onClick={() => setSelectedArticle(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <span className="post-detail-title">서울경제</span>
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link-btn"
                onClick={(e) => e.stopPropagation()}
              >
                원문
              </a>
            </div>

            <div className="post-detail-body">
              <div className="article-detail-header">
                <span className="article-category-badge">{selectedArticle.category}</span>
                <span className="article-date">{selectedArticle.publishedAt}</span>
              </div>

              <h2 className="article-detail-title">{selectedArticle.title}</h2>

              <div className="article-detail-byline">
                <span>{selectedArticle.writer}</span>
                <span className="verified-badge">서울경제 기자</span>
              </div>

              <div className="article-detail-content">
                {selectedArticle.content}
              </div>

              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="read-full-btn"
              >
                서울경제에서 보기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </div>
          </div>
        </>
      )}

      {/* 게시글 상세 모달 */}
      {selectedPost && (
        <>
          <div className="post-detail-overlay" onClick={() => setSelectedPost(null)} />
          <div className="post-detail-sheet">
            {/* 헤더 */}
            <div className="post-detail-header">
              <button className="post-detail-close" onClick={() => setSelectedPost(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <span className="post-detail-title">게시글</span>
              <div style={{ width: 32 }} />
            </div>

            {/* 본문 */}
            <div className="post-detail-body">
              {/* 작성자 정보 */}
              <div className="post-detail-author">
                <div className="author-avatar">
                  {selectedPost.user.displayName.charAt(0)}
                </div>
                <div className="author-info">
                  <span className="author-name">
                    {selectedPost.user.displayName}
                    {room === 'expert' && <span className="author-badge">서울경제</span>}
                  </span>
                  <span className="author-time">{selectedPost.listenedAt}</span>
                </div>
              </div>

              {/* 내용 */}
              <p className="post-detail-content">{selectedPost.content}</p>

              {/* 관련 팟캐스트 */}
              <div
                className="post-detail-podcast"
                onClick={() => {
                  onNavigateToPodcast?.(selectedPost.podcastKeyword, selectedPost.podcastDate);
                  setSelectedPost(null);
                }}
              >
                <span className="podcast-label">관련 브리핑</span>
                <span className="podcast-keyword">#{selectedPost.podcastKeyword}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>

              {/* 액션 버튼 */}
              <div className="post-detail-actions">
                <button
                  className={`action-btn ${selectedPost.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(selectedPost.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={selectedPost.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>좋아요 {selectedPost.likeCount}</span>
                </button>
              </div>

              {/* 댓글 섹션 */}
              <div className="post-detail-comments">
                <h4>댓글</h4>
                <div className="comments-empty">
                  <p>아직 댓글이 없습니다</p>
                  <span>첫 번째 댓글을 남겨보세요</span>
                </div>
              </div>
            </div>

            {/* 댓글 입력 */}
            <div className="post-detail-input">
              <input
                type="text"
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                className="send-btn"
                disabled={!commentText.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CommunityFeed;
