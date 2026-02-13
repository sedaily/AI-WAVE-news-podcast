export interface QuizQuestion {
  id: number;
  question: string;
  type: 'ox' | 'multiple';
  options?: string[];
  correctAnswer: number;
  explanation: string;
  term: string;
}

export interface QuizResult {
  questionId: number;
  isCorrect: boolean;
  selectedAnswer: number;
}
