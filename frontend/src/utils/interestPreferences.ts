import type { UserInterests, InterestCategory } from '../types/interests';

const STORAGE_KEY = 'podcast_user_interests';
const CURRENT_VERSION = 1;

// 기본값
const DEFAULT_INTERESTS: UserInterests = {
  categories: [],
  onboardingCompleted: false,
  completedAt: null,
  version: CURRENT_VERSION
};

// 사용자 관심사 불러오기
export function getUserInterests(): UserInterests {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_INTERESTS;

    const parsed = JSON.parse(stored) as UserInterests;

    // 버전 마이그레이션 (향후 확장용)
    if (parsed.version !== CURRENT_VERSION) {
      parsed.version = CURRENT_VERSION;
      saveUserInterests(parsed);
    }

    return parsed;
  } catch {
    return DEFAULT_INTERESTS;
  }
}

// 사용자 관심사 저장
export function saveUserInterests(interests: UserInterests): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interests));
}

// 온보딩 완료 여부 확인
export function isOnboardingCompleted(): boolean {
  return getUserInterests().onboardingCompleted;
}

// 온보딩 완료 처리
export function completeOnboarding(categories: InterestCategory[]): void {
  const interests: UserInterests = {
    categories,
    onboardingCompleted: true,
    completedAt: Date.now(),
    version: CURRENT_VERSION
  };
  saveUserInterests(interests);
}

// 관심사 업데이트 (설정에서)
export function updateInterests(categories: InterestCategory[]): void {
  const current = getUserInterests();
  saveUserInterests({
    ...current,
    categories
  });
}

// 온보딩 리셋 (개발/테스트용)
export function resetOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
}
