import { useState } from 'react';
import IssueMap from './components/IssueMap';
import Player from './components/Player';
import Quiz from './components/Quiz';
import History from './components/History';
import { useEconomyNews, type EconomyPodcast } from './hooks/useEconomyNews';
import './App.css';

type ViewMode = 'news' | 'quiz' | 'history';

function App() {
  const { podcasts, loading, error } = useEconomyNews();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('news');

  const handleSelectPodcast = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClosePlayer = () => {
    setSelectedIndex(null);
  };

  const handleCloseQuiz = () => {
    setViewMode('news');
  };

  const handleCloseHistory = () => {
    setViewMode('news');
  };

  const selectedPodcast: EconomyPodcast | null = selectedIndex !== null ? podcasts[selectedIndex] : null;
  const isPlayerActive = selectedIndex !== null;

  return (
    <div id="app">
      {/* Home Screen */}
      <div className="home-screen">
        <header className="home-header">
          <div className="brand">
            <div className="brand-logo" />
            <span className="brand-name">경제뉴스캐스트</span>
          </div>
          <nav className="home-nav">
            <span 
              className={`nav-link ${viewMode === 'news' ? 'active' : ''}`}
              onClick={() => setViewMode('news')}
            >
              오늘의 경제
            </span>
            <span 
              className={`nav-link ${viewMode === 'quiz' ? 'active' : ''}`}
              onClick={() => setViewMode('quiz')}
            >
              10초 리마인드
            </span>
            <span 
              className={`nav-link ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              함께한 날들
            </span>
          </nav>
        </header>

        {viewMode === 'news' && (
          <>
            {loading && <div className="loading-message">뉴스를 불러오는 중...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && <IssueMap podcasts={podcasts} onSelectPodcast={handleSelectPodcast} />}
          </>
        )}
        
        {viewMode === 'quiz' && <Quiz onClose={handleCloseQuiz} />}
        
        {viewMode === 'history' && <History onClose={handleCloseHistory} />}
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
    </div>
  );
}

export default App;
