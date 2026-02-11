import { useState } from 'react';
import IssueMap from './components/IssueMap';
import Player from './components/Player';
import Summary from './components/Summary';
import type { PodcastKey } from './types/podcast';
import { podcastData } from './data/podcastData';
import './App.css';

type Screen = 'issueMap' | 'player' | 'summary';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('issueMap');
  const [selectedPodcastKey, setSelectedPodcastKey] = useState<PodcastKey | null>(null);

  const handleSelectPodcast = (key: PodcastKey) => {
    setSelectedPodcastKey(key);
    setCurrentScreen('player');
  };

  const handleClosePlayer = () => {
    setCurrentScreen('issueMap');
  };

  const handleShowSummary = () => {
    setCurrentScreen('summary');
  };

  const handleCloseSummary = () => {
    setCurrentScreen('player');
  };

  const selectedPodcast = selectedPodcastKey ? podcastData[selectedPodcastKey] : null;

  return (
    <div id="app">
      {currentScreen === 'issueMap' && (
        <IssueMap onSelectPodcast={handleSelectPodcast} />
      )}

      {selectedPodcast && (
        <>
          <Player
            podcast={selectedPodcast}
            isActive={currentScreen === 'player'}
            onClose={handleClosePlayer}
            onShowSummary={handleShowSummary}
          />
          <Summary
            podcast={selectedPodcast}
            isActive={currentScreen === 'summary'}
            onClose={handleCloseSummary}
          />
        </>
      )}
    </div>
  );
}

export default App;
