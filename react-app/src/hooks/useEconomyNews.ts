import { useState, useEffect } from 'react';
import type { Podcast } from '../types/podcast';
import coverImage from '../assets/image.png';

export interface EconomyPodcast extends Podcast {
  articleUrl?: string;
  articleImage?: string;
}

interface S3PodcastData {
  [key: string]: any;
  _connections?: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
}

// S3에서 팟캐스트 데이터 가져오기
async function fetchPodcastsFromS3(): Promise<EconomyPodcast[]> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const S3_ENDPOINT = 'https://sedaily-news-xml-storage.s3.amazonaws.com/podcasts';
  
  try {
    console.log(`Loading podcast data for ${today}...`);
    const response = await fetch(`${S3_ENDPOINT}/data-${today}.json`);
    
    if (!response.ok) {
      throw new Error('Today\'s podcast data not found');
    }
    
    const data: S3PodcastData = await response.json();
    console.log('Loaded data from S3:', data);
    
    // S3 데이터를 EconomyPodcast 배열로 변환
    const podcasts: EconomyPodcast[] = Object.keys(data)
      .filter(key => key !== '_connections')
      .map(key => {
        const podcast = data[key];
        console.log(`Podcast ${key}:`, {
          keyword: podcast.keyword,
          audioUrl: podcast.audioUrl,
          duration: podcast.duration
        });
        return {
          keyword: podcast.keyword || '경제',
          title: podcast.title || '',
          duration: podcast.duration || 0,
          audioUrl: podcast.audioUrl || '',
          coverColor: podcast.coverColor || '#6b9b8e',
          coverImage: podcast.coverImage || coverImage,
          chartHeights: podcast.chartHeights || [60, 85, 45, 70, 55, 90],
          summary: podcast.summary || {
            keyPoints: [],
            stats: [],
            topics: []
          },
          transcript: podcast.transcript || [],
          articleUrl: '',
          articleImage: podcast.coverImage || ''
        };
      });
    
    return podcasts;
  } catch (error) {
    console.error('Failed to load from S3:', error);
    throw error;
  }
}

// 더미 데이터 (S3 로드 실패 시 사용)
function getDummyPodcasts(): EconomyPodcast[] {
  const colors = ['#6b9b8e', '#8b7ba8', '#7ba3c0', '#7cb89d'];
  
  return [
    {
      keyword: 'AI 기술',
      title: 'ChatGPT와 AI의 미래',
      duration: 300,
      audioUrl: '',
      coverColor: colors[0],
      coverImage: coverImage,
      chartHeights: [60, 85, 45, 70, 55, 90],
      summary: {
        keyPoints: ['생성형 AI가 콘텐츠 제작 산업을 혁신하고 있습니다'],
        stats: [],
        topics: ['AI 기술', '생성형 AI']
      },
      transcript: [
        { start: 0, end: 60, text: '안녕하세요, 오늘은 AI 기술에 대해 이야기해보겠습니다.' }
      ]
    },
    {
      keyword: '경제 동향',
      title: '2024 글로벌 경제 전망',
      duration: 300,
      audioUrl: '',
      coverColor: colors[1],
      coverImage: coverImage,
      chartHeights: [75, 50, 90, 65, 80, 55],
      summary: {
        keyPoints: ['금리 인하 기대감으로 증시가 상승세를 보이고 있습니다'],
        stats: [],
        topics: ['경제', '금리']
      },
      transcript: [
        { start: 0, end: 60, text: '2024년 글로벌 경제 전망에 대해 살펴보겠습니다.' }
      ]
    }
  ];
}

export function useEconomyNews() {
  const [podcasts, setPodcasts] = useState<EconomyPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        
        // S3에서 팟캐스트 데이터 로드 시도
        try {
          const s3Podcasts = await fetchPodcastsFromS3();
          setPodcasts(s3Podcasts);
          console.log('Using S3 podcast data');
        } catch (s3Error) {
          // S3 로드 실패 시 더미 데이터 사용
          console.log('Using dummy data');
          setPodcasts(getDummyPodcasts());
        }
        
      } catch (err) {
        setError('팟캐스트를 불러오는데 실패했습니다.');
        console.error(err);
        setPodcasts(getDummyPodcasts());
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return { podcasts, loading, error };
}
