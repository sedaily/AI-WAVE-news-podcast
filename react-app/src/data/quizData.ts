import type { QuizQuestion } from '../types/quiz';

export const dailyQuizzes: QuizQuestion[] = [
  {
    id: 1,
    term: '인플레이션',
    question: '인플레이션은 물가가 지속적으로 상승하는 현상이다.',
    type: 'ox',
    correctAnswer: 0, // 0: O, 1: X
    explanation: '인플레이션(Inflation)은 화폐가치가 하락하여 물가가 전반적으로 지속적으로 상승하는 경제 현상입니다.'
  },
  {
    id: 2,
    term: 'GDP',
    question: 'GDP는 무엇을 의미하는가?',
    type: 'multiple',
    options: [
      '국내총생산',
      '국민총소득',
      '국제무역수지',
      '국가부채총액'
    ],
    correctAnswer: 0,
    explanation: 'GDP(Gross Domestic Product)는 국내총생산으로, 일정 기간 동안 한 나라 안에서 생산된 모든 최종 재화와 서비스의 시장가치를 합한 것입니다.'
  },
  {
    id: 3,
    term: '기준금리',
    question: '기준금리가 인상되면 일반적으로 예금 이자율도 상승한다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '기준금리는 중앙은행이 시중은행에 돈을 빌려줄 때 적용하는 금리입니다. 기준금리가 오르면 시중은행의 예금 및 대출 금리도 함께 상승하는 경향이 있습니다.'
  },
  {
    id: 4,
    term: '환율',
    question: '원/달러 환율이 1,200원에서 1,300원으로 상승했다. 이는 무엇을 의미하는가?',
    type: 'multiple',
    options: [
      '원화 가치 상승',
      '원화 가치 하락',
      '달러 가치 하락',
      '환율 변동 없음'
    ],
    correctAnswer: 1,
    explanation: '환율이 상승한다는 것은 같은 달러를 사기 위해 더 많은 원화가 필요하다는 의미로, 원화 가치가 하락했음을 나타냅니다.'
  },
  {
    id: 5,
    term: '주가지수',
    question: 'KOSPI는 한국의 대표적인 주가지수이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'KOSPI(Korea Composite Stock Price Index)는 한국거래소 유가증권시장에 상장된 전체 종목의 주가 변동을 나타내는 대표적인 주가지수입니다.'
  },
  {
    id: 6,
    term: '양적완화',
    question: '양적완화(QE)는 중앙은행이 시중에 통화량을 늘리는 정책이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '양적완화(Quantitative Easing)는 중앙은행이 국채 등을 매입하여 시중에 유동성을 공급하는 통화정책입니다.'
  },
  {
    id: 7,
    term: '경상수지',
    question: '경상수지는 무엇을 나타내는가?',
    type: 'multiple',
    options: [
      '국가의 총 수출액',
      '상품과 서비스 거래의 수지',
      '정부의 재정 상태',
      '외환보유액'
    ],
    correctAnswer: 1,
    explanation: '경상수지는 한 나라가 다른 나라와 거래한 상품, 서비스, 소득, 이전소득의 수지를 합한 것입니다.'
  },
  {
    id: 8,
    term: '디플레이션',
    question: '디플레이션은 물가가 지속적으로 하락하는 현상이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '디플레이션(Deflation)은 인플레이션과 반대로 물가가 지속적으로 하락하는 현상으로, 경기 침체를 동반할 수 있습니다.'
  },
  {
    id: 9,
    term: '배당',
    question: '배당수익률이 높을수록 항상 좋은 투자처이다.',
    type: 'ox',
    correctAnswer: 1,
    explanation: '배당수익률이 높다고 해서 항상 좋은 것은 아닙니다. 주가 하락으로 인해 배당수익률이 높아질 수 있으며, 기업의 재무 상태와 성장성을 함께 고려해야 합니다.'
  },
  {
    id: 10,
    term: 'PER',
    question: 'PER(주가수익비율)은 무엇을 의미하는가?',
    type: 'multiple',
    options: [
      '주가를 주당순이익으로 나눈 값',
      '배당금을 주가로 나눈 값',
      '자산을 부채로 나눈 값',
      '매출을 순이익으로 나눈 값'
    ],
    correctAnswer: 0,
    explanation: 'PER(Price Earning Ratio)은 주가를 주당순이익(EPS)으로 나눈 값으로, 주식의 상대적 가치를 평가하는 지표입니다.'
  },
  {
    id: 11,
    term: '채권',
    question: '채권 가격과 금리는 반대로 움직인다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '금리가 상승하면 기존 채권의 매력이 떨어져 채권 가격이 하락하고, 금리가 하락하면 채권 가격이 상승하는 역의 관계가 있습니다.'
  },
  {
    id: 12,
    term: '유동성',
    question: '유동성이 높다는 것은 무엇을 의미하는가?',
    type: 'multiple',
    options: [
      '자산을 현금으로 쉽게 바꿀 수 있다',
      '부채가 많다',
      '수익성이 높다',
      '위험이 크다'
    ],
    correctAnswer: 0,
    explanation: '유동성(Liquidity)은 자산을 현금으로 전환하기 쉬운 정도를 나타냅니다. 유동성이 높을수록 빠르게 현금화할 수 있습니다.'
  },
  {
    id: 13,
    term: '스태그플레이션',
    question: '스태그플레이션은 경기침체와 물가상승이 동시에 발생하는 현상이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '스태그플레이션(Stagflation)은 경기침체(Stagnation)와 인플레이션(Inflation)이 동시에 나타나는 현상으로, 정책 대응이 어려운 경제 상황입니다.'
  },
  {
    id: 14,
    term: '분산투자',
    question: '분산투자의 주요 목적은 무엇인가?',
    type: 'multiple',
    options: [
      '수익률 극대화',
      '위험 분산',
      '세금 절감',
      '거래 비용 절감'
    ],
    correctAnswer: 1,
    explanation: '분산투자는 여러 자산에 투자하여 특정 자산의 손실 위험을 줄이는 것이 주요 목적입니다. "계란을 한 바구니에 담지 말라"는 격언이 이를 잘 표현합니다.'
  },
  {
    id: 15,
    term: '재정정책',
    question: '재정정책은 중앙은행이 담당한다.',
    type: 'ox',
    correctAnswer: 1,
    explanation: '재정정책은 정부가 세금과 지출을 조절하여 경제에 영향을 미치는 정책입니다. 중앙은행은 통화정책(금리, 통화량 조절)을 담당합니다.'
  },
    {
    id: 16,
    term: 'EPS',
    question: 'EPS는 주당순이익을 의미한다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'EPS(Earnings Per Share)는 기업의 순이익을 발행 주식 수로 나눈 값입니다.'
  },
  {
    id: 17,
    term: 'ETF',
    question: 'ETF의 특징으로 올바른 것은?',
    type: 'multiple',
    options: ['펀드처럼 거래된다', '주식처럼 하루 한 번 거래된다', '상장되지 않는다', '환매가 불가능하다'],
    correctAnswer: 0,
    explanation: 'ETF는 펀드이지만 주식처럼 실시간 거래가 가능합니다.'
  },
  {
    id: 18,
    term: '시가총액',
    question: '시가총액은 주가 × 발행주식수이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '시가총액은 기업의 시장 가치를 나타내는 대표 지표입니다.'
  },
  {
    id: 19,
    term: 'ROE',
    question: 'ROE는 자기자본 대비 순이익 비율이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'ROE(Return on Equity)는 자본 대비 얼마나 효율적으로 수익을 냈는지 보여줍니다.'
  },
  {
    id: 20,
    term: '공매도',
    question: '공매도는 주가 하락에 베팅하는 투자 방식이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '주식을 빌려 팔고 나중에 사서 갚는 방식입니다.'
  },

  // 중간 생략 없이 계속

  {
    id: 21,
    term: 'IPO',
    question: 'IPO는 기업이 처음으로 주식을 공개하는 것이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'Initial Public Offering의 약자입니다.'
  },
  {
    id: 22,
    term: '리츠',
    question: '리츠(REITs)는 주로 무엇에 투자하는 상품인가?',
    type: 'multiple',
    options: ['채권', '외환', '부동산', '원자재'],
    correctAnswer: 2,
    explanation: '부동산 투자 신탁 상품입니다.'
  },
  {
    id: 23,
    term: '매수',
    question: '매수는 자산을 파는 행위이다.',
    type: 'ox',
    correctAnswer: 1,
    explanation: '매수는 사는 것, 매도는 파는 것입니다.'
  },
  {
    id: 24,
    term: '호가',
    question: '호가는 매수/매도 희망 가격이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '시장 참여자가 제시하는 가격입니다.'
  },
  {
    id: 25,
    term: '스프레드',
    question: '스프레드는 매수호가와 매도호가의 차이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '차이가 클수록 거래 비용이 커집니다.'
  },

  {
    id: 26,
    term: '변동성',
    question: '변동성이 크다는 것은 가격 움직임이 크다는 뜻이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '가격이 자주 크게 움직이면 변동성이 높습니다.'
  },
  {
    id: 27,
    term: '리스크',
    question: '리스크는 항상 손실을 의미한다.',
    type: 'ox',
    correctAnswer: 1,
    explanation: '불확실성을 의미하며 수익 가능성도 포함됩니다.'
  },
  {
    id: 28,
    term: '채무불이행',
    question: '채무불이행은 약속한 상환을 못 하는 상태이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '디폴트(Default)라고도 부릅니다.'
  },
  {
    id: 29,
    term: '레버리지',
    question: '레버리지는 자기자본만으로 투자하는 것이다.',
    type: 'ox',
    correctAnswer: 1,
    explanation: '차입을 활용해 투자 규모를 키우는 방식입니다.'
  },
  {
    id: 30,
    term: '파생상품',
    question: '파생상품은 기초자산 가격에 연동된다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '선물, 옵션 등이 대표적입니다.'
  },

  {
    id: 31,
    term: '복리',
    question: '복리는 이자에 이자가 붙는 구조이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '시간이 지날수록 자산이 눈덩이처럼 불어납니다.'
  },

  {
    id: 32,
    term: 'PBR',
    question: 'PBR은 주가를 자산가치로 나눈 지표이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'PBR(주가순자산비율)은 기업의 순자산 대비 주가 수준을 나타냅니다.'
  },
  {
    id: 33,
    term: 'CPI',
    question: 'CPI는 무엇을 의미하는가?',
    type: 'multiple',
    options: ['소비자물가지수', '기업생산지수', '국가부채비율', '주가지수'],
    correctAnswer: 0,
    explanation: 'CPI는 Consumer Price Index로 소비자가 체감하는 물가 수준입니다.'
  },
  {
    id: 34,
    term: '우량주',
    question: '우량주는 재무구조가 안정적이고 실적이 꾸준한 기업의 주식이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '장기 투자에 많이 활용됩니다.'
  },
  {
    id: 35,
    term: '성장주',
    question: '성장주는 현재 이익보다 미래 성장 가능성이 큰 기업이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '매출 증가율이 높은 기업이 많습니다.'
  },
  {
    id: 36,
    term: '가치주',
    question: '가치주는 시장에서 저평가된 기업을 의미한다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: 'PBR, PER이 낮은 종목이 많습니다.'
  },
  {
    id: 37,
    term: '외환보유액',
    question: '외환보유액의 역할은?',
    type: 'multiple',
    options: ['환율 안정', '주가 상승', '세금 인하', '부동산 가격 조절'],
    correctAnswer: 0,
    explanation: '국가의 외환 안전판 역할을 합니다.'
  },
  {
    id: 38,
    term: '베어마켓',
    question: '베어마켓은 장기간 하락장이 지속되는 시장이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '약세장을 의미합니다.'
  },
  {
    id: 39,
    term: '불마켓',
    question: '불마켓은 전반적으로 상승하는 시장이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '강세장을 뜻합니다.'
  },
  {
    id: 40,
    term: '자산배분',
    question: '자산배분의 목적은?',
    type: 'multiple',
    options: ['위험 관리', '단기 수익', '세금 회피', '거래량 증가'],
    correctAnswer: 0,
    explanation: '주식·채권·현금 등을 나눠 투자합니다.'
  },
  {
    id: 41,
    term: '적립식 투자',
    question: '적립식 투자는 일정 금액을 꾸준히 투자하는 방식이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '시장 타이밍 부담을 줄일 수 있습니다.'
  },
  {
    id: 42,
    term: '상장폐지',
    question: '상장폐지는 거래소에서 주식 거래가 중단되는 것이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '재무 악화 등으로 발생할 수 있습니다.'
  },
  {
    id: 43,
    term: '유상증자',
    question: '유상증자는 기업이 주식을 발행해 자금을 조달하는 것이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '기존 주주 지분이 희석될 수 있습니다.'
  },
  {
    id: 44,
    term: '무상증자',
    question: '무상증자는 기존 주주에게 무료로 주식을 나눠주는 것이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '기업 가치 자체는 변하지 않습니다.'
  },
  {
    id: 45,
    term: '감자',
    question: '감자는 주식 수를 줄이는 조치이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '재무구조 개선 목적.'
  },
  {
    id: 46,
    term: '상한가',
    question: '상한가는 하루 동안 오를 수 있는 최대 가격이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '한국 증시는 ±30% 제한.'
  },
  {
    id: 47,
    term: '하한가',
    question: '하한가는 하루 동안 내릴 수 있는 최소 가격이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '급락 방지 장치입니다.'
  },
  {
    id: 48,
    term: '현금흐름',
    question: '현금흐름이 좋다는 것은 실제 돈이 잘 들어온다는 뜻이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '기업 생존의 핵심 요소입니다.'
  },
  {
    id: 49,
    term: '신용등급',
    question: '신용등급이 높을수록 대출 금리는 낮아지는 경향이 있다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '상환 능력이 높다고 평가됩니다.'
  },
  {
    id: 50,
    term: '포트폴리오',
    question: '포트폴리오는 여러 투자 자산의 묶음이다.',
    type: 'ox',
    correctAnswer: 0,
    explanation: '개인 투자 전략의 핵심.'
  },
  {
    id: 51,
    term: '현금비중',
    question: '현금 비중을 늘리는 이유는?',
    type: 'multiple',
    options: ['리스크 관리', '수익 극대화', '세금 절감', '거래 증가'],
    correctAnswer: 0,
    explanation: '시장 변동성 대응 목적입니다.'
  }

];

// 배열을 랜덤하게 섞는 함수 (Fisher-Yates 알고리즘)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 랜덤으로 5개의 퀴즈를 가져오는 함수 (팟캐스트 키워드 기반 추천)
export function getTodayQuiz(podcastKeywords?: string[]): QuizQuestion[] {
  if (!podcastKeywords || podcastKeywords.length === 0) {
    const shuffled = shuffleArray(dailyQuizzes);
    return shuffled.slice(0, 5);
  }

  const relatedQuizzes = dailyQuizzes.filter(quiz => 
    podcastKeywords.some(keyword => 
      quiz.term.includes(keyword) || keyword.includes(quiz.term)
    )
  );

  if (relatedQuizzes.length > 0) {
    const numRelated = Math.min(relatedQuizzes.length, 3);
    const selectedRelated = shuffleArray(relatedQuizzes).slice(0, numRelated);
    const remainingQuizzes = dailyQuizzes.filter(q => !selectedRelated.includes(q));
    const randomQuizzes = shuffleArray(remainingQuizzes).slice(0, 5 - numRelated);
    return shuffleArray([...selectedRelated, ...randomQuizzes]);
  }

  const shuffled = shuffleArray(dailyQuizzes);
  return shuffled.slice(0, 5);
}
