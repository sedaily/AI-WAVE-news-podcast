import { useState, useRef, useEffect } from 'react';
import type { EconomyPodcast } from '../hooks/useEconomyNews';

interface IssueMapProps {
  podcasts: EconomyPodcast[];
  onSelectPodcast: (index: number) => void;
}

interface NodePosition {
  x: number;
  y: number;
  size: 'large' | 'medium';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}분`;
}

// 초기 노드 위치 (최대 4개)
const initialNodePositions: NodePosition[] = [
  { x: 30, y: 35, size: 'large' },
  { x: 70, y: 40, size: 'large' },
  { x: 25, y: 75, size: 'large' },
  { x: 75, y: 80, size: 'large' },
];

const nodeColors = ['#6b9b8e', '#8b7ba8', '#7ba3c0', '#7cb89d'];

function IssueMap({ podcasts, onSelectPodcast }: IssueMapProps) {
  const [nodePositions, setNodePositions] = useState<NodePosition[]>(initialNodePositions);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMoved = useRef(false);

  // Generate connection lines between all nodes
  const connections: { from: number; to: number }[] = [];
  
  for (let i = 0; i < Math.min(podcasts.length, 4); i++) {
    for (let j = i + 1; j < Math.min(podcasts.length, 4); j++) {
      connections.push({ from: i, to: j });
    }
  }

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setDraggingIndex(index);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingIndex === null || !containerRef.current || !dragStartPos.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    // 5px 이상 움직이면 드래그로 간주
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved.current = true;
    }

    if (!hasMoved.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - rect.top) / rect.height) * 100;

    // 경계 체크 (5% ~ 95%)
    const clampedX = Math.max(5, Math.min(95, newX));
    const clampedY = Math.max(5, Math.min(95, newY));

    setNodePositions(prev => {
      const newPositions = [...prev];
      newPositions[draggingIndex] = {
        ...newPositions[draggingIndex],
        x: clampedX,
        y: clampedY,
      };
      return newPositions;
    });
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null && !hasMoved.current) {
      // 드래그하지 않고 클릭만 했을 때
      onSelectPodcast(draggingIndex);
    }
    
    setDraggingIndex(null);
    dragStartPos.current = null;
    hasMoved.current = false;
  };

  // 전역 이벤트 리스너
  useEffect(() => {
    if (draggingIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingIndex]);

  return (
    <section className="issue-map-section">
      <div className="issue-map-title">
        <h1>오늘의 경제 뉴스</h1>
        <p>클릭하여 팟캐스트 듣기 • 드래그하여 위치 조정</p>
      </div>

      <div className="issue-network" ref={containerRef}>
        {/* SVG Connection Lines */}
        <svg className="network-lines">
          {connections.map((conn) => {
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
          const isDragging = draggingIndex === index;
          
          return (
            <div
              key={podcast.title}
              className={`issue-node ${pos.size} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
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
