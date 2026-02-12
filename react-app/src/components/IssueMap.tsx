import type { EconomyPodcast } from '../hooks/useEconomyNews';

interface IssueMapProps {
  podcasts: EconomyPodcast[];
  onSelectPodcast: (index: number) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}분`;
}

// 노드 위치 (최대 4개)
const nodePositions = [
  { x: 30, y: 35, size: 'large' as const },
  { x: 70, y: 40, size: 'large' as const },
  { x: 25, y: 75, size: 'medium' as const },
  { x: 75, y: 80, size: 'medium' as const },
];

const nodeColors = ['#6b9b8e', '#8b7ba8', '#7ba3c0', '#7cb89d'];

function IssueMap({ podcasts, onSelectPodcast }: IssueMapProps) {
  // Generate connection lines between all nodes
  const connections: { from: number; to: number }[] = [];
  
  // 모든 노드 간 연결선 생성
  for (let i = 0; i < Math.min(podcasts.length, 4); i++) {
    for (let j = i + 1; j < Math.min(podcasts.length, 4); j++) {
      connections.push({ from: i, to: j });
    }
  }

  return (
    <section className="issue-map-section">
      <div className="issue-map-title">
        <h1>오늘의 경제 뉴스</h1>
        <p>클릭하여 팟캐스트 듣기</p>
      </div>

      <div className="issue-network">
        {/* SVG Connection Lines */}
        <svg className="network-lines">
          {connections.map((conn, index) => {
            const fromNode = nodePositions[conn.from];
            const toNode = nodePositions[conn.to];
            return (
              <line
                key={`${conn.from}-${conn.to}`}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Issue Nodes */}
        {podcasts.slice(0, 4).map((podcast, index) => {
          const pos = nodePositions[index];
          const color = nodeColors[index];
          return (
            <div
              key={podcast.title}
              className={`issue-node ${pos.size}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `linear-gradient(135deg, ${color}40, ${color}20)`,
              }}
              onClick={() => onSelectPodcast(index)}
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
