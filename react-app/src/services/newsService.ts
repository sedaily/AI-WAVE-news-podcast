const API_URL = import.meta.env.DEV 
  ? '/api/' 
  : 'https://or4di2zz5sefbmpy5niafkm6bu0uamot.lambda-url.us-east-1.on.aws/';

export interface NewsArticle {
  id: string;
  title: string;
  subTitle: string;
  content: string;
  categoryCode: string;
  categoryName: string;
  date: string;
  time: string;
  author: string;
  url: string;
  image: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  count: number;
  date: string;
}

// Lambda API에서 경제 뉴스 가져오기
export async function fetchEconomyNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch news');

    const data: NewsResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching economy news:', error);
    return [];
  }
}

// HTML 태그 제거 유틸리티
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&lt;br\/&gt;/g, ' ').trim();
}
