/**
 * BigKinds API Service
 * 빅카인즈 뉴스 빅데이터 분석 시스템 연동
 * Documentation: https://www.bigkinds.or.kr
 */

const BIGKINDS_API_URL = 'https://tools.kinds.or.kr';
const BIGKINDS_ACCESS_KEY = '5bf1dc66-79f7-4788-9593-be209e4472e3';

// 이슈 랭킹 응답 타입 (실제 API 응답 기반)
export interface IssueRankingItem {
  topic: string;
  topic_rank: number;
  topic_keyword: string;
  topic_content: string;
  news_cluster: string[];
}

export interface IssueRankingResponse {
  result: number;
  return_object: {
    date: string;
    topics: IssueRankingItem[];
  };
}

// 오늘의 키워드 응답 타입
export interface TodayKeywordItem {
  word: string;
  count: number;
  category: string;
}

export interface TodayKeywordResponse {
  result: number;
  return_object: {
    keywords: TodayKeywordItem[];
  };
}

// 뉴스 검색 결과 타입 (API 응답 필드명은 소문자)
export interface NewsDocument {
  news_id: string;
  title: string;
  content: string;
  published_at: string;
  provider: string;
  category?: string[];
  byline?: string;
  images?: string;
  images_caption?: string;
}

// 뉴스 상세 정보 (UI 표시용)
export interface NewsArticle {
  id: string;
  title: string;
  provider: string;
  publishedAt: string;
  byline?: string;
  content?: string;
  url: string;  // 빅카인즈 뉴스 상세 페이지 URL
}

export interface NewsSearchResponse {
  result: number;
  return_object: {
    total_hits: number;
    documents: NewsDocument[];
  };
}

// IssueMap에서 사용할 통합 키워드 타입
export interface BigKindsKeyword {
  keyword: string;
  newsCount: number;
  rank?: number;
  category?: string;
  relatedKeywords?: string[];
  topicContent?: string;  // 토픽 요약 내용
  newsClusterIds?: string[];  // 관련 뉴스 ID 목록
}

// 연관어 분석 API 응답 타입
export interface WordCloudNode {
  id: string;
  name: string;
  level: number;   // 1: 중심어, 2: 연관어
  weight: number;  // 가중치 (연관도)
}

export interface WordCloudResponse {
  result: number;
  return_object: {
    nodes: WordCloudNode[];
  };
}

// 연관어 관계 타입 (노드간 연결용)
export interface KeywordRelation {
  sourceKeyword: string;
  targetKeyword: string;
  weight: number;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * N일 전 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getDateStringDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 오늘의 이슈 랭킹 조회
 * 가장 핫한 뉴스 토픽을 순위와 함께 반환
 */
export async function fetchIssueRanking(): Promise<BigKindsKeyword[]> {
  try {
    const todayDate = getTodayDateString();
    console.log('[BigKinds] Fetching issue ranking for date:', todayDate);

    const response = await fetch(`${BIGKINDS_API_URL}/issue_ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          date: todayDate
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data: IssueRankingResponse = await response.json();
    console.log('[BigKinds] API response result:', data.result);

    if (data.result !== 0) {
      throw new Error('BigKinds API returned error result');
    }

    // 이슈 랭킹을 키워드 형태로 변환
    // news_cluster 배열 길이가 기사 건수, topic_keyword는 쉼표로 구분된 연관 키워드
    return data.return_object.topics.map((topic) => {
      const relatedKeywords = topic.topic_keyword
        ? topic.topic_keyword.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : [];

      return {
        keyword: topic.topic,
        newsCount: topic.news_cluster?.length || 10, // 기사 건수
        rank: topic.topic_rank,
        relatedKeywords,
        topicContent: topic.topic_content || '',  // 요약 내용
        newsClusterIds: topic.news_cluster || []  // 관련 뉴스 ID
      };
    });
  } catch (error) {
    console.error('Failed to fetch issue ranking:', error);
    throw error;
  }
}

/**
 * 카테고리별 오늘의 키워드 조회
 * @param category 경제, 사회, 정치, 국제, IT_과학 등
 */
export async function fetchTodayKeywords(category: string = '경제'): Promise<BigKindsKeyword[]> {
  try {
    const response = await fetch(`${BIGKINDS_API_URL}/today_category_keyword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          category: category
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data: TodayKeywordResponse = await response.json();

    if (data.result !== 0) {
      throw new Error('BigKinds API returned error result');
    }

    return data.return_object.keywords.map(kw => ({
      keyword: kw.word,
      newsCount: kw.count,
      category: kw.category || category
    }));
  } catch (error) {
    console.error('Failed to fetch today keywords:', error);
    throw error;
  }
}

/**
 * 키워드로 뉴스 검색
 */
export async function searchNews(keyword: string, limit: number = 5): Promise<NewsDocument[]> {
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7); // 최근 7일

    const response = await fetch(`${BIGKINDS_API_URL}/search/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          query: keyword,
          published_at: {
            from: from.toISOString().split('T')[0],
            until: today.toISOString().split('T')[0]
          },
          sort: { date: 'desc' },
          return_from: 0,
          return_size: limit,
          fields: ['title', 'content', 'provider_news_id', 'dateline', 'provider', 'category']
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data: NewsSearchResponse = await response.json();

    if (data.result !== 0) {
      throw new Error('BigKinds API returned error result');
    }

    return data.return_object.documents;
  } catch (error) {
    console.error('Failed to search news:', error);
    throw error;
  }
}

/**
 * 연관어 분석 API (Word Cloud)
 * 키워드의 연관어를 가중치와 함께 반환
 * @param query 검색 키워드
 * @param days 최근 N일간 데이터 (기본 7일)
 */
export async function fetchWordCloud(query: string, days: number = 7): Promise<WordCloudNode[]> {
  try {
    const fromDate = getDateStringDaysAgo(days);
    const toDate = getTodayDateString();

    console.log(`[BigKinds] Fetching word cloud for: "${query}" (${fromDate} ~ ${toDate})`);

    const response = await fetch(`${BIGKINDS_API_URL}/word_cloud`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          query: query,
          published_at: {
            from: fromDate,
            until: toDate
          },
          provider: [],  // 모든 언론사
          category: [],  // 모든 카테고리
          category_incident: [],
          byline: '',
          provider_subject: [],
          subject_info: [],
          subject_info1: [],
          subject_info2: [],
          subject_info3: [],
          subject_info4: []
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds word_cloud API error: ${response.status}`);
    }

