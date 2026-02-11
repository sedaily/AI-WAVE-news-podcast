import { useState, useEffect } from 'react';
import { fetchEconomyNews, stripHtml, type NewsArticle } from '../services/newsService';
import type { Podcast } from '../types/podcast';
import coverImage from '../assets/image.png';

export interface EconomyPodcast extends Podcast {
  articleUrl: string;
  articleImage: string;
}

// 뉴스 기사를 팟캐스트 형식으로 변환
function articleToPodcast(article: NewsArticle, index: number): EconomyPodcast {
  const cleanContent = stripHtml(article.content);

  // 컨텐츠를 문장 단위로 분리 (약 60자씩)
  const sentences = cleanContent.match(/.{1,60}[.!?]?\s*/g) || [cleanContent];
  const transcript = sentences.slice(0, 4).map((text, i) => ({
    start: i * 15,
    end: (i + 1) * 15,
    text: text.trim()
  }));

  const colors = ['#6b9b8e', '#8b7ba8', '#7ba3c0', '#7cb89d', '#c4a574', '#a87b7b'];

  return {
    keyword: article.categoryName.split(',')[0] || '경제',
    title: article.title,
    duration: transcript.length * 15,
    audioUrl: '',
    coverColor: colors[index % colors.length],
    coverImage: article.image || coverImage,
    chartHeights: [60, 85, 45, 70, 55, 90],
    summary: {
      keyPoints: [
        article.subTitle ? stripHtml(article.subTitle).slice(0, 50) : article.title.slice(0, 50)
      ],
      stats: [],
      topics: [article.categoryName]
    },
    transcript,
    articleUrl: article.url,
    articleImage: article.image
  };
}

export function useEconomyNews() {
  const [podcasts, setPodcasts] = useState<EconomyPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const articles = await fetchEconomyNews();
        const podcastList = articles.slice(0, 4).map(articleToPodcast);
        setPodcasts(podcastList);
      } catch (err) {
        setError('뉴스를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return { podcasts, loading, error };
}
