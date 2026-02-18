import { useState } from 'react';
import './Community.css';

interface SimilarUser {
  id: string;
  displayName: string;
  similarityScore: number;
  commonInterests: string[];
}

interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  content: string;
  highlightId?: string;
  highlightText?: string;
  likeCount: number;
  createdAt: number;
}

interface SharedHighlight {
  id: string;
  userId: string;
  userDisplayName: string;
  text: string;
  memo?: string;
  likeCount: number;
  commentCount: number;
  createdAt: number;
}

interface CommunityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  similarUsers?: SimilarUser[];
  comments?: Comment[];
  sharedHighlights?: SharedHighlight[];
  onHighlightClick?: (highlightId: string) => void;
  onCommentSubmit?: (content: string) => void;
  onLike?: (type: 'comment' | 'highlight', id: string) => void;
}

type TabType = 'highlights' | 'comments' | 'people';

function CommunityPanel({
  isOpen,
  onClose,
  similarUsers = [],
  comments = [],
  sharedHighlights = [],
  onHighlightClick,
  onCommentSubmit,
  onLike,
}: CommunityPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('highlights');
  const [commentText, setCommentText] = useState('');

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onCommentSubmit?.(commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className={`community-panel ${isOpen ? 'open' : ''}`}>
      <div className="community-panel-header">
        <h3>커뮤니티</h3>
        <button className="community-panel-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="community-tabs">
        <button
          className={`community-tab ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          공유 하이라이트
        </button>
        <button
          className={`community-tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          댓글
        </button>
        <button
          className={`community-tab ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          비슷한 분들
        </button>
      </div>

      <div className="community-content">
        {activeTab === 'highlights' && (
          <>
            {sharedHighlights.length === 0 ? (
              <div className="community-empty">
                <div className="community-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                  </svg>
                </div>
                <h4>아직 공유된 하이라이트가 없어요</h4>
                <p>첫 번째로 하이라이트를 공유해보세요</p>
              </div>
            ) : (
              sharedHighlights.map((highlight) => (
                <div key={highlight.id} className="shared-highlight">
                  <div className="shared-highlight-header">
                    <div className="shared-highlight-avatar">
                      {getInitial(highlight.userDisplayName)}
                    </div>
                    <div className="shared-highlight-meta">
                      <div className="shared-highlight-author">
                        {highlight.userDisplayName}
                      </div>
                      <div className="shared-highlight-time">
                        {formatTimeAgo(highlight.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className="shared-highlight-content"
                    onClick={() => onHighlightClick?.(highlight.id)}
                  >
                    <p className="shared-highlight-text">"{highlight.text}"</p>
                  </div>
                  {highlight.memo && (
                    <p className="shared-highlight-memo">{highlight.memo}</p>
                  )}
                  <div className="shared-highlight-actions">
                    <button
                      className="shared-highlight-action"
                      onClick={() => onLike?.('highlight', highlight.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {highlight.likeCount}
                    </button>
                    <button className="shared-highlight-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {highlight.commentCount}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'comments' && (
          <div className="comment-thread">
            {comments.length === 0 ? (
              <div className="community-empty">
                <div className="community-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4>아직 댓글이 없어요</h4>
                <p>이 뉴스에 대한 생각을 나눠보세요</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {getInitial(comment.userDisplayName)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.userDisplayName}</span>
                      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    {comment.highlightText && (
                      <div
                        className="comment-highlight-ref"
                        onClick={() => comment.highlightId && onHighlightClick?.(comment.highlightId)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        </svg>
                        {comment.highlightText.slice(0, 30)}...
                      </div>
                    )}
                    <div className="comment-actions">
                      <button
                        className="comment-action"
                        onClick={() => onLike?.('comment', comment.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {comment.likeCount}
                      </button>
                      <button className="comment-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'people' && (
          <>
            <div className="similar-users-section">
              <div className="similar-users-header">
                <h4>비슷한 관심사를 가진 분들</h4>
              </div>
              {similarUsers.length === 0 ? (
                <div className="community-empty">
                  <div className="community-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h4>아직 매칭된 분이 없어요</h4>
                  <p>더 많은 뉴스를 들으면<br />비슷한 분들을 찾아드릴게요</p>
                </div>
              ) : (
                <div className="similar-users-list">
                  {similarUsers.map((user) => (
                    <div key={user.id} className="similar-user-card">
                      <div className="similar-user-avatar">
                        {getInitial(user.displayName)}
                      </div>
                      <div className="similar-user-name">{user.displayName}</div>
                      <div className="similar-user-score">
                        {Math.round(user.similarityScore * 100)}% 유사
                      </div>
                      <div className="similar-user-interests">
                        {user.commonInterests.slice(0, 2).map((interest, idx) => (
                          <span key={idx} className="interest-tag">{interest}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {activeTab === 'comments' && (
        <div className="comment-input-section">
          <div className="comment-input-wrapper">
            <textarea
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 남겨보세요..."
              rows={1}
            />
            <button
              className="comment-submit"
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityPanel;
