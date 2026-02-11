import { useState } from 'react';
import IssueMap from './components/IssueMap';
import Player from './components/Player';
import type { PodcastKey } from './types/podcast';
import { podcastData } from './data/podcastData';
import './App.css';

function App() {
  const [selectedPodcastKey, setSelectedPodcastKey] = useState<PodcastKey | null>(null);

  const handleSelectPodcast = (key: PodcastKey) => {
    setSelectedPodcastKey(key);
  };

  const handleClosePlayer = () => {
    setSelectedPodcastKey(null);
  };

  const selectedPodcast = selectedPodcastKey ? podcastData[selectedPodcastKey] : null;
  const isPlayerActive = selectedPodcastKey !== null;

  return (
    <div id="app">
      {/* Home Screen */}
      <div className="home-screen">
        <header className="home-header">
          <div className="brand">
            <div className="brand-logo" />
            <span className="brand-name">이슈캐스트</span>
          </div>
          <nav className="home-nav">
            <span className="nav-link active">오늘의 이슈</span>
            <span className="nav-link">인기 콘텐츠</span>
            <span className="nav-link">아카이브</span>
          </nav>
        </header>

        <IssueMap onSelectPodcast={handleSelectPodcast} />
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