    const data: WordCloudResponse = await response.json();

    if (data.result !== 0) {
      console.warn(`[BigKinds] word_cloud returned error for "${query}"`);
      return [];
    }

    const nodes = data.return_object?.nodes || [];
    console.log(`[BigKinds] Got ${nodes.length} related words for "${query}"`);

    return nodes;
  } catch (error) {
    console.error(`[BigKinds] Failed to fetch word cloud for "${query}":`, error);
    return [];
  }
}

/**
 * 여러 키워드의 연관어를 한 번에 조회하고 관계 맵 생성
 * @param keywords 키워드 목록
 * @returns 키워드 간 연결 관계 배열
 */
export async function fetchKeywordRelations(keywords: string[]): Promise<KeywordRelation[]> {
  const relations: KeywordRelation[] = [];
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  console.log('[BigKinds] Fetching relations for keywords:', keywords);

  // 각 키워드의 연관어 조회
  for (const keyword of keywords) {
    try {
      const wordCloudNodes = await fetchWordCloud(keyword, 7);

      // 연관어 중에서 현재 표시된 키워드와 일치하는 것 찾기
      for (const node of wordCloudNodes) {
        const nodeName = node.name.toLowerCase();

        // 자기 자신이 아니고, 현재 키워드 목록에 있는 연관어인 경우
        if (nodeName !== keyword.toLowerCase() && keywordSet.has(nodeName)) {
          relations.push({
            sourceKeyword: keyword,
            targetKeyword: node.name,
            weight: node.weight
          });
        }
      }
    } catch (error) {
      console.error(`[BigKinds] Failed to get relations for "${keyword}":`, error);
    }
  }

  console.log(`[BigKinds] Found ${relations.length} keyword relations`);
  return relations;
}

/**
 * IssueMap용 통합 키워드 데이터 조회
 * 이슈 랭킹 데이터를 가져와서 표시
 */
export async function fetchIssueMapKeywords(): Promise<BigKindsKeyword[]> {
  try {
    console.log('[BigKinds] Fetching IssueMap keywords...');

    // 이슈 랭킹 조회
    const issueRanking = await fetchIssueRanking();

    console.log('[BigKinds] Got', issueRanking.length, 'keywords from issue ranking');

    // 상위 10개 키워드 반환
    const keywords = issueRanking.slice(0, 10);

    // 로깅
    keywords.forEach(kw => {
      console.log(`[BigKinds] Keyword: ${kw.keyword}, newsCount: ${kw.newsCount}, rank: ${kw.rank}`);
    });

    // 최소 1개 이상의 키워드 확보
    if (keywords.length < 1) {
      throw new Error('No keywords from BigKinds');
    }

    return keywords;
  } catch (error) {
    console.error('[BigKinds] Failed to fetch IssueMap keywords:', error);
    throw error;
  }
}

