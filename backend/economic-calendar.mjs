/**
 * Economic Calendar Lambda
 * 한국은행 ECOS API + FRED API로 경제 일정 수집
 * S3에 저장하여 프론트엔드에서 사용
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });  // S3 버킷은 us-east-1에 위치
const S3_BUCKET = 'sedaily-news-xml-storage';

// API Keys (Lambda 환경변수에서 가져옴)
const BOK_API_KEY = process.env.BOK_API_KEY || '';  // 한국은행 ECOS API
const FRED_API_KEY = process.env.FRED_API_KEY || ''; // FRED API

// 한국은행 주요 경제지표 코드
const BOK_INDICATORS = [
  { code: '722Y001', name: '기준금리', category: 'interest_rate', importance: 'high' },
  { code: '901Y009', name: '소비자물가지수', category: 'inflation', importance: 'high' },
  { code: '200Y001', name: 'GDP', category: 'gdp', importance: 'high' },
  { code: '901Y010', name: '생산자물가지수', category: 'inflation', importance: 'medium' },
  { code: '403Y001', name: '수출입', category: 'trade', importance: 'medium' },
  { code: '901Y062', name: '실업률', category: 'employment', importance: 'high' },
];

// FRED 주요 경제지표 코드
const FRED_INDICATORS = [
  { code: 'FEDFUNDS', name: 'Federal Funds Rate', nameKo: '미국 기준금리', category: 'interest_rate', importance: 'high' },
  { code: 'UNRATE', name: 'Unemployment Rate', nameKo: '미국 실업률', category: 'employment', importance: 'high' },
  { code: 'CPIAUCSL', name: 'CPI', nameKo: '미국 소비자물가지수', category: 'inflation', importance: 'high' },
  { code: 'GDP', name: 'GDP', nameKo: '미국 GDP', category: 'gdp', importance: 'high' },
  { code: 'PAYEMS', name: 'Nonfarm Payrolls', nameKo: '비농업 고용지표', category: 'employment', importance: 'high' },
];

// 주요 경제 이벤트 일정 (정기 발표일 기반)
const RECURRING_EVENTS = [
  // 한국
  { day: 'thursday', week: 2, title: '한국은행 금융통화위원회', country: 'KR', category: 'interest_rate', importance: 'high', time: '10:00' },
  { dayOfMonth: 1, title: '한국 수출입 동향', country: 'KR', category: 'trade', importance: 'medium', time: '09:00' },
  { dayOfMonth: 5, title: '한국 소비자물가지수 (CPI)', country: 'KR', category: 'inflation', importance: 'high', time: '08:00' },

  // 미국
  { day: 'wednesday', week: [3, 6], title: 'FOMC 금리 결정', country: 'US', category: 'interest_rate', importance: 'high', time: '03:00' },
  { day: 'friday', week: 1, title: '미국 비농업 고용지표 (NFP)', country: 'US', category: 'employment', importance: 'high', time: '22:30' },
  { dayOfMonth: 12, title: '미국 소비자물가지수 (CPI)', country: 'US', category: 'inflation', importance: 'high', time: '22:30' },
  { dayOfMonth: 14, title: '미국 생산자물가지수 (PPI)', country: 'US', category: 'inflation', importance: 'medium', time: '22:30' },
  { dayOfMonth: 15, title: '미국 소매판매', country: 'US', category: 'other', importance: 'medium', time: '22:30' },

  // 중국
  { dayOfMonth: 15, title: '중국 GDP (분기)', country: 'CN', category: 'gdp', importance: 'high', time: '11:00', quarterly: true },
  { dayOfMonth: 1, title: '중국 제조업 PMI', country: 'CN', category: 'other', importance: 'medium', time: '10:00' },

  // 일본
  { day: 'friday', week: 3, title: '일본은행 금리 결정', country: 'JP', category: 'interest_rate', importance: 'high', time: '12:00' },

  // 유럽
  { day: 'thursday', week: 2, title: 'ECB 금리 결정', country: 'EU', category: 'interest_rate', importance: 'high', time: '21:45' },
];

// 실적 발표 일정 (주요 기업)
const EARNINGS_SCHEDULE = [
  { company: '삼성전자', country: 'KR', month: [1, 4, 7, 10], dayRange: [7, 10] },
  { company: 'SK하이닉스', country: 'KR', month: [1, 4, 7, 10], dayRange: [25, 28] },
  { company: '현대자동차', country: 'KR', month: [1, 4, 7, 10], dayRange: [25, 28] },
  { company: 'NVIDIA', country: 'US', month: [2, 5, 8, 11], dayRange: [20, 25] },
  { company: 'Apple', country: 'US', month: [1, 4, 7, 10], dayRange: [25, 30] },
];

/**
 * 한국은행 ECOS API에서 데이터 가져오기
 */
async function fetchBOKData(indicatorCode) {
  if (!BOK_API_KEY) return null;

  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 3);

    const formatDate = (d) => d.toISOString().slice(0, 7).replace('-', '');

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/1/${indicatorCode}/M/${formatDate(startDate)}/${formatDate(today)}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.StatisticSearch?.row?.[0];
  } catch (error) {
    console.error(`BOK API error for ${indicatorCode}:`, error);
    return null;
  }
}

