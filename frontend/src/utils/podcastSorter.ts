import type { EconomyPodcast } from '../hooks/useEconomyNews';
import type { InterestCategory } from '../types/interests';
import { INTEREST_CATEGORIES } from '../constants/interestCategories';
import { getUserInterests } from './interestPreferences';
import { calculateRecommendationScore } from './userPreferences';
import { getDecayedCategoryScores, getTopKeywordsWithDecay } from './listeningTracker';

interface ScoredPodcast {
  podcast: EconomyPodcast;
  score: number;
  matchedCategories: InterestCategory[];
}

// 팟캐스트의 관심사 매칭 점수 계산
function calculateInterestScore(
  podcast: EconomyPodcast,
  userCategories: InterestCategory[]
): { score: number; matchedCategories: InterestCategory[] } {
  if (userCategories.length === 0) {
    return { score: 0, matchedCategories: [] };
  }

  const matchedCategories: InterestCategory[] = [];
  let totalScore = 0;

  // 팟캐스트의 키워드 + relatedKeywords 결합
  const podcastKeywords = [
    podcast.keyword,
    ...(podcast.relatedKeywords || [])
  ].map(k => k.toLowerCase());

  // 사용자의 각 관심 카테고리에 대해 매칭 확인
  userCategories.forEach((categoryId, index) => {
    const category = INTEREST_CATEGORIES[categoryId];
    const categoryKeywords = category.keywords.map(k => k.toLowerCase());

    // 카테고리 키워드와 팟캐스트 키워드 매칭
    const hasMatch = categoryKeywords.some(ck =>
      podcastKeywords.some(pk => pk.includes(ck) || ck.includes(pk))
    );

    if (hasMatch) {
      matchedCategories.push(categoryId);
      // 첫 번째 관심사일수록 높은 점수 (우선순위 반영)
      totalScore += (userCategories.length - index) * 10;
    }
  });

  return { score: totalScore, matchedCategories };
}

// 학습된 카테고리 점수 반영
function calculateLearnedCategoryScore(
  podcast: EconomyPodcast,
  learnedScores: Record<InterestCategory, number>
): number {
  const podcastKeywords = [
    podcast.keyword,
    ...(podcast.relatedKeywords || [])
  ].map(k => k.toLowerCase());

  let totalScore = 0;

  Object.entries(INTEREST_CATEGORIES).forEach(([categoryId, info]) => {
    const categoryKeywords = info.keywords.map(k => k.toLowerCase());
    const hasMatch = categoryKeywords.some(ck =>
      podcastKeywords.some(pk => pk.includes(ck) || ck.includes(pk))
    );

    if (hasMatch && learnedScores[categoryId as InterestCategory]) {
      totalScore += learnedScores[categoryId as InterestCategory];
    }
  });

  return totalScore;
}

// 학습된 키워드 점수 반영
function calculateLearnedKeywordScore(
  podcast: EconomyPodcast,
  topKeywords: Array<{ keyword: string; score: number }>
): number {
  const podcastKeywords = [
    podcast.keyword,
    ...(podcast.relatedKeywords || [])
  ].map(k => k.toLowerCase());

  return topKeywords.reduce((total, { keyword, score }) => {
    const keywordLower = keyword.toLowerCase();
    const hasMatch = podcastKeywords.some(pk =>
      pk.includes(keywordLower) || keywordLower.includes(pk)
    );
    return hasMatch ? total + score : total;
  }, 0);
}

// 팟캐스트 개인화 정렬
export function sortPodcastsByPersonalization(
  podcasts: EconomyPodcast[]
): EconomyPodcast[] {
  const { categories } = getUserInterests();
  const learnedCategoryScores = getDecayedCategoryScores();
  const topKeywords = getTopKeywordsWithDecay(20);

  // 학습 데이터가 없고 관심사도 없으면 원본 순서 유지
  const hasLearningData = Object.keys(learnedCategoryScores).length > 0 || topKeywords.length > 0;
  if (categories.length === 0 && !hasLearningData) {
    return podcasts;
  }

  // 각 팟캐스트에 점수 계산
  const scoredPodcasts: ScoredPodcast[] = podcasts.map(podcast => {
    // 1. 사용자가 직접 선택한 관심사 점수
    const { score: interestScore, matchedCategories } = calculateInterestScore(
      podcast,
      categories
    );

    // 2. 기존 청취 행동 기반 점수 (단순 키워드 빈도)
    const behaviorScore = podcast.relatedKeywords
      ? calculateRecommendationScore(podcast.relatedKeywords)
      : 0;

    // 3. 학습된 카테고리 점수 (decay 적용)
    const learnedCategoryScore = calculateLearnedCategoryScore(podcast, learnedCategoryScores);

    // 4. 학습된 키워드 점수 (decay 적용)
    const learnedKeywordScore = calculateLearnedKeywordScore(podcast, topKeywords);

    // 최종 점수 = 관심사*3 + 학습카테고리*2 + 학습키워드*1.5 + 행동점수*1
    const totalScore =
      interestScore * 3 +
      learnedCategoryScore * 2 +
      learnedKeywordScore * 1.5 +
      behaviorScore;

    return {
      podcast,
      score: totalScore,
      matchedCategories
    };
  });

  // 점수 기준 내림차순 정렬
  scoredPodcasts.sort((a, b) => b.score - a.score);

  return scoredPodcasts.map(sp => sp.podcast);
}

// 관심사에 해당하는 팟캐스트만 필터링 (선택적)
export function filterPodcastsByInterest(
  podcasts: EconomyPodcast[],
  categories: InterestCategory[]
): EconomyPodcast[] {
  if (categories.length === 0) {
    return podcasts;
  }

  return podcasts.filter(podcast => {
    const { matchedCategories } = calculateInterestScore(podcast, categories);
    return matchedCategories.length > 0;
  });
}
