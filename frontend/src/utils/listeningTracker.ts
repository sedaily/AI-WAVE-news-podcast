// 청취 행동 상세 추적
import type { InterestCategory } from '../types/interests';
import { INTEREST_CATEGORIES } from '../constants/interestCategories';

export interface ListeningSession {
  podcastId: string;
  keyword: string;
  relatedKeywords: string[];
  startedAt: number;
  endedAt: number | null;
  duration: number;          // 총 길이 (초)
  listenedSeconds: number;   // 실제 들은 시간
  completionRate: number;    // 완료율 (0-1)
  skipped: boolean;          // 스킵 여부
  replayed: boolean;         // 다시 들었는지
  date: string;              // YYYY-MM-DD
}

export interface ListeningStats {
  sessions: ListeningSession[];
  categoryScores: Record<InterestCategory, number>;
  keywordFrequency: Record<string, number>;
  totalListeningTime: number;
  averageCompletionRate: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'podcast_listening_stats';
const MAX_SESSIONS = 200; // 최근 200개 세션만 유지

// 기본값
function getDefaultStats(): ListeningStats {
  return {
    sessions: [],
    categoryScores: {} as Record<InterestCategory, number>,
    keywordFrequency: {},
    totalListeningTime: 0,
    averageCompletionRate: 0,
    lastUpdated: Date.now()
  };
}

// 통계 불러오기
export function getListeningStats(): ListeningStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultStats();
    return JSON.parse(stored);
  } catch {
    return getDefaultStats();
  }
}

// 통계 저장
function saveListeningStats(stats: ListeningStats): void {
  // 오래된 세션 정리
  if (stats.sessions.length > MAX_SESSIONS) {
    stats.sessions = stats.sessions.slice(-MAX_SESSIONS);
  }
  stats.lastUpdated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// 키워드로 카테고리 찾기
function findCategoriesForKeywords(keywords: string[]): InterestCategory[] {
  const matched: InterestCategory[] = [];
  const keywordsLower = keywords.map(k => k.toLowerCase());

  Object.entries(INTEREST_CATEGORIES).forEach(([categoryId, info]) => {
    const categoryKeywords = info.keywords.map(k => k.toLowerCase());
    const hasMatch = categoryKeywords.some(ck =>
      keywordsLower.some(pk => pk.includes(ck) || ck.includes(pk))
    );
    if (hasMatch) {
      matched.push(categoryId as InterestCategory);
    }
  });

  return matched;
}

// 청취 세션 기록
export function recordListeningSession(session: Omit<ListeningSession, 'date'>): void {
  const stats = getListeningStats();
  const today = new Date().toISOString().split('T')[0];

  const fullSession: ListeningSession = {
    ...session,
    date: today
  };

  stats.sessions.push(fullSession);

  // 키워드 빈도 업데이트
  [session.keyword, ...session.relatedKeywords].forEach(kw => {
    stats.keywordFrequency[kw] = (stats.keywordFrequency[kw] || 0) + 1;
  });

  // 카테고리 점수 업데이트
  const matchedCategories = findCategoriesForKeywords([session.keyword, ...session.relatedKeywords]);
  const scoreMultiplier = calculateScoreMultiplier(session.completionRate, session.skipped);

  matchedCategories.forEach(category => {
    stats.categoryScores[category] = (stats.categoryScores[category] || 0) + scoreMultiplier;
  });

  // 총 청취 시간 업데이트
  stats.totalListeningTime += session.listenedSeconds;

  // 평균 완료율 재계산
  const totalCompletionRate = stats.sessions.reduce((sum, s) => sum + s.completionRate, 0);
  stats.averageCompletionRate = totalCompletionRate / stats.sessions.length;

  saveListeningStats(stats);
}

// 완료율과 스킵 여부에 따른 점수 계수
function calculateScoreMultiplier(completionRate: number, skipped: boolean): number {
  if (skipped) return -0.5;
  if (completionRate >= 0.9) return 3;    // 90% 이상 완료
  if (completionRate >= 0.7) return 2;    // 70% 이상
  if (completionRate >= 0.5) return 1;    // 50% 이상
  if (completionRate >= 0.3) return 0.5;  // 30% 이상
  return 0;
}

// 시간 기반 decay 적용된 카테고리 점수 계산
export function getDecayedCategoryScores(): Record<InterestCategory, number> {
  const stats = getListeningStats();
  const now = Date.now();
  const decayedScores: Record<string, number> = {};
  const DECAY_HALF_LIFE = 7 * 24 * 60 * 60 * 1000; // 7일

  // 각 세션별로 decay 적용
  stats.sessions.forEach(session => {
    const age = now - session.endedAt!;
    const decayFactor = Math.pow(0.5, age / DECAY_HALF_LIFE);
    const scoreMultiplier = calculateScoreMultiplier(session.completionRate, session.skipped);

    const categories = findCategoriesForKeywords([session.keyword, ...session.relatedKeywords]);
    categories.forEach(category => {
      decayedScores[category] = (decayedScores[category] || 0) + (scoreMultiplier * decayFactor);
    });
  });

  return decayedScores as Record<InterestCategory, number>;
}

// 추천 카테고리 (행동 기반)
export function getRecommendedCategories(limit: number = 3): InterestCategory[] {
  const decayedScores = getDecayedCategoryScores();

  return Object.entries(decayedScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category]) => category as InterestCategory);
}

