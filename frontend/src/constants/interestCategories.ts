import type { InterestInfo, InterestCategory } from '../types/interests';

export const INTEREST_CATEGORIES: Record<InterestCategory, InterestInfo> = {
  stock: {
    id: 'stock',
    name: '증권/주식',
    keywords: ['주식', '증권', '코스피', '코스닥', 'ETF', '배당', '상장', 'IPO', '공매도', '투자', '증시', '주가', '시총'],
    description: '주식 시장, 투자 전략'
  },
  realestate: {
    id: 'realestate',
    name: '부동산',
    keywords: ['부동산', '아파트', '주택', '전세', '월세', '분양', '재건축', '재개발', '청약', '임대', '매매'],
    description: '부동산 시장, 정책'
  },
  tech: {
    id: 'tech',
    name: 'IT/테크',
    keywords: ['IT', '테크', 'AI', '인공지능', '반도체', '스타트업', '빅테크', '클라우드', '데이터', '삼성', 'SK', '갤럭시', '애플'],
    description: 'IT, AI, 반도체'
  },
  global: {
    id: 'global',
    name: '글로벌',
    keywords: ['글로벌', '미국', '중국', '환율', '달러', '무역', '수출', '관세', '연준', 'Fed', '트럼프', '유럽', '일본'],
    description: '해외 경제, 환율'
  },
  industry: {
    id: 'industry',
    name: '산업/기업',
    keywords: ['산업', '기업', '실적', '매출', 'M&A', '인수', '합병', '경영', '제조', '자동차', '배터리', '조선'],
    description: '기업 동향, 실적'
  },
  finance: {
    id: 'finance',
    name: '금융/은행',
    keywords: ['금융', '은행', '금리', '대출', '예금', '카드', '핀테크', '보험', '연금', '저축', '이자'],
    description: '금리, 대출, 핀테크'
  },
  policy: {
    id: 'policy',
    name: '정책/규제',
    keywords: ['정책', '규제', '정부', '법안', '세금', '세제', '감독', '제도', '개혁', '국회', '예산'],
    description: '경제 정책, 규제'
  }
};

export const INTEREST_CATEGORY_LIST = Object.values(INTEREST_CATEGORIES);
