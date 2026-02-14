export interface DailyActivity {
  date: string; // YYYY-MM-DD 형식
  newsRead: boolean;
  quizScore?: number; // 0-100
  quizTotal?: number; // 총 문제 수
  quizCorrect?: number; // 맞춘 문제 수
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalCorrectAnswers: number;
}