// 자주 듣는 키워드 (decay 적용)
export function getTopKeywordsWithDecay(limit: number = 10): Array<{ keyword: string; score: number }> {
  const stats = getListeningStats();
  const now = Date.now();
  const keywordScores: Record<string, number> = {};
  const DECAY_HALF_LIFE = 7 * 24 * 60 * 60 * 1000;

  stats.sessions.forEach(session => {
    const age = now - session.endedAt!;
    const decayFactor = Math.pow(0.5, age / DECAY_HALF_LIFE);
    const scoreMultiplier = calculateScoreMultiplier(session.completionRate, session.skipped);

    [session.keyword, ...session.relatedKeywords].forEach(kw => {
      keywordScores[kw] = (keywordScores[kw] || 0) + (scoreMultiplier * decayFactor);
    });
  });

  return Object.entries(keywordScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([keyword, score]) => ({ keyword, score }));
}

// 청취 패턴 분석
export function getListeningPatterns(): {
  preferredHours: number[];
  preferredDays: number[];
  avgSessionLength: number;
} {
  const stats = getListeningStats();
  const hourCounts: Record<number, number> = {};
  const dayCounts: Record<number, number> = {};
  let totalSessionLength = 0;

  stats.sessions.forEach(session => {
    const date = new Date(session.startedAt);
    const hour = date.getHours();
    const day = date.getDay();

    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    totalSessionLength += session.listenedSeconds;
  });

  // 상위 3개 시간대
  const preferredHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // 상위 3개 요일
  const preferredDays = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([day]) => parseInt(day));

  const avgSessionLength = stats.sessions.length > 0
    ? totalSessionLength / stats.sessions.length
    : 0;

  return { preferredHours, preferredDays, avgSessionLength };
}

// 최근 7일 청취 통계
export function getWeeklyStats(): {
  totalSessions: number;
  totalMinutes: number;
  avgCompletionRate: number;
  topCategories: InterestCategory[];
} {
  const stats = getListeningStats();
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const recentSessions = stats.sessions.filter(s => s.startedAt >= weekAgo);

  const totalMinutes = recentSessions.reduce((sum, s) => sum + s.listenedSeconds, 0) / 60;
  const avgCompletionRate = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length
    : 0;

  return {
    totalSessions: recentSessions.length,
    totalMinutes: Math.round(totalMinutes),
    avgCompletionRate: Math.round(avgCompletionRate * 100),
    topCategories: getRecommendedCategories(3)
  };
}
