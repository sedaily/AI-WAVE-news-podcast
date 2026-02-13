import type { DailyActivity, StreakInfo } from '../types/history';

const STORAGE_KEY = 'economy_news_history';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// 로컬 스토리지에서 히스토리 가져오기
export function getHistory(): DailyActivity[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// 로컬 스토리지에 히스토리 저장
export function saveHistory(history: DailyActivity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 뉴스 읽음 기록
export function markNewsRead(): void {
  const history = getHistory();
  const today = getTodayDate();
  const existingIndex = history.findIndex(h => h.date === today);

  if (existingIndex >= 0) {
    history[existingIndex].newsRead = true;
  } else {
    history.push({ date: today, newsRead: true });
  }

  saveHistory(history);
}

// 퀴즈 결과 저장
export function saveQuizResult(correct: number, total: number): void {
  const history = getHistory();
  const today = getTodayDate();
  const score = Math.round((correct / total) * 100);
  const existingIndex = history.findIndex(h => h.date === today);

  if (existingIndex >= 0) {
    history[existingIndex].quizScore = score;
    history[existingIndex].quizTotal = total;
    history[existingIndex].quizCorrect = correct;
  } else {
    history.push({
      date: today,
      newsRead: false,
      quizScore: score,
      quizTotal: total,
      quizCorrect: correct
    });
  }

  saveHistory(history);
}

// Streak 계산
export function calculateStreak(): StreakInfo {
  const history = getHistory();
  if (history.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
  }

  // 날짜순 정렬
  const sorted = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date(getTodayDate());

  // 현재 streak 계산
  for (let i = 0; i < sorted.length; i++) {
    const activityDate = new Date(sorted[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (activityDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      currentStreak++;
    } else {
      break;
    }
  }

  // 최장 streak 계산
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sorted[i - 1].date);
      const currDate = new Date(sorted[i].date);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalDays: history.length
  };
}

// 특정 날짜의 활동 가져오기
export function getActivityByDate(date: string): DailyActivity | undefined {
  const history = getHistory();
  return history.find(h => h.date === date);
}
