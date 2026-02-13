export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface Summary {
  keyPoints: string[];
  stats: Stat[];
  topics: string[];
}

export interface Podcast {
  keyword: string;
  title: string;
  duration: number;
  audioUrl: string;
  coverColor: string;
  coverImage?: string;
  chartHeights: number[];
  summary: Summary;
  transcript: TranscriptSegment[];
  relatedKeywords?: string[];
}

export type PodcastKey = 'ai' | 'economy' | 'tech' | 'climate';

export type PodcastData = Record<PodcastKey, Podcast>;
