import type { PodcastKey } from '../types/podcast';
import { podcastData, issueNodes } from '../data/podcastData';

interface IssueMapProps {
  onSelectPodcast: (key: PodcastKey) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}분`;
}

function IssueMap({ onSelectPodcast }: IssueMapProps) {
  // Generate connection lines between nodes
  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
  ];

  return (
    <section className="issue-map-section">
      <div className="issue-map-title">
        <h1>오늘의 핵심 이슈</h1>
        <p>클릭하여 팟캐스트 듣기</p>
      </div>

      <div className="issue-network">
        {/* SVG Connection Lines */}
        <svg className="network-lines">
          {connections.map((conn, index) => {
            const fromNode = issueNodes[conn.from];
            const toNode = issueNodes[conn.to];
            return (
              <line
                key={index}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
              />
            );
          })}
        </svg>

        {/* Issue Nodes */}
        {issueNodes.map((node) => {
          const podcast = podcastData[node.key];
          return (
            <div
              key={node.key}
              className={`issue-node ${node.size}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `linear-gradient(135deg, ${node.color}40, ${node.color}20)`,
              }}
              onClick={() => onSelectPodcast(node.key)}
            >
              <div className="issue-node-inner">
                <span className="issue-node-keyword">{podcast.keyword}</span>
                <span className="issue-node-duration">{formatDuration(podcast.duration)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default IssueMap;