/**
 * 빅카인즈 뉴스 상세 페이지 URL 생성
 * @param newsId 뉴스 ID (예: "01500601.20260216065441001")
 */
export function getBigKindsNewsUrl(newsId: string): string {
  return `https://www.bigkinds.or.kr/v2/news/newsDetailView.do?newsId=${encodeURIComponent(newsId)}`;
}

/**
 * 뉴스 ID 목록으로 기사 상세 정보 조회
 * @param newsIds 뉴스 ID 배열
 * @param limit 최대 조회 개수 (기본 5개)
 */
export async function fetchNewsByIds(newsIds: string[], limit: number = 5): Promise<NewsArticle[]> {
  if (!newsIds || newsIds.length === 0) {
    return [];
  }

  try {
    // 최대 limit개만 조회
    const idsToFetch = newsIds.slice(0, limit);
    console.log('[BigKinds] Fetching news by IDs:', idsToFetch);

    const response = await fetch(`${BIGKINDS_API_URL}/search/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          news_ids: idsToFetch,
          fields: [
            'news_id',
            'title',
            'content',
            'byline',
            'published_at',
            'provider'
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[BigKinds] News fetch result:', data.result);

    if (data.result !== 0) {
      console.error('[BigKinds] API error:', data.reason || 'Unknown error');
      return [];
    }

    const documents: NewsDocument[] = data.return_object?.documents || [];

    // NewsArticle 형태로 변환
    return documents.map(doc => ({
      id: doc.news_id,
      title: doc.title || '제목 없음',
      provider: doc.provider || '언론사 미상',
      publishedAt: formatPublishedAt(doc.published_at),
      byline: doc.byline,
      content: doc.content ? doc.content.substring(0, 200) + '...' : undefined,
      url: getBigKindsNewsUrl(doc.news_id)
    }));
  } catch (error) {
    console.error('[BigKinds] Failed to fetch news by IDs:', error);
    return [];
  }
}

/**
 * 발행일 포맷팅
 */
function formatPublishedAt(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  } catch {
    return dateStr;
  }
}

/**
 * 전문가/논설 기사 조회 (서울경제 등 주요 경제지)
 * 논설위원, 칼럼, 사설 등 양질의 경제 콘텐츠
 */
export interface ExpertArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  provider: string;
  byline: string;
  publishedAt: string;
  category: string;
  url: string;
}

export async function fetchExpertArticles(limit: number = 10): Promise<ExpertArticle[]> {
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 3); // 최근 3일

    console.log('[BigKinds] Fetching expert/editorial articles...');

    const response = await fetch(`${BIGKINDS_API_URL}/search/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: BIGKINDS_ACCESS_KEY,
        argument: {
          query: '경제 OR 금융 OR 증시 OR 부동산',
          published_at: {
            from: from.toISOString().split('T')[0],
            until: today.toISOString().split('T')[0]
          },
          provider: [
            '서울경제',
            '한국경제',
            '매일경제',
            '머니투데이',
            '이데일리'
          ],
          category: ['경제'],
          sort: { date: 'desc' },
          return_from: 0,
          return_size: limit,
          fields: [
            'news_id',
            'title',
            'content',
            'byline',
            'published_at',
            'provider',
            'category'
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 0) {
      console.error('[BigKinds] Expert articles API error');
      return [];
    }

    const documents: NewsDocument[] = data.return_object?.documents || [];

    return documents.map(doc => ({
      id: doc.news_id,
      title: doc.title || '제목 없음',
      content: doc.content || '',
      summary: doc.content ? doc.content.substring(0, 150) + '...' : '',
      provider: doc.provider || '서울경제',
      byline: doc.byline || '편집부',
      publishedAt: formatPublishedAt(doc.published_at),
      category: Array.isArray(doc.category) ? doc.category[0] : '경제',
      url: getBigKindsNewsUrl(doc.news_id)
    }));
  } catch (error) {
    console.error('[BigKinds] Failed to fetch expert articles:', error);
    return [];
  }
}

// 폴백용 기본 키워드 (API 실패 시)
export function getFallbackKeywords(): BigKindsKeyword[] {
  return [
    { keyword: '금리', newsCount: 320, category: '경제' },
    { keyword: '환율', newsCount: 85, category: '경제' },
    { keyword: '반도체', newsCount: 450, category: '경제' },
    { keyword: 'AI', newsCount: 380, category: 'IT_과학' },
    { keyword: '주식', newsCount: 210, category: '경제' },
    { keyword: '부동산', newsCount: 150, category: '경제' },
    { keyword: '인플레이션', newsCount: 45, category: '경제' },
    { keyword: '무역', newsCount: 60, category: '경제' }
  ];
}
