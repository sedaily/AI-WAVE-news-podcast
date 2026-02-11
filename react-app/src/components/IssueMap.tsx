import type { PodcastKey } from '../types/podcast';
import { podcastData, issueNodes } from '../data/podcastData';
import type { IssueNode as IssueNodeType } from '../data/podcastData';

interface IssueMapProps {
  onSelectPodcast: (key: PodcastKey) => void;
}

function IssueMap({ onSelectPodcast }: IssueMapProps) {
  return (
    <div className="screen active" id="issueMap">
      <header>
        <h1>🎧 이슈캐스트</h1>
        <p className="subtitle">오늘의 핫이슈를 팟캐스트로</p>
      </header>
      <div className="issue-map-container">
        <div className="issue-map-header">
          <h2>오늘의 이슈 맵</h2>
          <p>하루 동안 가장 중요한 이슈들을 선정해서 보여드려요!</p>
        </div>
        <div className="issue-network">
          <NetworkLines nodes={issueNodes} />
          {issueNodes.map((node) => (
            <IssueNode
              key={node.key}
              node={node}
              keyword={podcastData[node.key].keyword}
              onClick={() => onSelectPodcast(node.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface NetworkLinesProps {
  nodes: IssueNodeType[];
}

function NetworkLines({ nodes }: NetworkLinesProps) {
  const lines: { x1: string; y1: string; x2: string; y2: string }[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      lines.push({
        x1: `${nodes[i].x}%`,
        y1: `${nodes[i].y}%`,
        x2: `${nodes[j].x}%`,
        y2: `${nodes[j].y}%`,
      });
    }
  }

  return (
    <svg className="network-lines">
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
        />
      ))}
    </svg>
  );
}

interface IssueNodeProps {
  node: IssueNodeType;
  keyword: string;
  onClick: () => void;
}

function IssueNode({ node, keyword, onClick }: IssueNodeProps) {
  return (
    <div
      className={`issue-node ${node.size}`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
        background: node.color,
      }}
      onClick={onClick}
    >
      {keyword}
    </div>
  );
}

export default IssueMap;
