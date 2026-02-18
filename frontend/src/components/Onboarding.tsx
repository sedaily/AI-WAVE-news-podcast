import { useState } from 'react';
import type { InterestCategory } from '../types/interests';
import { INTEREST_CATEGORY_LIST } from '../constants/interestCategories';
import { completeOnboarding } from '../utils/interestPreferences';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'question1' | 'question2' | 'complete';

function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  const goToNext = (nextStep: Step) => {
    setFadeOut(true);
    setTimeout(() => {
      setStep(nextStep);
      setFadeOut(false);
    }, 300);
  };

  const toggleInterest = (category: InterestCategory) => {
    setSelectedInterests(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), category];
      }
      return [...prev, category];
    });
  };

  const handleFinish = () => {
    completeOnboarding(selectedInterests);
    goToNext('complete');
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleSkip = () => {
    completeOnboarding([]);
    onComplete();
  };

  const progress = step === 'welcome' ? 0 : step === 'question1' ? 33 : step === 'question2' ? 66 : 100;

  return (
    <div className="onboarding-overlay">
      {/* 웹: 왼쪽 비주얼 영역 */}
      <div className="onboarding-visual">
        <div className="visual-content">
          <div className="visual-badge">Beta</div>
          <h1 className="visual-title">뉴스캐스트</h1>
          <p className="visual-desc">매일 아침, 1분 경제 브리핑</p>
          <div className="visual-stats">
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">오늘의 토픽</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1분</span>
              <span className="stat-label">브리핑 시간</span>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 폼 영역 */}
      <div className="onboarding-form">
        {/* Progress Bar */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="onboarding-progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className={`onboarding-content ${fadeOut ? 'fade-out' : 'fade-in'}`}>

        {/* Step 1: Welcome */}
        {step === 'welcome' && (
          <div className="onboarding-step welcome-step">
            <div className="step-content">
              <p className="welcome-sub">매일 아침, 당신을 위한</p>
              <h1 className="welcome-title">경제 브리핑</h1>
              <p className="welcome-desc">
                1분이면 충분해요.<br />
                출근길에 가볍게 들어보세요.
              </p>
            </div>
            <div className="step-actions">
              <button className="btn-primary" onClick={() => goToNext('question1')}>
                시작할게요
              </button>
              <button className="btn-skip" onClick={handleSkip}>
                바로 시작하기
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interest Selection */}
        {step === 'question1' && (
          <div className="onboarding-step question-step">
            <div className="step-content">
              <p className="question-number">Q1</p>
              <h2 className="question-title">
                어떤 소식이<br />궁금하세요?
              </h2>
              <p className="question-hint">최대 3개까지 선택할 수 있어요</p>

              <div className="interest-list">
                {INTEREST_CATEGORY_LIST.slice(0, 4).map(category => {
                  const isSelected = selectedInterests.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      className={`interest-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleInterest(category.id)}
                    >
                      <span className="interest-name">{category.name}</span>
                      <span className="interest-check">{isSelected ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={() => goToNext('question2')}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: More Interests */}
        {step === 'question2' && (
          <div className="onboarding-step question-step">
            <div className="step-content">
              <p className="question-number">Q2</p>
              <h2 className="question-title">
                이런 주제는<br />어떠세요?
              </h2>
              <p className="question-hint">
                {selectedInterests.length > 0
                  ? `${selectedInterests.length}개 선택됨`
                  : '관심사를 선택해주세요'}
              </p>

              <div className="interest-list">
                {INTEREST_CATEGORY_LIST.slice(4).map(category => {
                  const isSelected = selectedInterests.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      className={`interest-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleInterest(category.id)}
                    >
                      <span className="interest-name">{category.name}</span>
                      <span className="interest-check">{isSelected ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleFinish}
                disabled={selectedInterests.length === 0}
              >
                {selectedInterests.length > 0 ? '완료' : '1개 이상 선택해주세요'}
              </button>
              <button className="btn-skip" onClick={handleSkip}>
                건너뛰기
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="onboarding-step complete-step">
            <div className="step-content">
              <div className="complete-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="rgba(184, 149, 106, 0.15)"/>
                  <path d="M15 24L21 30L33 18" stroke="#b8956a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="complete-title">준비 완료</h2>
              <p className="complete-desc">
                맞춤 브리핑을 들려드릴게요
              </p>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

export default Onboarding;
