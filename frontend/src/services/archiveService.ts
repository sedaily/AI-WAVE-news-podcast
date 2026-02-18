import type { EconomyPodcast } from '../hooks/useEconomyNews';
import coverImage from '../assets/image.png';

const S3_ENDPOINT = 'https://sedaily-news-xml-storage.s3.amazonaws.com/podcasts';

export interface ArchivedPodcast extends EconomyPodcast {
  date: string;
}

export interface TopicGroup {
  topic: string;
  episodes: ArchivedPodcast[];
  latestDate: string;
  episodeCount: number;
  coverColor: string;
}

// 최근 N일간의 날짜 목록 생성
function getRecentDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().slice(0, 10).replace(/-/g, ''));
  }

  return dates;
}

// 특정 날짜의 팟캐스트 데이터 가져오기
async function fetchPodcastsByDate(dateStr: string): Promise<ArchivedPodcast[]> {
  try {
    const response = await fetch(`${S3_ENDPOINT}/data-${dateStr}.json`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return Object.keys(data)
      .filter(key => key !== '_connections')
      .map(key => {
        const podcast = data[key];
        return {
          keyword: podcast.keyword || '경제',
          title: podcast.title || '',
          duration: podcast.duration || 0,
          audioUrl: podcast.audioUrl || '',
          coverColor: podcast.coverColor || '#6b9b8e',
          coverImage: podcast.coverImage || coverImage,
          chartHeights: podcast.chartHeights || [60, 85, 45, 70, 55, 90],
          summary: podcast.summary || { keyPoints: [], stats: [], topics: [] },
          transcript: podcast.transcript || [],
          relatedKeywords: podcast.relatedKeywords || [],
          date: dateStr
        };
      });
  } catch (error) {
    console.error(`Failed to fetch podcasts for ${dateStr}:`, error);
    return [];
  }
}

// 최근 N일간의 모든 팟캐스트 가져오기
export async function fetchAllArchivedPodcasts(days: number = 30): Promise<ArchivedPodcast[]> {
  const dates = getRecentDates(days);
  const allPodcasts: ArchivedPodcast[] = [];

  // 병렬로 모든 날짜 데이터 가져오기
  const results = await Promise.all(
    dates.map(date => fetchPodcastsByDate(date))
  );

  results.forEach(podcasts => {
    allPodcasts.push(...podcasts);
  });

  return allPodcasts;
}

// 토픽별로 그룹핑
export function groupByTopic(podcasts: ArchivedPodcast[]): TopicGroup[] {
  const topicMap = new Map<string, ArchivedPodcast[]>();

  podcasts.forEach(podcast => {
    const topic = normalizeTopicName(podcast.keyword);
    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }
    topicMap.get(topic)!.push(podcast);
  });

  // TopicGroup 배열로 변환
  const groups: TopicGroup[] = [];

  topicMap.forEach((episodes, topic) => {
    // 날짜순 정렬 (최신순)
    episodes.sort((a, b) => b.date.localeCompare(a.date));

    groups.push({
      topic,
      episodes,
      latestDate: episodes[0]?.date || '',
      episodeCount: episodes.length,
      coverColor: episodes[0]?.coverColor || '#6b9b8e'
    });
  });

  // 에피소드 수 기준 정렬
  groups.sort((a, b) => b.episodeCount - a.episodeCount);

  return groups;
}

// 토픽 이름 정규화 (언더스코어 제거, 공백 정리)
function normalizeTopicName(keyword: string): string {
  return keyword
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 날짜 포맷팅 (20260214 -> 2월 14일)
export function formatDate(dateStr: string): string {
  const month = parseInt(dateStr.slice(4, 6), 10);
  const day = parseInt(dateStr.slice(6, 8), 10);

  return `${month}월 ${day}일`;
}

// 날짜 포맷팅 (20260214 -> 2026.02.14)
export function formatDateFull(dateStr: string): string {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);

  return `${year}.${month}.${day}`;
}
