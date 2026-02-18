/**
 * Economic Calendar Service
 * S3에서 경제 캘린더 데이터를 가져와 제공
 */

export interface EconomicEvent {
  id: string;
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:MM (24시간제)
  title: string;
  country: 'KR' | 'US' | 'JP' | 'CN' | 'EU';
  category: 'interest_rate' | 'gdp' | 'employment' | 'inflation' | 'trade' | 'earnings' | 'policy' | 'other';
  importance: 'high' | 'medium' | 'low';
  previous?: string;      // 이전 수치
  forecast?: string;      // 예상 수치
  actual?: string;        // 실제 수치 (발표 후)
  description?: string;
}

interface CalendarData {
  generatedAt: string;
  eventCount: number;
  dateRange: {
    from: string;
    to: string;
  };
  events: EconomicEvent[];
}

// 국가 플래그 이모지
export const countryFlags: Record<EconomicEvent['country'], string> = {
  KR: '🇰🇷',
  US: '🇺🇸',
  JP: '🇯🇵',
  CN: '🇨🇳',
  EU: '🇪🇺'
};

// 카테고리 라벨
export const categoryLabels: Record<EconomicEvent['category'], string> = {
  interest_rate: '금리',
  gdp: 'GDP',
  employment: '고용',
  inflation: '물가',
  trade: '무역',
  earnings: '실적',
  policy: '정책',
  other: '기타'
};

// 중요도 라벨
export const importanceLabels: Record<EconomicEvent['importance'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음'
};

// S3 엔드포인트
const S3_CALENDAR_URL = 'https://sedaily-news-xml-storage.s3.amazonaws.com/calendar/economic-calendar-latest.json';

// 캐시
let cachedData: CalendarData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30분

/**
 * S3에서 경제 캘린더 데이터 가져오기
 */
async function fetchCalendarFromS3(): Promise<CalendarData | null> {
  try {
    const response = await fetch(S3_CALENDAR_URL, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Failed to fetch calendar from S3:', response.status);
      return null;
    }

    const data: CalendarData = await response.json();
    console.log(`[Calendar] Loaded ${data.eventCount} events from S3`);
    return data;
  } catch (error) {
    console.error('Failed to fetch calendar from S3:', error);
    return null;
  }
}

/**
 * 폴백용 로컬 이벤트 생성
 */
function generateFallbackEvents(): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const today = new Date();

  // 정기 이벤트 템플릿
  const templates = [
    { dayOffset: 0, time: '09:00', title: '한국 소비자물가지수 (CPI)', country: 'KR' as const, category: 'inflation' as const, importance: 'high' as const },
    { dayOffset: 1, time: '22:30', title: '미국 비농업 고용지표 (NFP)', country: 'US' as const, category: 'employment' as const, importance: 'high' as const },
    { dayOffset: 2, time: '10:00', title: '한국 수출입 동향', country: 'KR' as const, category: 'trade' as const, importance: 'medium' as const },
    { dayOffset: 3, time: '11:00', title: '중국 제조업 PMI', country: 'CN' as const, category: 'other' as const, importance: 'medium' as const },
    { dayOffset: 4, time: '03:00', title: 'FOMC 금리 결정', country: 'US' as const, category: 'interest_rate' as const, importance: 'high' as const },
    { dayOffset: 5, time: '10:00', title: '한국은행 금융통화위원회', country: 'KR' as const, category: 'interest_rate' as const, importance: 'high' as const },
    { dayOffset: 6, time: '08:00', title: '한국 GDP 성장률 (분기)', country: 'KR' as const, category: 'gdp' as const, importance: 'high' as const },
    { dayOffset: 7, time: '16:00', title: '삼성전자 실적 발표', country: 'KR' as const, category: 'earnings' as const, importance: 'high' as const },
    { dayOffset: 8, time: '22:30', title: '미국 소비자물가지수 (CPI)', country: 'US' as const, category: 'inflation' as const, importance: 'high' as const },
    { dayOffset: 9, time: '21:45', title: 'ECB 금리 결정', country: 'EU' as const, category: 'interest_rate' as const, importance: 'high' as const },
    { dayOffset: 10, time: '12:00', title: '일본은행 금리 결정', country: 'JP' as const, category: 'interest_rate' as const, importance: 'high' as const },
    { dayOffset: 11, time: '11:00', title: '중국 GDP (분기)', country: 'CN' as const, category: 'gdp' as const, importance: 'high' as const },
    { dayOffset: 12, time: '22:30', title: '미국 소매판매', country: 'US' as const, category: 'other' as const, importance: 'medium' as const },
    { dayOffset: 13, time: '06:00', title: 'NVIDIA 실적 발표', country: 'US' as const, category: 'earnings' as const, importance: 'high' as const },
  ];

  for (const template of templates) {
    const date = new Date(today);
    date.setDate(date.getDate() + template.dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    events.push({
      id: `${dateStr}-${template.title.replace(/\s/g, '-')}`,
      date: dateStr,
      time: template.time,
      title: template.title,
      country: template.country,
      category: template.category,
      importance: template.importance,
      description: getEventDescription(template.category)
    });
  }

  return events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return (a.time || '').localeCompare(b.time || '');
  });
}

/**
 * 이벤트 설명
 */
function getEventDescription(category: string): string {
  const descriptions: Record<string, string> = {
    interest_rate: '기준금리 결정 및 통화정책 방향 발표',
    inflation: '물가 상승률 지표로 통화정책에 영향',
    employment: '노동시장 상황을 반영하는 핵심 경제지표',
    gdp: '경제성장률을 나타내는 핵심 지표',
    trade: '수출입 동향으로 경제 상황 파악',
    earnings: '기업 실적 발표',
    other: '경제 동향 지표'
  };
  return descriptions[category] || '';
}

/**
 * 경제 캘린더 이벤트 조회
 */
export async function getEconomicEvents(days: number = 14): Promise<EconomicEvent[]> {
  const now = Date.now();

  // 캐시 확인
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return filterEventsByDays(cachedData.events, days);
  }

  // S3에서 데이터 가져오기
  const s3Data = await fetchCalendarFromS3();

  if (s3Data) {
    cachedData = s3Data;
    cacheTimestamp = now;
    return filterEventsByDays(s3Data.events, days);
  }

  // 폴백: 로컬 생성
  console.log('[Calendar] Using fallback data');
  const fallbackEvents = generateFallbackEvents();
  return filterEventsByDays(fallbackEvents, days);
}

/**
 * 일수로 이벤트 필터링
 */
function filterEventsByDays(events: EconomicEvent[], days: number): EconomicEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate < endDate;
  });
}

/**
 * 오늘의 주요 이벤트 조회
 */
export async function getTodayEvents(): Promise<EconomicEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const events = await getEconomicEvents(1);
  return events.filter(e => e.date === today);
}

/**
 * 중요도 높은 이벤트만 조회
 */
export async function getHighImportanceEvents(days: number = 7): Promise<EconomicEvent[]> {
  const events = await getEconomicEvents(days);
  return events.filter(e => e.importance === 'high');
}

/**
 * 날짜 포맷팅 (상대적)
 */
export function formatEventDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === 2) return '모레';
  if (diffDays < 7) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${days[eventDate.getDay()]}요일`;
  }

  const month = eventDate.getMonth() + 1;
  const day = eventDate.getDate();
  return `${month}/${day}`;
}

/**
 * 시간 포맷팅
 */
export function formatEventTime(time?: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
}
