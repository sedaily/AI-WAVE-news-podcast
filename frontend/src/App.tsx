import { useState, useEffect } from 'react';
import IssueMap from './components/IssueMap';
import Player from './components/Player';
import Archive from './components/Archive';
import CommunityFeed from './components/CommunityFeed';
import Onboarding from './components/Onboarding';
import InterestSettings from './components/InterestSettings';
import AuthModal from './components/auth/AuthModal';
import ChatBot from './components/ChatBot';
import DesignSystem from './components/DesignSystem';
import MorningBriefing from './components/MorningBriefing';
import { ToastProvider } from './components/toast';
import { ViewTransition } from './components/ViewTransition';
import { FloatingActionButton } from './components/FloatingActionButton';
import { useAuth } from './contexts/AuthContext';
import { useEconomyNews, type EconomyPodcast } from './hooks/useEconomyNews';
import { usePersonalizedPodcasts } from './hooks/usePersonalizedPodcasts';
import { isOnboardingCompleted } from './utils/interestPreferences';
import type { ArchivedPodcast } from './services/archiveService';
import './App.css';

type ViewMode = 'home' | 'explore' | 'library' | 'my' | 'design';

function App() {
  const { user, signOut, isConfigured } = useAuth();
  const { podcasts: rawPodcasts } = useEconomyNews();
  const { podcasts } = usePersonalizedPodcasts(rawPodcasts);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedArchivedPodcast, setSelectedArchivedPodcast] = useState<ArchivedPodcast | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // URL에 ?design 파라미터가 있으면 디자인 시스템 페이지 표시
    const params = new URLSearchParams(window.location.search);
    return params.has('design') ? 'design' : 'home';
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMorningBriefing, setShowMorningBriefing] = useState(false);

  // 첫 방문 체크
  useEffect(() => {
    setShowOnboarding(!isOnboardingCompleted());
  }, []);

  // 아침 브리핑 표시 체크 (6시-10시 사이, 오늘 안 봤으면)
  useEffect(() => {
    const checkMorningBriefing = () => {
      const hour = new Date().getHours();
      const today = new Date().toDateString();
      const dismissedDate = localStorage.getItem('morningBriefingDismissed');

      // 6시~10시 사이이고, 오늘 dismiss하지 않았으면 표시
      if (hour >= 6 && hour < 10 && dismissedDate !== today) {
        // 온보딩이 완료된 경우에만 표시
        if (isOnboardingCompleted()) {
          setShowMorningBriefing(true);
        }
      }
    };

    checkMorningBriefing();
  }, [showOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleSelectAndPlay = (index: number) => {
    setSelectedArchivedPodcast(null);
    setSelectedIndex(index);
    setTimeout(() => {
      const playButton = document.querySelector('.play-btn') as HTMLButtonElement;
      if (playButton && !playButton.disabled) {
        playButton.click();
      }
    }, 100);
  };

  const handlePlayArchivedPodcast = (podcast: ArchivedPodcast) => {
    setSelectedIndex(null);
    setSelectedArchivedPodcast(podcast);
    setTimeout(() => {
      const playButton = document.querySelector('.play-btn') as HTMLButtonElement;
      if (playButton && !playButton.disabled) {
        playButton.click();
      }
    }, 100);
  };

  const handleClosePlayer = () => {
    setSelectedIndex(null);
    setSelectedArchivedPodcast(null);
  };

  const handleCloseSettings = () => {
    setViewMode('my');
  };

  const selectedPodcast: EconomyPodcast | null = selectedArchivedPodcast
    ? selectedArchivedPodcast
    : (selectedIndex !== null ? podcasts[selectedIndex] : null);
  const isPlayerActive = selectedIndex !== null || selectedArchivedPodcast !== null;

  const handleToggleFabPlay = () => {
    // Click the play button in the player
    const playButton = document.querySelector('.play-btn') as HTMLButtonElement;
    if (playButton) {
      playButton.click();
      setIsPlaying(!isPlaying);
    }
  };

  const handleCloseMorningBriefing = () => {
    setShowMorningBriefing(false);
  };

  const handleDismissMorningBriefingToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem('morningBriefingDismissed', today);
    setShowMorningBriefing(false);
  };

  return (
    <ToastProvider>
    <div id="app">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Morning Briefing Overlay */}
      {showMorningBriefing && !showOnboarding && (
        <MorningBriefing
          onClose={handleCloseMorningBriefing}
          onDismissToday={handleDismissMorningBriefingToday}
        />
      )}

      {/* Home Screen */}
      <div className="home-screen">
        <header className="home-header">
          <div className="brand">
            <div className="brand-logo" />
            <span className="brand-name">뉴스캐스트</span>
          </div>
          {/* 바텀 네비게이션 - 4탭 구조 */}
          <nav className="bottom-nav">
            <button
              className={`bottom-nav-item ${viewMode === 'home' ? 'active' : ''}`}
              onClick={() => setViewMode('home')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="nav-label">홈</span>
            </button>
            <button
              className={`bottom-nav-item ${viewMode === 'explore' ? 'active' : ''}`}
              onClick={() => setViewMode('explore')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span className="nav-label">탐색</span>
            </button>
            <button
              className={`bottom-nav-item ${viewMode === 'library' ? 'active' : ''}`}
              onClick={() => setViewMode('library')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className="nav-label">보관함</span>
            </button>
            <button
              className={`bottom-nav-item ${viewMode === 'my' ? 'active' : ''}`}
              onClick={() => setViewMode('my')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="nav-label">MY</span>
            </button>
          </nav>
          {/* 데스크톱에서만 표시되는 프로필 버튼 */}
          <div className="profile-wrapper desktop-only">
            <button
              className={`profile-btn ${viewMode === 'my' || showProfileMenu ? 'active' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="내 프로필"
            >
              <div className="profile-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </button>
            {showProfileMenu && (
              <>
                <div className="profile-menu-backdrop" onClick={() => setShowProfileMenu(false)} />
                <div className="profile-menu">
                  {isConfigured && user && (
                    <div className="profile-menu-user">
                      <span className="profile-menu-email">{user.email.split('@')[0]}</span>
                    </div>
                  )}
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setViewMode('my');
                      setShowProfileMenu(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    내 프로필
                  </button>
                  {isConfigured && user ? (
                    <button
                      className="profile-menu-item logout"
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      로그아웃
                    </button>
                  ) : isConfigured && (
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        setShowAuthModal(true);
                        setShowProfileMenu(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      로그인
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        <ViewTransition viewKey={viewMode}>
          {/* 홈: 오늘의 브리핑 + 키워드맵 */}
          {viewMode === 'home' && (
            <IssueMap
              onPlayBriefing={podcasts.length > 0 ? () => handleSelectAndPlay(0) : undefined}
            />
          )}

          {/* 탐색: 카테고리별 탐색 + 커뮤니티 + 퀴즈 */}
          {viewMode === 'explore' && (
            <div className="explore-view">
              <CommunityFeed />
            </div>
          )}

          {/* 보관함: 저장한 콘텐츠 + 히스토리 */}
          {viewMode === 'library' && (
            <div className="library-view">
              <Archive onPlayPodcast={handlePlayArchivedPodcast} />
            </div>
          )}

          {/* MY: 프로필 + 설정 */}
          {viewMode === 'my' && (
            <div className="my-view">
              <InterestSettings onClose={handleCloseSettings} />
            </div>
          )}

          {viewMode === 'design' && <DesignSystem />}
        </ViewTransition>
      </div>

      {/* Player Screen */}
      {selectedPodcast && (
        <Player
          podcast={selectedPodcast}
          isActive={isPlayerActive}
          onClose={handleClosePlayer}
        />
      )}

      {/* Overlay */}
      <div
        className={`overlay ${isPlayerActive ? 'active' : ''}`}
        onClick={handleClosePlayer}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Chat Button */}
      <button
        className={`chat-fab ${showChatBot ? 'hidden' : ''}`}
        onClick={() => setShowChatBot(true)}
        title="뉴스 Q&A"
      >
        💬
      </button>

      {/* ChatBot */}
      <ChatBot isOpen={showChatBot} onClose={() => setShowChatBot(false)} />

      {/* Floating Action Button (Mobile) */}
      <FloatingActionButton
        isPlaying={isPlaying}
        onTogglePlay={handleToggleFabPlay}
        hasActiveEpisode={isPlayerActive}
        currentTitle={selectedPodcast?.title}
      />
    </div>
    </ToastProvider>
  );
}

export default App;
