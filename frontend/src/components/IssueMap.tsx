import { useState, useRef, useEffect, useCallback } from 'react';
import {
  forceSimulation,
  forceCollide,
  forceManyBody,
  forceCenter,
  type Simulation,
  type SimulationNodeDatum
} from 'd3-force';
import { useBigKindsKeywords, type BigKindsKeyword } from '../hooks/useBigKindsKeywords';
import { fetchNewsByIds, type NewsArticle } from '../services/bigkindsService';

// Overnight Data API
const OVERNIGHT_API_URL = import.meta.env.VITE_OVERNIGHT_API_URL || 'https://csh5ye72kne43tqupebtnn7jte0opzvb.lambda-url.ap-northeast-2.on.aws';

interface OvernightData {
  bok: {
    usdKrw?: { value: number };
    baseRate?: { value: number };
  } | null;
  usMarket: {
    'S&P 500'?: { price: string; changePercent: string };
    'NASDAQ'?: { price: string; changePercent: string };
    'Bitcoin'?: { price: string; changePercent: string };
  } | null;
}

// 연관 키워드 기반 연결 관계
interface KeywordConnection {
  sourceIdx: number;
  targetIdx: number;
  weight: number;  // 연관도 (공통 키워드 수 등)
  reason: 'direct' | 'shared';  // 직접 연관 or 공통 키워드
}

interface IssueMapProps {
  onPlayBriefing?: () => void;
}

interface NodeData extends SimulationNodeDatum {
  id: string;
  keyword: string;
  newsCount: number;
  index: number;
  radius: number;
}

function formatNewsCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return `${count}건`;
}

// 프리미엄 파스텔 컬러 팔레트
const keywordColors = [
  '#818cf8', // 소프트 인디고
  '#34d399', // 민트 그린
  '#fb923c', // 웜 오렌지
  '#a78bfa', // 라벤더
  '#38bdf8', // 스카이 블루
  '#f472b6', // 로즈 핑크
  '#4ade80', // 프레시 그린
  '#fbbf24', // 골든 옐로우
];