/**
 * FRED API에서 데이터 가져오기
 */
async function fetchFREDData(seriesId) {
  if (!FRED_API_KEY) return null;

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.observations?.[0];
  } catch (error) {
    console.error(`FRED API error for ${seriesId}:`, error);
    return null;
  }
}

/**
 * 향후 N일간의 경제 이벤트 생성
 */
function generateUpcomingEvents(days = 14) {
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    const month = date.getMonth() + 1;

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // 정기 이벤트 체크
    for (const event of RECURRING_EVENTS) {
      let matches = false;

      // 요일 + 주차 매칭
      if (event.day && event.week) {
        const weeks = Array.isArray(event.week) ? event.week : [event.week];
        if (event.day === dayName && weeks.includes(weekOfMonth)) {
          matches = true;
        }
      }

      // 특정 일자 매칭
      if (event.dayOfMonth && event.dayOfMonth === dayOfMonth) {
        // 분기별 이벤트 체크
        if (event.quarterly) {
          if ([1, 4, 7, 10].includes(month)) {
            matches = true;
          }
        } else {
          matches = true;
        }
      }

      if (matches) {
        events.push({
          id: `${dateStr}-${event.title.replace(/\s/g, '-')}`,
          date: dateStr,
          time: event.time,
          title: event.title,
          country: event.country,
          category: event.category,
          importance: event.importance,
          description: getEventDescription(event)
        });
      }
    }

    // 실적 발표 체크
    for (const earnings of EARNINGS_SCHEDULE) {
      if (earnings.month.includes(month) &&
          dayOfMonth >= earnings.dayRange[0] &&
          dayOfMonth <= earnings.dayRange[1]) {
        // 해당 월의 첫 매칭 날짜에만 추가
        if (dayOfMonth === earnings.dayRange[0] ||
            (dayOfMonth > earnings.dayRange[0] && i === 0)) {
          events.push({
            id: `${dateStr}-earnings-${earnings.company}`,
            date: dateStr,
            time: earnings.country === 'KR' ? '16:00' : '06:00',
            title: `${earnings.company} 실적 발표`,
            country: earnings.country,
            category: 'earnings',
            importance: 'high',
            description: `${earnings.company} 분기 실적 발표 예정`
          });
        }
      }
    }
  }

  // 날짜/시간순 정렬
  events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return (a.time || '').localeCompare(b.time || '');
  });

  return events;
}

/**
 * 이벤트 설명 생성
 */
function getEventDescription(event) {
  const descriptions = {
    'interest_rate': '기준금리 결정 및 통화정책 방향 발표',
    'inflation': '물가 상승률 지표로 통화정책에 영향',
    'employment': '노동시장 상황을 반영하는 핵심 경제지표',
    'gdp': '경제성장률을 나타내는 핵심 지표',
    'trade': '수출입 동향으로 경제 상황 파악',
    'earnings': '기업 실적 발표',
    'other': '경제 동향 지표'
  };

  return descriptions[event.category] || '';
}

/**
 * 실제 데이터로 이벤트 보강
 */
async function enrichEventsWithRealData(events) {
  // API 키가 있으면 실제 데이터로 보강
  for (const event of events) {
    if (event.country === 'KR' && BOK_API_KEY) {
      const indicator = BOK_INDICATORS.find(ind =>
        event.title.includes(ind.name) || event.category === ind.category
      );
      if (indicator) {
        const data = await fetchBOKData(indicator.code);
        if (data) {
          event.previous = data.DATA_VALUE;
        }
      }
    }

    if (event.country === 'US' && FRED_API_KEY) {
      const indicator = FRED_INDICATORS.find(ind =>
        event.title.includes(ind.nameKo) || event.category === ind.category
      );
      if (indicator) {
        const data = await fetchFREDData(indicator.code);
        if (data) {
          event.previous = data.value;
        }
      }
    }
  }

  return events;
}

/**
 * S3에 캘린더 데이터 저장
 */
async function saveToS3(data) {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `calendar/economic-calendar-${today}.json`,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'max-age=3600' // 1시간 캐시
  });

  await s3Client.send(command);

  // latest 파일도 업데이트
  const latestCommand = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: 'calendar/economic-calendar-latest.json',
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache'
  });

  await s3Client.send(latestCommand);

  console.log(`Saved calendar data to S3: calendar/economic-calendar-${today}.json`);
}

/**
 * Lambda 핸들러
 */
export const handler = async (event) => {
  console.log('Economic Calendar Lambda started');

  try {
    // 1. 향후 14일간의 이벤트 생성
    let events = generateUpcomingEvents(14);
    console.log(`Generated ${events.length} events`);

    // 2. API 키가 있으면 실제 데이터로 보강
    if (BOK_API_KEY || FRED_API_KEY) {
      events = await enrichEventsWithRealData(events);
      console.log('Enriched events with real data');
    }

    // 3. 메타데이터 추가
    const calendarData = {
      generatedAt: new Date().toISOString(),
      eventCount: events.length,
      dateRange: {
        from: events[0]?.date,
        to: events[events.length - 1]?.date
      },
      events: events
    };

    // 4. S3에 저장
    await saveToS3(calendarData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Economic calendar updated successfully',
        eventCount: events.length
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
