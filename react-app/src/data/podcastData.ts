import type { PodcastData, PodcastKey } from '../types/podcast';
import coverImage from '../assets/image.png';

export interface IssueNode {
  key: PodcastKey;
  x: number;
  y: number;
  size: 'large' | 'medium' | 'small';
  color: string;
}

export const podcastData: PodcastData = {
  ai: {
    keyword: "AI 기술",
    title: "ChatGPT와 AI의 미래",
    duration: 1245,
    audioUrl: "",
    coverColor: "#6b9b8e",
    coverImage: coverImage,
    chartHeights: [60, 85, 45, 70, 55, 90],
    summary: {
      keyPoints: [
        "생성형 AI가 콘텐츠 제작 산업을 혁신하고 있습니다",
        "AI 윤리와 규제에 대한 논의가 활발해지고 있습니다",
        "기업들의 AI 도입이 가속화되고 있습니다"
      ],
      stats: [
        { number: "85%", label: "기업 도입률" },
        { number: "2.5배", label: "생산성 향상" },
        { number: "120억", label: "시장 규모(달러)" },
        { number: "45%", label: "연간 성장률" }
      ],
      topics: [
        "ChatGPT-4의 새로운 기능",
        "AI 규제 법안 통과",
        "기업의 AI 전환 사례"
      ]
    },
    transcript: [
      { start: 0, end: 180, text: "안녕하세요, 오늘은 ChatGPT와 AI의 미래에 대해 이야기해보겠습니다. " },
      { start: 180, end: 360, text: "최근 생성형 AI 기술이 급속도로 발전하면서 우리 일상과 산업 전반에 큰 변화를 가져오고 있습니다. " },
      { start: 360, end: 540, text: "특히 ChatGPT-4는 이전 버전보다 훨씬 더 정교한 대화와 분석 능력을 보여주고 있죠. " },
      { start: 540, end: 720, text: "하지만 이러한 발전과 함께 AI 윤리와 규제에 대한 논의도 활발해지고 있습니다. " },
      { start: 720, end: 900, text: "많은 기업들이 AI를 도입하면서 생산성이 크게 향상되고 있지만, " },
      { start: 900, end: 1080, text: "동시에 일자리 변화와 개인정보 보호 등의 과제도 함께 대두되고 있습니다. " },
      { start: 1080, end: 1245, text: "앞으로 AI 기술이 어떻게 발전할지, 우리는 어떻게 준비해야 할지 함께 고민해봐야 할 시점입니다." }
    ]
  },
  economy: {
    keyword: "경제 동향",
    title: "2024 글로벌 경제 전망",
    duration: 1580,
    audioUrl: "",
    coverColor: "#8b7ba8",
    coverImage: coverImage,
    chartHeights: [75, 50, 90, 65, 80, 55],
    summary: {
      keyPoints: [
        "금리 인하 기대감으로 증시가 상승세를 보이고 있습니다",
        "인플레이션이 점진적으로 안정화되고 있습니다",
        "신흥국 경제의 회복세가 두드러집니다"
      ],
      stats: [
        { number: "3.2%", label: "GDP 성장률" },
        { number: "2.8%", label: "물가상승률" },
        { number: "4.5%", label: "실업률" },
        { number: "5.25%", label: "기준금리" }
      ],
      topics: [
        "미국 연준의 금리 정책",
        "중국 경제 회복 신호",
        "유럽 경기 침체 우려"
      ]
    },
    transcript: [
      { start: 0, end: 220, text: "2024년 글로벌 경제 전망에 대해 살펴보겠습니다. " },
      { start: 220, end: 440, text: "올해는 금리 인하 기대감이 시장을 주도하고 있습니다. " },
      { start: 440, end: 660, text: "미국 연준은 인플레이션 안정화를 확인한 후 금리 인하를 검토하고 있으며, " },
      { start: 660, end: 880, text: "이에 따라 주식시장이 상승세를 보이고 있습니다. " },
      { start: 880, end: 1100, text: "한편 중국 경제는 부동산 위기에서 벗어나 회복 신호를 보이고 있고, " },
      { start: 1100, end: 1320, text: "신흥국들도 원자재 가격 안정과 함께 성장세를 이어가고 있습니다. " },
      { start: 1320, end: 1580, text: "다만 유럽은 여전히 경기 침체 우려가 남아있어 주의가 필요한 상황입니다." }
    ]
  },
  tech: {
    keyword: "테크 트렌드",
    title: "2024 IT 산업 핵심 키워드",
    duration: 1420,
    audioUrl: "",
    coverColor: "#7ba3c0",
    coverImage: coverImage,
    chartHeights: [55, 70, 85, 60, 75, 50],
    summary: {
      keyPoints: [
        "클라우드 네이티브 기술이 표준이 되고 있습니다",
        "엣지 컴퓨팅의 중요성이 증가하고 있습니다",
        "사이버 보안 투자가 급증하고 있습니다"
      ],
      stats: [
        { number: "67%", label: "클라우드 전환율" },
        { number: "890억", label: "보안 시장(달러)" },
        { number: "5G", label: "네트워크 세대" },
        { number: "32%", label: "원격근무 비율" }
      ],
      topics: [
        "양자 컴퓨팅의 발전",
        "메타버스 플랫폼 경쟁",
        "블록체인 실용화 사례"
      ]
    },
    transcript: [
      { start: 0, end: 200, text: "2024년 IT 산업의 핵심 키워드를 살펴보겠습니다. " },
      { start: 200, end: 400, text: "클라우드 네이티브 기술이 이제는 선택이 아닌 필수가 되었습니다. " },
      { start: 400, end: 600, text: "기업들의 67%가 클라우드로 전환을 완료했거나 진행 중이며, " },
      { start: 600, end: 800, text: "엣지 컴퓨팅을 통해 더 빠른 데이터 처리가 가능해지고 있습니다. " },
      { start: 800, end: 1000, text: "사이버 보안 시장도 890억 달러 규모로 성장하며 " },
      { start: 1000, end: 1200, text: "기업들의 보안 투자가 크게 증가하고 있습니다. " },
      { start: 1200, end: 1420, text: "양자 컴퓨팅, 메타버스, 블록체인 등 차세대 기술들도 빠르게 발전하고 있습니다." }
    ]
  },
  climate: {
    keyword: "기후 위기",
    title: "탄소중립과 그린 에너지",
    duration: 1350,
    audioUrl: "",
    coverColor: "#7cb89d",
    coverImage: coverImage,
    chartHeights: [65, 80, 55, 90, 70, 60],
    summary: {
      keyPoints: [
        "재생에너지 비중이 30%를 돌파했습니다",
        "탄소배출권 거래 시장이 확대되고 있습니다",
        "ESG 경영이 기업의 필수 요소가 되었습니다"
      ],
      stats: [
        { number: "30%", label: "재생에너지 비중" },
        { number: "2050", label: "탄소중립 목표" },
        { number: "15조", label: "녹색투자(달러)" },
        { number: "-45%", label: "감축 목표" }
      ],
      topics: [
        "태양광 발전 효율 향상",
        "전기차 보급 확대",
        "탄소포집 기술 개발"
      ]
    },
    transcript: [
      { start: 0, end: 190, text: "탄소중립과 그린 에너지에 대해 이야기해보겠습니다. " },
      { start: 190, end: 380, text: "전 세계적으로 재생에너지 비중이 30%를 넘어섰습니다. " },
      { start: 380, end: 570, text: "태양광과 풍력 발전의 효율이 크게 향상되면서 " },
      { start: 570, end: 760, text: "화석연료를 대체하는 속도가 빨라지고 있습니다. " },
      { start: 760, end: 950, text: "각국 정부는 2050 탄소중립 목표를 위해 " },
      { start: 950, end: 1140, text: "15조 달러 규모의 녹색 투자를 진행하고 있으며, " },
      { start: 1140, end: 1350, text: "기업들도 ESG 경영을 통해 지속가능한 미래를 만들어가고 있습니다." }
    ]
  }
};

export const issueNodes: IssueNode[] = [
  { key: 'ai', x: 25, y: 30, size: 'large', color: '#ffffff' },
  { key: 'economy', x: 75, y: 30, size: 'large', color: '#ffffff' },
  { key: 'tech', x: 25, y: 70, size: 'large', color: '#ffffff' },
  { key: 'climate', x: 75, y: 70, size: 'large', color: '#ffffff' }
];