function IssueMap({ onPlayBriefing }: IssueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation<NodeData, undefined> | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragNode = useRef<NodeData | null>(null);
  const hasDragged = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const DRAG_THRESHOLD = 5; // 5px 이상 움직여야 드래그로 인식
  const [selectedKeyword, setSelectedKeyword] = useState<BigKindsKeyword | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [keywordConnections, setKeywordConnections] = useState<KeywordConnection[]>([]);

  // Overnight briefing data
  const [overnightData, setOvernightData] = useState<OvernightData | null>(null);
  const [overnightLoading, setOvernightLoading] = useState(true);

  // BigKinds 키워드 가져오기
  const { keywords: bigKindsKeywords, loading: keywordsLoading } = useBigKindsKeywords();

  // Overnight data 가져오기
  useEffect(() => {
    const fetchOvernightData = async () => {
      try {
        const response = await fetch(`${OVERNIGHT_API_URL}/overnight/data`);
        if (response.ok) {
          const data = await response.json();
          setOvernightData(data);
        }
      } catch (error) {
        console.error('Failed to fetch overnight data:', error);
      } finally {
        setOvernightLoading(false);
      }
    };
    fetchOvernightData();
  }, []);

  // relatedKeywords 필드를 활용해서 노드 연결 계산 (추가 API 호출 없음)
  useEffect(() => {
    if (bigKindsKeywords.length === 0) return;

    // 반응형: 화면 크기에 따라 노드 개수 조정
    const isMobile = dimensions.width < 500;
    const isTablet = dimensions.width >= 500 && dimensions.width < 768;
    const maxNodes = isMobile ? 6 : isTablet ? 8 : 12;
    const displayKeywords = bigKindsKeywords.slice(0, maxNodes);
    const connections: KeywordConnection[] = [];
    const addedPairs = new Set<string>();

    // 각 키워드 쌍 검사
    for (let i = 0; i < displayKeywords.length; i++) {
      const kwA = displayKeywords[i];
      const relatedA = kwA.relatedKeywords?.map(k => k.toLowerCase()) || [];

      for (let j = i + 1; j < displayKeywords.length; j++) {
        const kwB = displayKeywords[j];
        const relatedB = kwB.relatedKeywords?.map(k => k.toLowerCase()) || [];
        const pairKey = `${i}-${j}`;

        if (addedPairs.has(pairKey)) continue;

        let weight = 0;
        let reason: 'direct' | 'shared' = 'shared';

        // 1. 직접 연관: A의 연관키워드에 B가 있거나, B의 연관키워드에 A가 있음
        const aNameLower = kwA.keyword.toLowerCase();
        const bNameLower = kwB.keyword.toLowerCase();

        if (relatedA.includes(bNameLower)) {
          weight += 3;  // 직접 연관은 가중치 높게
          reason = 'direct';
        }
        if (relatedB.includes(aNameLower)) {
          weight += 3;
          reason = 'direct';
        }

        // 2. 공유 연관어: A와 B가 같은 연관키워드를 공유
        const sharedKeywords = relatedA.filter(k => relatedB.includes(k));
        weight += sharedKeywords.length;

        // 가중치가 있으면 연결
        if (weight > 0) {
          connections.push({
            sourceIdx: i,
            targetIdx: j,
            weight: Math.min(weight, 10),
            reason
          });
          addedPairs.add(pairKey);
        }
      }
    }
    setKeywordConnections(connections);
  }, [bigKindsKeywords, dimensions.width]);

  // 컨테이너 크기 측정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 300),
          height: Math.max(rect.height, 400)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Force simulation 초기화 - BigKinds 키워드만 표시
  useEffect(() => {
    if (bigKindsKeywords.length === 0) return;

    // 반응형: 화면 크기에 따른 설정
    const isMobile = dimensions.width < 500;
    const isTablet = dimensions.width >= 500 && dimensions.width < 768;

    // 모바일/태블릿에서는 노드 개수 줄이기
    const maxNodes = isMobile ? 4 : isTablet ? 6 : 10;
    const displayKeywords = bigKindsKeywords.slice(0, maxNodes);
    const totalNodeCount = displayKeywords.length;

    // 뉴스 건수 범위 계산 (노드 크기 정규화용)
    const newsCounts = displayKeywords.map(k => k.newsCount);
    const maxNews = Math.max(...newsCounts, 1);
    const minNews = Math.min(...newsCounts, 0);
    const newsRange = maxNews - minNews || 1;

    // 노드 생성
    const newNodes: NodeData[] = [];

    // 반응형 노드 크기 - 모바일은 더 작게
    const minRadius = isMobile ? 32 : isTablet ? 36 : 28;
    const maxRadius = isMobile ? 52 : isTablet ? 60 : 85;

    displayKeywords.forEach((kw, i) => {
      const angle = (i / totalNodeCount) * Math.PI * 2 - Math.PI / 2;
      const spreadRadius = Math.min(dimensions.width, dimensions.height) * (isMobile ? 0.28 : 0.35);

      // 뉴스 건수 기반 크기 계산 (정규화 + 제곱근으로 차이 강조)
      const normalizedSize = Math.sqrt((kw.newsCount - minNews) / newsRange);
      const radius = minRadius + (maxRadius - minRadius) * normalizedSize;

      newNodes.push({
        id: `keyword-${i}`,
        keyword: kw.keyword,
        newsCount: kw.newsCount,
        index: i,
        radius: radius,
        x: dimensions.width / 2 + Math.cos(angle) * spreadRadius + (Math.random() - 0.5) * 50,
        y: dimensions.height / 2 + Math.sin(angle) * spreadRadius + (Math.random() - 0.5) * 50,
      });
    });

    setNodes(newNodes);

    // 반응형 충돌 패딩 - 모바일에서 더 넓게
    const collisionPadding = isMobile ? 18 : isTablet ? 16 : 20;
    const chargeStrength = isMobile ? -150 : -120;

    // Force 시뮬레이션 - 링크 없이 단순화 (충돌 + 반발력 + 중심력만)
    const simulation = forceSimulation<NodeData>(newNodes)
      // 노드 간 반발력 - 모바일에서 더 강하게
      .force('charge', forceManyBody<NodeData>()
        .strength(chargeStrength)
        .distanceMax(isMobile ? 250 : 350)
      )
      // 중심으로 끌어당기는 힘 (약하게)
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2)
        .strength(isMobile ? 0.03 : 0.04)
      )
      // 충돌 방지 - 모바일에서 더 강하게
      .force('collision', forceCollide<NodeData>()
        .radius(d => d.radius + collisionPadding)
        .strength(1)
        .iterations(isMobile ? 6 : 2)
      )
      .velocityDecay(0.5)  // 마찰력 증가 (더 느리게)
      .alphaDecay(0.015)   // 안정화 속도 증가
      .alphaMin(0.001);

    // 시뮬레이션 시작
    simulation.alpha(1).restart();

    // 미세한 떠다니는 움직임 (부드럽고 느리게)
    let tickCount = 0;
    const floatAmplitude = 0.03; // 떠다니는 강도 (더 미세하게)
    const floatFrequency = 0.008; // 떠다니는 속도 (더 느리게)

    // 경계 제약 및 미세 움직임
    const boundaryForce = () => {
      tickCount++;

      simulation.nodes().forEach((node, i) => {
        const padding = node.radius + 10;
        const margin = 30;

        // 미세한 떠다니는 힘 추가 (sin/cos 파동)
        const phase = (tickCount * floatFrequency) + (i * 0.5);
        const floatX = Math.sin(phase) * floatAmplitude;
        const floatY = Math.cos(phase * 0.7) * floatAmplitude;

        // fx가 null일 때만 (드래그 중이 아닐 때) 떠다니는 힘 적용
        if (node.fx === null || node.fx === undefined) {
          node.vx! += floatX;
          node.vy! += floatY;
        }

        // 부드러운 경계 반발력 (더 약하게)
        if (node.x! < padding + margin) {
          node.vx! += (padding + margin - node.x!) * 0.02;
        }
        if (node.x! > dimensions.width - padding - margin) {
          node.vx! -= (node.x! - (dimensions.width - padding - margin)) * 0.02;
        }
        if (node.y! < padding + margin) {
          node.vy! += (padding + margin - node.y!) * 0.02;
        }
        if (node.y! > dimensions.height - padding - margin) {
          node.vy! -= (node.y! - (dimensions.height - padding - margin)) * 0.02;
        }

        // 하드 경계 (절대 넘지 않음)
        node.x = Math.max(padding, Math.min(dimensions.width - padding, node.x!));
        node.y = Math.max(padding, Math.min(dimensions.height - padding, node.y!));
      });

      // 시뮬레이션이 거의 멈추면 다시 활성화 (아주 부드럽게)
      if (simulation.alpha() < 0.005) {
        simulation.alpha(0.008);
      }
    };

    simulation.on('tick', () => {
      boundaryForce();
      setNodes([...simulation.nodes()]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [bigKindsKeywords, dimensions.width, dimensions.height]);

  // 드래그 핸들러 - 선택한 노드만 움직임 (다른 노드는 고정)
  const handleMouseDown = useCallback((e: React.MouseEvent, node: NodeData) => {
    e.preventDefault();
    e.stopPropagation();

    // 시뮬레이션의 실제 노드 찾기
    const simNode = simulationRef.current?.nodes().find(n => n.id === node.id);
    if (!simNode) return;

    setIsDragging(true);
    dragNode.current = simNode;
    hasDragged.current = false;

    // 드래그 시작 위치 기록
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragStartPos.current = { x, y };
      lastMousePos.current = { x, y, time: Date.now() };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragNode.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 드래그 임계값 체크 - 일정 거리 이상 움직여야 드래그로 인식
    const dx = x - dragStartPos.current.x;
    const dy = y - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < DRAG_THRESHOLD) return; // 아직 드래그 아님

    hasDragged.current = true;

    // 경계 체크
    const padding = dragNode.current.radius + 10;
    const boundedX = Math.max(padding, Math.min(dimensions.width - padding, x));
    const boundedY = Math.max(padding, Math.min(dimensions.height - padding, y));

    // 드래그 중인 노드 위치 직접 업데이트
    dragNode.current.x = boundedX;
    dragNode.current.y = boundedY;
    dragNode.current.fx = boundedX;
    dragNode.current.fy = boundedY;

    // 노드 상태 업데이트 (다른 노드는 그대로)
    setNodes(prev => prev.map(n =>
      n.id === dragNode.current?.id
        ? { ...n, x: boundedX, y: boundedY }
        : n
    ));

    lastMousePos.current = { x, y, time: Date.now() };
  }, [isDragging, dimensions.width, dimensions.height]);

  const handleMouseUp = useCallback(() => {
    if (dragNode.current) {
      // 고정 해제
      dragNode.current.fx = null;
      dragNode.current.fy = null;
    }

    setIsDragging(false);
    dragNode.current = null;
  }, []);

  const handleNodeClick = useCallback(async (e: React.MouseEvent, node: NodeData) => {
    e.stopPropagation();
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    // 키워드 노드 클릭 → 키워드 정보 및 관련 기사 표시
    const keyword = bigKindsKeywords.find(kw => kw.keyword === node.keyword);
    if (keyword) {
      setSelectedKeyword(keyword);
      setRelatedArticles([]);

      // 관련 뉴스 ID가 있으면 기사 조회
      if (keyword.newsClusterIds && keyword.newsClusterIds.length > 0) {
        setArticlesLoading(true);
        try {
          const articles = await fetchNewsByIds(keyword.newsClusterIds, 5);
          setRelatedArticles(articles);
        } catch (error) {
          console.error('Failed to fetch related articles:', error);
        } finally {
          setArticlesLoading(false);
        }
      }
    }
  }, [bigKindsKeywords]);

  // 터치 이벤트 핸들러 - 선택한 노드만 움직임
  const handleTouchStart = useCallback((e: React.TouchEvent, node: NodeData) => {
    e.preventDefault();

    const simNode = simulationRef.current?.nodes().find(n => n.id === node.id);
    if (!simNode) return;

    setIsDragging(true);
    dragNode.current = simNode;
    hasDragged.current = false;

    if (containerRef.current) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      dragStartPos.current = { x, y };
      lastMousePos.current = { x, y, time: Date.now() };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragNode.current || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // 드래그 임계값 체크
    const dx = x - dragStartPos.current.x;
    const dy = y - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < DRAG_THRESHOLD) return;

    hasDragged.current = true;

    // 경계 체크
    const padding = dragNode.current.radius + 10;
    const boundedX = Math.max(padding, Math.min(dimensions.width - padding, x));
    const boundedY = Math.max(padding, Math.min(dimensions.height - padding, y));

    // 드래그 중인 노드 위치 직접 업데이트
    dragNode.current.x = boundedX;
    dragNode.current.y = boundedY;
    dragNode.current.fx = boundedX;
    dragNode.current.fy = boundedY;

    // 노드 상태 업데이트 (다른 노드는 그대로)
    setNodes(prev => prev.map(n =>
      n.id === dragNode.current?.id
        ? { ...n, x: boundedX, y: boundedY }
        : n
    ));

    lastMousePos.current = { x, y, time: Date.now() };
  }, [isDragging, dimensions.width, dimensions.height]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const closeKeywordModal = () => {
    setSelectedKeyword(null);
    setRelatedArticles([]);
    setArticlesLoading(false);
  };

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 숫자 포맷팅 헬퍼
  const formatNumber = (num: number | undefined, decimals = 0) => {
    if (num === undefined) return '-';
    return num.toLocaleString('ko-KR', { maximumFractionDigits: decimals });
  };

  const formatChange = (change: string | undefined) => {
    if (!change) return '';
    const num = parseFloat(change);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const getChangeClass = (change: string | undefined) => {
    if (!change) return '';
    const num = parseFloat(change);
    return num >= 0 ? 'positive' : 'negative';
  };

  return (
    <section className="issue-map-section">
      {/* 오늘의 숫자 + 1탭 브리핑 */}
      <div className="briefing-header">
        <div className="market-numbers">
          {overnightLoading ? (
            <div className="market-numbers-loading">
              <span className="shimmer-box"></span>
              <span className="shimmer-box"></span>
              <span className="shimmer-box"></span>
            </div>
          ) : (
            <>
              <div className="market-item">
                <span className="market-label">USD/KRW</span>
                <span className="market-value">{formatNumber(overnightData?.bok?.usdKrw?.value)}원</span>
              </div>
              <div className="market-item">
                <span className="market-label">S&P 500</span>
                <span className="market-value">
                  {overnightData?.usMarket?.['S&P 500']?.price || '-'}
                  <span className={`market-change ${getChangeClass(overnightData?.usMarket?.['S&P 500']?.changePercent)}`}>
                    {formatChange(overnightData?.usMarket?.['S&P 500']?.changePercent)}
                  </span>
                </span>
              </div>
              <div className="market-item">
                <span className="market-label">BTC</span>
                <span className="market-value">
                  ${formatNumber(parseFloat(overnightData?.usMarket?.['Bitcoin']?.price || '0'), 0)}
                  <span className={`market-change ${getChangeClass(overnightData?.usMarket?.['Bitcoin']?.changePercent)}`}>
                    {formatChange(overnightData?.usMarket?.['Bitcoin']?.changePercent)}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
        {onPlayBriefing && (
          <button className="one-tap-briefing-btn" onClick={onPlayBriefing}>
            <span className="btn-icon">▶</span>
            <span className="btn-text">3분 브리핑 듣기</span>
          </button>
        )}
      </div>

      <div className="issue-map-title">
        <h1>오늘의 경제<br />트렌드 키워드</h1>
        <p className="issue-map-hint">
          {keywordsLoading
            ? '빅카인즈에서 트렌드 분석 중...'
            : '키워드를 클릭하면 상세 정보를 볼 수 있어요'}
        </p>
      </div>

      <div
        className="issue-network"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* SVG Connection Lines */}
        <svg className="network-lines" width={dimensions.width} height={dimensions.height}>
          {/* 연관 키워드 기반 연결선만 - 완벽한 직선 */}
          {keywordConnections.map((conn, idx) => {
            const sourceNode = nodes[conn.sourceIdx];
            const targetNode = nodes[conn.targetIdx];

            if (!sourceNode || !targetNode) return null;

            const sx = sourceNode.x ?? 0;
            const sy = sourceNode.y ?? 0;
            const tx = targetNode.x ?? 0;
            const ty = targetNode.y ?? 0;

            // 두 노드 중심 간의 거리와 방향 계산
            const dx = tx - sx;
            const dy = ty - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 거리가 너무 짧으면 선 그리지 않음
            if (dist < (sourceNode.radius + targetNode.radius)) return null;

            // 방향 벡터 정규화
            const nx = dx / dist;
            const ny = dy / dist;

            // 원 가장자리에서 시작/끝나도록 좌표 조정
            const x1 = sx + nx * sourceNode.radius;
            const y1 = sy + ny * sourceNode.radius;
            const x2 = tx - nx * targetNode.radius;
            const y2 = ty - ny * targetNode.radius;

            // 가중치에 따라 선 두께 조절 (0.8~2)
            const strokeWidth = 0.8 + (conn.weight / 6);
            const opacity = conn.reason === 'direct' ? 0.35 : 0.18;

            return (
              <line
                key={`conn-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`rgba(148, 163, 184, ${opacity})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={conn.reason === 'direct' ? 'none' : '4 4'}
              />
            );
          })}
        </svg>

        {/* Issue Nodes - BigKinds 키워드만 */}
        {nodes.map((node) => {
          const color = keywordColors[node.index % keywordColors.length];
          const isHovered = hoveredNode === node.id;
          const isBeingDragged = isDragging && dragNode.current?.id === node.id;

          return (
            <div
              key={node.id}
              className={`issue-node keyword ${isBeingDragged ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                '--float-delay': node.index,
                '--node-color': color,
                left: node.x,
                top: node.y,
                width: node.radius * 2,
                height: node.radius * 2,
                background: isBeingDragged
                  ? `linear-gradient(135deg, ${color}50, ${color}35)`
                  : `linear-gradient(135deg, ${color}28, ${color}15)`,
                borderColor: isHovered || isBeingDragged ? color : `${color}40`,
                borderWidth: isHovered || isBeingDragged ? '2.5px' : '1.5px',
                boxShadow: isBeingDragged
                  ? `0 20px 40px ${color}30, 0 0 0 4px ${color}15, inset 0 1px 0 rgba(255,255,255,0.4)`
                  : isHovered
                    ? `0 12px 28px ${color}25, 0 0 0 2px ${color}10, inset 0 1px 0 rgba(255,255,255,0.3)`
                    : `0 4px 12px ${color}15, inset 0 1px 0 rgba(255,255,255,0.2)`,
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                zIndex: isBeingDragged ? 100 : isHovered ? 10 : 1,
                transform: isBeingDragged
                  ? 'translate(-50%, -50%) scale(1.12)'
                  : isHovered
                    ? 'translate(-50%, -50%) scale(1.06)'
                    : 'translate(-50%, -50%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              } as React.CSSProperties}
              onMouseDown={(e) => handleMouseDown(e, node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => handleNodeClick(e, node)}
              onTouchStart={(e) => handleTouchStart(e, node)}
            >
              <div className="issue-node-inner">
                <span className="issue-node-keyword">{node.keyword}</span>
                <span className="issue-node-newscount">{formatNewsCount(node.newsCount)}</span>
              </div>
            </div>
          );
        })}

        {/* 데이터 소스 표시 */}
        <div className="issue-map-legend">
          <span className="legend-item keyword">
            <span className="legend-dot"></span>
            실시간 트렌드
          </span>
        </div>
      </div>

      {/* 키워드 상세 모달 */}
      {selectedKeyword && (
        <div className="keyword-modal-overlay" onClick={closeKeywordModal}>
          <div className="keyword-modal" onClick={e => e.stopPropagation()}>
            <button className="keyword-modal-close" onClick={closeKeywordModal}>×</button>
            <h3>{selectedKeyword.keyword}</h3>
            <div className="keyword-modal-stats">
              <span className="stat">
                <span className="stat-value">{selectedKeyword.newsCount}</span>
                <span className="stat-label">관련 뉴스</span>
              </span>
              {selectedKeyword.rank && (
                <span className="stat">
                  <span className="stat-value">#{selectedKeyword.rank}</span>
                  <span className="stat-label">오늘 순위</span>
                </span>
              )}
            </div>

            {/* 토픽 요약 */}
            {selectedKeyword.topicContent && (
              <div className="keyword-modal-summary">
                <h4>이슈 요약</h4>
                <p className="topic-content">{selectedKeyword.topicContent}</p>
              </div>
            )}

            {selectedKeyword.relatedKeywords && selectedKeyword.relatedKeywords.length > 0 && (
              <div className="keyword-modal-related">
                <h4>연관 키워드</h4>
                <div className="related-tags">
                  {selectedKeyword.relatedKeywords.slice(0, 10).map((kw, i) => (
                    <span key={i} className="related-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 관련 기사 목록 */}
            <div className="keyword-modal-articles">
              <h4>관련 기사</h4>
              {articlesLoading ? (
                <div className="articles-loading">
                  <span className="loading-spinner"></span>
                  기사를 불러오는 중...
                </div>
              ) : relatedArticles.length > 0 ? (
                <ul className="articles-list">
                  {relatedArticles.map((article) => (
                    <li
                      key={article.id}
                      className="article-item"
                      onClick={() => handleArticleClick(article.url)}
                    >
                      <span className="article-title">{article.title}</span>
                      <span className="article-meta">
                        <span className="article-provider">{article.provider}</span>
                        {article.publishedAt && (
                          <span className="article-date">{article.publishedAt}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : selectedKeyword.newsClusterIds && selectedKeyword.newsClusterIds.length > 0 ? (
                <p className="no-articles">기사 정보를 불러올 수 없습니다.</p>
              ) : (
                <p className="no-articles">관련 기사가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default IssueMap;
