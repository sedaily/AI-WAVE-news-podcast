/**
 * 서울경제 기사 S3 서비스
 * S3 버킷: sedaily-news-xml-storage/daily-xml/
 */

const S3_BASE_URL = 'https://sedaily-news-xml-storage.s3.us-east-1.amazonaws.com/daily-xml';

export interface SedailyArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  writer: string;
  category: string;
  publishedAt: string; // formatted date
}

/**
 * 날짜 포맷 (YYYYMMDD)
 */
function formatDateForS3(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 발행일 포맷팅
 */
function formatPubDate(dateStr: string, timeStr: string): string {
  try {
    const [, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${month}월 ${day}일 ${hours}:${String(minutes).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

/**
 * HTML 태그 제거 및 텍스트 정리
 */
function cleanContent(html: string): string {
  // HTML 엔티티 디코딩
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  // HTML 태그 제거 (img, br 등)
  const text = decoded
    .replace(/<img[^>]*>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

/**
 * XML 파싱 - 서울경제 XML 구조
 */
function parseXMLArticles(xmlText: string): SedailyArticle[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const items = doc.querySelectorAll('item');

  const result: SedailyArticle[] = [];

  items.forEach((item, index) => {
    const title = item.querySelector('title')?.textContent || '';
    const url = item.querySelector('url')?.getAttribute('href') || '';
    const mobileUrl = item.querySelector('mobileUrl')?.getAttribute('href') || '';
    const dateStr = item.querySelector('date')?.textContent || '';
    const timeStr = item.querySelector('time')?.textContent || '';
    const contentRaw = item.querySelector('content')?.textContent || '';
    const author = item.querySelector('author')?.textContent || '';
    const categoryEl = item.querySelector('category');
    const category = categoryEl?.getAttribute('name') || '';
    const nsid = item.querySelector('nsid')?.textContent || '';

    // ID 추출
    const id = nsid || `sedaily-${index}`;

    // 컨텐츠 정리
    const content = cleanContent(contentRaw);

    // 기자 이름 정리 (이메일 제거)
    const writer = author.replace(/\([^)]*\)/g, '').trim();

    result.push({
      id,
      title: title.trim(),
      link: url || mobileUrl,
      pubDate: `${dateStr} ${timeStr}`,
      content,
      writer,
      category,
      publishedAt: formatPubDate(dateStr, timeStr)
    });
  });

  return result;
}

/**
 * 최근 N일간의 서울경제 기사 조회
 */
export async function fetchSedailyArticles(days: number = 3): Promise<SedailyArticle[]> {
  const allArticles: SedailyArticle[] = [];
  const today = new Date();

  console.log('[Sedaily] Fetching articles from S3...');

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = formatDateForS3(targetDate);
    const url = `${S3_BASE_URL}/${dateStr}.xml`;

    try {
      console.log(`[Sedaily] Fetching: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        console.log(`[Sedaily] No data for ${dateStr} (${response.status})`);
        continue;
      }

      const xmlText = await response.text();
      const articles = parseXMLArticles(xmlText);
      allArticles.push(...articles);

      console.log(`[Sedaily] Got ${articles.length} articles for ${dateStr}`);
    } catch (error) {
      console.error(`[Sedaily] Error fetching ${dateStr}:`, error);
    }
  }

  // 최신순 정렬
  allArticles.sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  console.log(`[Sedaily] Total: ${allArticles.length} articles`);
  return allArticles;
}

/**
 * 경제 관련 기사만 필터링 (카테고리 기반)
 * 스포츠, 연예, 문화, 사회 등 제외
 */
export function filterEconomicArticles(articles: SedailyArticle[]): SedailyArticle[] {
  // 제외할 카테고리
  const excludePattern = /스포츠|골프|야구|축구|농구|연예|문화|공연|영화|라이프|여행|건강|레저/;

  return articles.filter(article => {
    // 제외 카테고리면 필터링
    if (excludePattern.test(article.category)) {
      return false;
    }

    // 경제 관련 카테고리
    const economicCategories = /경제|금융|증권|부동산|산업|IT|과학|정치|국제|기업|마켓|투자|재테크/;
    const isEconomicCategory = economicCategories.test(article.category);

    // 제목/내용에 경제 관련 키워드 포함
    const economicKeywords = /경제|금융|증시|주식|부동산|금리|환율|투자|펀드|은행|보험|AI|반도체|수출|무역|코스피|코스닥|나스닥|다우|채권|물가|인플레|기준금리|한국은행|연준|Fed|ETF|IPO|상장|매출|영업이익|실적|M&A|인수|합병/;
    const hasEconomicKeyword = economicKeywords.test(article.title) || economicKeywords.test(article.content.substring(0, 200));

    return isEconomicCategory || hasEconomicKeyword;
  });
}

/**
 * 논설/칼럼 기사 필터링
 */
export function filterEditorialArticles(articles: SedailyArticle[]): SedailyArticle[] {
  return articles.filter(article => {
    // 논설위원, 칼럼, 사설 등
    const isEditorial = /논설|칼럼|사설|기고|寄稿|전문기자|에디터|대표|대기자/.test(article.writer);
    const hasEditorialTitle = /\[.*칼럼\]|\[.*논설\]|\[.*시론\]|\[.*기고\]|\[.*의 /.test(article.title);
    return isEditorial || hasEditorialTitle;
  });
}
