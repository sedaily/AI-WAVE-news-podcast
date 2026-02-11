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
    duration: 60,
    audioUrl: "",
    coverColor: "#6b9b8e",
    coverImage: coverImage,
    chartHeights: [60, 85, 45, 70, 55, 90],
    summary: {
      keyPoints: [
        "생성형 AI가 산업을 혁신하고 있습니다",
        "AI 윤리와 규제 논의가 활발합니다"
      ],
      stats: [
        { number: "85%", label: "기업 도입률" },
        { number: "2.5배", label: "생산성 향상" }
      ],
      topics: [
        "ChatGPT-4의 새로운 기능",
        "AI 규제 법안"
      ]
    },
    transcript: [
      { start: 0, end: 15, text: "안녕하세요, 오늘은 AI의 미래에 대해 이야기합니다. " },
      { start: 15, end: 30, text: "생성형 AI가 빠르게 발전하고 있습니다. " },
      { start: 30, end: 45, text: "기업들의 AI 도입이 가속화되고 있죠. " },
      { start: 45, end: 60, text: "AI 시대를 함께 준비해야 합니다." }
    ]
  },
  economy: {
    keyword: "경제 동향",
    title: "2024 글로벌 경제 전망",
    duration: 60,
    audioUrl: "",
    coverColor: "#8b7ba8",
    coverImage: coverImage,
    chartHeights: [75, 50, 90, 65, 80, 55],
    summary: {
      keyPoints: [
        "금리 인하 기대감이 높아지고 있습니다",
        "신흥국 경제가 회복세를 보입니다"
      ],
      stats: [
        { number: "3.2%", label: "GDP 성장률" },
        { number: "2.8%", label: "물가상승률" }
      ],
      topics: [
        "미국 연준의 금리 정책",
        "중국 경제 회복"
      ]
    },
    transcript: [
      { start: 0, end: 15, text: "글로벌 경제 전망을 살펴봅니다. " },
      { start: 15, end: 30, text: "금리 인하 기대감이 시장을 주도합니다. " },
      { start: 30, end: 45, text: "신흥국들이 성장세를 이어가고 있습니다. " },
      { start: 45, end: 60, text: "올해 경제 전망은 긍정적입니다." }
    ]
  },
  tech: {
    keyword: "테크 트렌드",
    title: "2024 IT 핵심 키워드",
    duration: 60,
    audioUrl: "",
    coverColor: "#7ba3c0",
    coverImage: coverImage,
    chartHeights: [55, 70, 85, 60, 75, 50],
    summary: {
      keyPoints: [
        "클라우드 기술이 표준이 되었습니다",
        "사이버 보안 투자가 증가합니다"
      ],
      stats: [
        { number: "67%", label: "클라우드 전환율" },
        { number: "890억", label: "보안 시장" }
      ],
      topics: [
        "클라우드 네이티브",
        "사이버 보안"
      ]
    },
    transcript: [
      { start: 0, end: 15, text: "IT 산업 핵심 키워드입니다. " },
      { start: 15, end: 30, text: "클라우드 기술이 필수가 되었습니다. " },
      { start: 30, end: 45, text: "보안 투자도 크게 증가하고 있죠. " },
      { start: 45, end: 60, text: "디지털 전환이 가속화됩니다." }
    ]
  },
  climate: {
    keyword: "기후 위기",
    title: "탄소중립과 그린 에너지",
    duration: 60,
    audioUrl: "",
    coverColor: "#7cb89d",
    coverImage: coverImage,
    chartHeights: [65, 80, 55, 90, 70, 60],
    summary: {
      keyPoints: [
        "재생에너지 비중이 30%를 넘었습니다",
        "ESG 경영이 필수가 되었습니다"
      ],
      stats: [
        { number: "30%", label: "재생에너지" },
        { number: "2050", label: "탄소중립 목표" }
      ],
      topics: [
        "태양광 발전",
        "전기차 보급"
      ]
    },
    transcript: [
      { start: 0, end: 15, text: "탄소중립에 대해 알아봅니다. " },
      { start: 15, end: 30, text: "재생에너지 비중이 30%를 넘었습니다. " },
      { start: 30, end: 45, text: "기업들이 ESG 경영을 도입합니다. " },
      { start: 45, end: 60, text: "지속가능한 미래를 만들어갑니다." }
    ]
  }
};

export const issueNodes: IssueNode[] = [
  { key: 'ai', x: 30, y: 35, size: 'large', color: '#6b9b8e' },
  { key: 'economy', x: 70, y: 40, size: 'large', color: '#8b7ba8' },
  { key: 'tech', x: 25, y: 75, size: 'medium', color: '#7ba3c0' },
  { key: 'climate', x: 75, y: 80, size: 'medium', color: '#7cb89d' }
];
