import { useState, useCallback, useMemo } from 'react';
import TermTooltip, { type TermExplanation } from './TermTooltip';

// 경제 용어 목록 (자주 나오는 경제 용어들)
const ECONOMIC_TERMS = [
  '금리', '기준금리', '인플레이션', '디플레이션', '스태그플레이션',
  'GDP', '국내총생산', '수출', '수입', '무역수지', '경상수지',
  '환율', '달러', '원화', '유로', '엔화',
  '주식', '채권', '펀드', 'ETF', '선물', '옵션',
  'KOSPI', '코스피', '코스닥', '나스닥', 'S&P',
  '시가총액', '배당', '주가', 'PER', 'PBR', 'ROE',
  '양적완화', '테이퍼링', '피봇', '빅스텝', '자이언트스텝',
  '연준', 'FOMC', '한국은행', '금융위원회', '통화정책',
  'M&A', '인수합병', 'IPO', '상장', '공모',
  '반도체', 'AI', '전기차', '배터리', '바이오',
  '원유', '유가', 'WTI', 'OPEC', '천연가스',
  '부동산', '아파트', 'DSR', 'LTV', '전세', '매매',
  '물가', 'CPI', '소비자물가', '근원물가',
  '실업률', '고용률', '경기침체', '경기회복',
  '재정정책', '통화정책', '금융정책', '규제',
  '무역분쟁', '관세', '보호무역', '자유무역',
];

// 용어별 샘플 설명 (실제로는 API에서 가져올 것)
const SAMPLE_EXPLANATIONS: Record<string, TermExplanation> = {
  '금리': {
    term: '금리',
    explanation: '돈을 빌리거나 빌려줄 때 발생하는 이자의 비율입니다. 금리가 오르면 대출 이자가 늘어나고, 저축 이자도 늘어납니다.',
    simpleAnalogy: '돈을 빌리는 "사용료"라고 생각하면 쉬워요. 높으면 돈 빌리기 부담스럽고, 낮으면 쉽게 빌릴 수 있어요.',
    examples: ['기준금리 3.5% → 1억 대출시 연 350만원 이자'],
    relatedTerms: ['기준금리', '예금금리', '대출금리'],
  },
  '인플레이션': {
    term: '인플레이션',
    explanation: '물가가 지속적으로 오르는 현상입니다. 같은 돈으로 살 수 있는 물건이 줄어들어 돈의 가치가 떨어집니다.',
    simpleAnalogy: '작년에 1000원이던 아이스크림이 올해 1200원이 된 것처럼, 물건 값이 전반적으로 오르는 거예요.',
    examples: ['물가상승률 5% → 100만원의 실제 가치 95만원'],
    relatedTerms: ['디플레이션', '스태그플레이션', 'CPI'],
  },
  '환율': {
    term: '환율',
    explanation: '한 나라의 통화를 다른 나라 통화로 바꿀 때의 교환 비율입니다. 원/달러 환율이 1300원이면 1달러를 사는데 1300원이 필요합니다.',
    simpleAnalogy: '외국 돈과 우리 돈을 바꾸는 가격표예요. 환율이 오르면 해외여행이 비싸지고, 내리면 싸져요.',
    examples: ['환율 1300원 → 100달러 = 13만원'],
    relatedTerms: ['달러', '원화', '외환시장'],
  },
  'GDP': {
    term: 'GDP',
    explanation: '국내총생산(Gross Domestic Product)의 약자로, 한 나라에서 1년 동안 만들어낸 모든 재화와 서비스의 가치 합계입니다.',
    simpleAnalogy: '나라 전체가 1년간 번 돈의 총합이에요. 경제 규모를 나타내는 대표적인 지표죠.',
    examples: ['한국 GDP 약 1.8조 달러 (세계 10위권)'],
    relatedTerms: ['국내총생산', 'GNP', '경제성장률'],
  },
  '양적완화': {
    term: '양적완화',
    explanation: '중앙은행이 시중에 돈을 직접 풀어 경기를 부양하는 정책입니다. 주로 국채나 자산을 사들여 돈을 공급합니다.',
    simpleAnalogy: '경제가 어려울 때 중앙은행이 "돈을 찍어서" 시장에 뿌리는 거예요. 일종의 경기부양 응급처치죠.',
    examples: ['코로나 시기 연준의 대규모 양적완화'],
    relatedTerms: ['테이퍼링', '연준', '금리인하'],
  },
};

interface HighlightedTextProps {
  text: string;
  knowledgeLevel?: 'beginner' | 'intermediate' | 'expert';
}

function HighlightedText({ text, knowledgeLevel = 'beginner' }: HighlightedTextProps) {
  const [explanations, setExplanations] = useState<Record<string, TermExplanation>>(SAMPLE_EXPLANATIONS);
  const [loadingTerms, setLoadingTerms] = useState<Set<string>>(new Set());

  const handleRequestExplanation = useCallback((term: string) => {
    if (explanations[term] || loadingTerms.has(term)) return;

    setLoadingTerms(prev => new Set(prev).add(term));

    // 실제로는 API 호출, 여기서는 임시 데이터 사용
    setTimeout(() => {
      setExplanations(prev => ({
        ...prev,
        [term]: {
          term,
          explanation: `"${term}"에 대한 설명입니다. 실제 서비스에서는 AI가 맞춤 설명을 제공합니다.`,
          simpleAnalogy: '쉬운 비유로 설명해드릴게요.',
        },
      }));
      setLoadingTerms(prev => {
        const next = new Set(prev);
        next.delete(term);
        return next;
      });
    }, 800);
  }, [explanations, loadingTerms]);

  // 텍스트에서 용어를 찾아 하이라이트
  const highlightedContent = useMemo(() => {
    // 긴 용어를 먼저 찾도록 정렬
    const sortedTerms = [...ECONOMIC_TERMS].sort((a, b) => b.length - a.length);

    // 정규표현식 패턴 생성
    const pattern = new RegExp(`(${sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

    const parts = text.split(pattern);

    return parts.map((part, index) => {
      if (ECONOMIC_TERMS.includes(part)) {
        return (
          <TermTooltip
            key={index}
            term={part}
            explanation={explanations[part]}
            isLoading={loadingTerms.has(part)}
            onRequestExplanation={handleRequestExplanation}
            knowledgeLevel={knowledgeLevel}
          >
            {part}
          </TermTooltip>
        );
      }
      return part;
    });
  }, [text, explanations, loadingTerms, handleRequestExplanation, knowledgeLevel]);

  return <>{highlightedContent}</>;
}

export default HighlightedText;
