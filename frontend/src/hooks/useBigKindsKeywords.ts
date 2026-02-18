import { useState, useEffect } from 'react';
import {
  fetchIssueMapKeywords,
  getFallbackKeywords,
  type BigKindsKeyword
} from '../services/bigkindsService';

export interface UseKeywordsResult {
  keywords: BigKindsKeyword[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * BigKinds API를 통해 오늘의 키워드를 가져오는 hook
 * IssueMap 컴포넌트에서 사용
 */
export function useBigKindsKeywords(): UseKeywordsResult {
  const [keywords, setKeywords] = useState<BigKindsKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchIssueMapKeywords();
      setKeywords(data);
    } catch (err) {
      console.error('BigKinds API failed, using fallback:', err);
      setError('뉴스 키워드를 불러오는데 실패했습니다.');
      // 폴백 데이터 사용
      setKeywords(getFallbackKeywords());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return {
    keywords,
    loading,
    error,
    refetch: fetchKeywords
  };
}

export type { BigKindsKeyword };
