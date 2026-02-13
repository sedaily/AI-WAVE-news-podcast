// 키워드 점수 관리
interface KeywordScore {
  keyword: string;
  score: number;
  lastUpdated: number;
}

interface UserPreferences {
  keywordScores: Record<string, KeywordScore>;
}

const STORAGE_KEY = 'podcast_user_preferences';
const SCORE_COMPLETE = 3; // 완료 시 점수
const SCORE_PARTIAL = 1;  // 중단 시 점수

// 사용자 선호도 불러오기
export function getUserPreferences(): UserPreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { keywordScores: {} };
  }
  return JSON.parse(stored);
}

// 사용자 선호도 저장
function saveUserPreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// 팟캐스트 청취 시 키워드 점수 업데이트
export function updateKeywordScores(relatedKeywords: string[], isComplete: boolean = false): void {
  const prefs = getUserPreferences();
  const now = Date.now();
  const scoreToAdd = isComplete ? SCORE_COMPLETE : SCORE_PARTIAL;

  relatedKeywords.forEach(keyword => {
    if (prefs.keywordScores[keyword]) {
      prefs.keywordScores[keyword].score += scoreToAdd;
      prefs.keywordScores[keyword].lastUpdated = now;
    } else {
      prefs.keywordScores[keyword] = {
        keyword,
        score: scoreToAdd,
        lastUpdated: now
      };
    }
  });

  saveUserPreferences(prefs);
}

// 키워드 점수 조회
export function getKeywordScore(keyword: string): number {
  const prefs = getUserPreferences();
  return prefs.keywordScores[keyword]?.score || 0;
}

// 상위 키워드 목록 가져오기
export function getTopKeywords(limit: number = 10): KeywordScore[] {
  const prefs = getUserPreferences();
  return Object.values(prefs.keywordScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// 팟캐스트 추천 점수 계산
export function calculateRecommendationScore(relatedKeywords: string[]): number {
  const prefs = getUserPreferences();
  return relatedKeywords.reduce((total, keyword) => {
    return total + (prefs.keywordScores[keyword]?.score || 0);
  }, 0);
}
