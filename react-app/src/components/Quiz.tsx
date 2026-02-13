import { useState } from 'react';
import type { QuizQuestion, QuizResult } from '../types/quiz';
import { getTodayQuiz } from '../data/quizData';

interface QuizProps {
  onClose: () => void;
}

function Quiz({ onClose }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(getTodayQuiz());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setResults([...results, {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswer
    }]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setQuestions(getTodayQuiz()); // 새로운 랜덤 문제 가져오기
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    setIsFinished(false);
  };

  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / questions.length) * 100);

  if (isFinished) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>경제용어 퀴즈</h2>
          <button className="quiz-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="quiz-result">
          <div className="result-score">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-label">점</span>
            </div>
            <h3>퀴즈 완료!</h3>
            <p>{correctCount}개 / {questions.length}개 정답</p>
          </div>

          <div className="result-summary">
            {questions.map((q, index) => {
              const result = results[index];
              return (
                <div key={q.id} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <span className="result-icon">{result.isCorrect ? '✓' : '✗'}</span>
                  <span className="result-term">{q.term}</span>
                </div>
              );
            })}
          </div>

          <div className="result-actions">
            <button className="btn-secondary" onClick={handleRestart}>다시 풀기</button>
            <button className="btn-primary" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>경제용어 퀴즈</h2>
        <button className="quiz-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="quiz-content">
        <div className="quiz-term">{currentQuestion.term}</div>
        <h3 className="quiz-question">{currentQuestion.question}</h3>

        <div className="quiz-options">
          {currentQuestion.type === 'ox' ? (
            <>
              <button
                className={`quiz-option ${selectedAnswer === 0 ? 'selected' : ''} ${
                  showExplanation ? (currentQuestion.correctAnswer === 0 ? 'correct' : selectedAnswer === 0 ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswerSelect(0)}
                disabled={showExplanation}
              >
                <span className="option-label">O</span>
                <span className="option-text">맞다</span>
              </button>
              <button
                className={`quiz-option ${selectedAnswer === 1 ? 'selected' : ''} ${
                  showExplanation ? (currentQuestion.correctAnswer === 1 ? 'correct' : selectedAnswer === 1 ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswerSelect(1)}
                disabled={showExplanation}
              >
                <span className="option-label">X</span>
                <span className="option-text">틀리다</span>
              </button>
            </>
          ) : (
            currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selectedAnswer === index ? 'selected' : ''} ${
                  showExplanation ? (currentQuestion.correctAnswer === index ? 'correct' : selectedAnswer === index ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <span className="option-label">{index + 1}</span>
                <span className="option-text">{option}</span>
              </button>
            ))
          )}
        </div>

        {showExplanation && (
          <div className="quiz-explanation">
            <h4>
              {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다! 🎉' : '아쉽네요 😢'}
            </h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="quiz-actions">
          {!showExplanation ? (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              제출하기
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNext}>
              {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
