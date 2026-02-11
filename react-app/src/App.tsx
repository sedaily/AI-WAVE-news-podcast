import { useState } from 'react';
import IssueMap from './components/IssueMap';
import Player from './components/Player';
import { useEconomyNews, type EconomyPodcast } from './hooks/useEconomyNews';
import './App.css';

function App() {
  const { podcasts, loading, error } = useEconomyNews();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelectPodcast = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClosePlayer = () => {
    setSelectedIndex(null);
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
            <span className="nav-link active">오늘의 경제</span>
            <span className="nav-link">인기 콘텐츠</span>
            <span className="nav-link">아카이브</span>
          </nav>
        </header>

        {loading && <div className="loading-message">뉴스를 불러오는 중...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && <IssueMap podcasts={podcasts} onSelectPodcast={handleSelectPodcast} />}
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
