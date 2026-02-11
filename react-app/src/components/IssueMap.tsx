import { useState, useRef, useEffect } from 'react';
import type { PodcastKey } from '../types/podcast';
import { podcastData, issueNodes as initialNodes } from '../data/podcastData';

interface IssueMapProps {
  onSelectPodcast: (key: PodcastKey) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}분`;
}

function IssueMap({ onSelectPodcast }: IssueMapProps) {
  const [nodes, setNodes] = useState(() => 
    initialNodes.map((node, i) => ({
      ...node,
      angle: (Math.PI * 2 * i) / initialNodes.length,
      radius: 20 + Math.random() * 15,
      speed: 0.00005 + Math.random() * 0.00003,
      isDragged: false,
    }))
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (dragging === null) {
        setNodes(prev => prev.map(node => {
          if (node.isDragged) return node;
          const newAngle = node.angle + node.speed;
          return {
            ...node,
            angle: newAngle,
            x: 50 + Math.cos(newAngle) * node.radius,
            y: 50 + Math.sin(newAngle) * node.radius,
          };
        }));
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [dragging]);

  const getNodeRadius = (size: string) => {
    if (size === 'large') return 70;
    if (size === 'medium') return 55;
    return 42.5;
  };

  const connections = [
    { from: 0, to: 1, weight: 0.8 },
    { from: 0, to: 2, weight: 0.1 },
    { from: 1, to: 3, weight: 0.4 },
    { from: 2, to: 3, weight: 0.4 },
    { from: 0, to: 3, weight: 0.9 },
    { from: 1, to: 2, weight: 0.9 },
  ];

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(index);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null || !containerRef.current) return;

    setHasDragged(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNodes(prev => prev.map((node, i) => 
      i === dragging ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)), isDragged: true } : node
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleClick = (key: PodcastKey, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasDragged) {
      onSelectPodcast(key);
    }
  };

  return (
    <section className="issue-map-section">
      <div className="issue-map-title">
        <h1>오늘의 핵심 이슈</h1>
        <p>클릭하여 팟캐스트 듣기</p>
      </div>

      <div 
        className="issue-network"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="network-lines" width="100%" height="100%">
          {connections.map((conn, index) => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) return null;
            
            const fromRadius = getNodeRadius(fromNode.size) / 7;
            const toRadius = getNodeRadius(toNode.size) / 7;
            
            const x1 = fromNode.x + (dx / distance) * fromRadius;
            const y1 = fromNode.y + (dy / distance) * fromRadius;
            const x2 = toNode.x - (dx / distance) * toRadius;
            const y2 = toNode.y - (dy / distance) * toRadius;
            
            return (
              <line
                key={index}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#ffffff"
                strokeWidth={2 + conn.weight * 18}
                opacity={0.2 + conn.weight * 0.4}
                style={{ strokeWidth: `${2 + conn.weight * 18}px` }}
              />
            );
          })}
        </svg>

        {nodes.map((node, index) => {
          const podcast = podcastData[node.key];
          const isDragging = dragging === index;
          return (
            <div
              key={index}
              className={`issue-node ${node.size} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(-50%, -50%) scale(${isDragging ? 1.1 : 1})`,
                background: `linear-gradient(135deg, ${node.color}40, ${node.color}20)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'all 0.3s ease-out',
                zIndex: isDragging ? 1000 : 1,
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              onMouseDown={(e) => handleMouseDown(index, e)}
              onClick={(e) => handleClick(node.key, e)}
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
