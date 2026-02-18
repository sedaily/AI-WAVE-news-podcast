import { useState, useEffect } from 'react';
import type { InterestCategory } from '../types/interests';
import { INTEREST_CATEGORY_LIST } from '../constants/interestCategories';
import { getUserInterests, updateInterests } from '../utils/interestPreferences';
import { getRecommendedCategories, getWeeklyStats } from '../utils/listeningTracker';
import { VoiceSelector } from './voice';
import './InterestSettings.css';

interface InterestSettingsProps {
  onClose: () => void;
}

function InterestSettings({ onClose }: InterestSettingsProps) {
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);
  const [recommendedCategories, setRecommendedCategories] = useState<InterestCategory[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{
    totalSessions: number;
    totalMinutes: number;
    avgCompletionRate: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'voice' | 'interests'>('profile');

  useEffect(() => {
    const { categories } = getUserInterests();
    setSelectedInterests(categories);

    const recommended = getRecommendedCategories(3);
    setRecommendedCategories(recommended);

    const stats = getWeeklyStats();
    if (stats.totalSessions > 0) {
      setWeeklyStats(stats);
    }
  }, []);

  const toggleInterest = (category: InterestCategory) => {
    setSelectedInterests(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const handleSave = () => {
    updateInterests(selectedInterests);
    onClose();
  };

  // Content for each section
  const ProfileContent = () => (
    <div className="tab-content">
      {recommendedCategories.length > 0 && (
        <div className="content-section">
          <h3>맞춤 추천</h3>
          <p className="section-desc">청취 패턴을 분석했어요</p>
          <div className="recommend-list">
            {recommendedCategories.map(categoryId => {
              const category = INTEREST_CATEGORY_LIST.find(c => c.id === categoryId);
              const isSelected = selectedInterests.includes(categoryId);
              return (
                <button
                  key={categoryId}
                  className={`recommend-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleInterest(categoryId)}
                >
                  {category?.name}
                  {isSelected && <span className="chip-check">&#10003;</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="content-section">
        <h3>이번 주 활동</h3>
        <div className="activity-card">
          <div className="activity-row">
            <span className="activity-label">청취 횟수</span>
            <span className="activity-value">{weeklyStats?.totalSessions || 0}회</span>
          </div>
          <div className="activity-row">
            <span className="activity-label">총 청취 시간</span>
            <span className="activity-value">{weeklyStats?.totalMinutes || 0}분</span>
          </div>
          <div className="activity-row">
            <span className="activity-label">평균 완료율</span>
            <span className="activity-value">{weeklyStats?.avgCompletionRate || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const VoiceContent = () => (
    <div className="tab-content">
      <div className="content-section">
        <h3>목소리 선택</h3>
        <p className="section-desc">선호하는 목소리로 뉴스를 들어보세요</p>
        <VoiceSelector />
      </div>
    </div>
  );

  const InterestsContent = () => (
    <div className="tab-content">
      <div className="content-section">
        <h3>관심 분야</h3>
        <p className="section-desc">선택한 분야의 뉴스가 우선 표시됩니다</p>
        <div className="interest-grid-new">
          {INTEREST_CATEGORY_LIST.map(category => {
            const isSelected = selectedInterests.includes(category.id);
            return (
              <button
                key={category.id}
                className={`interest-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleInterest(category.id)}
              >
                <span className="chip-name">{category.name}</span>
                {isSelected && <span className="chip-check">&#10003;</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="save-section">
        <button className="save-btn" onClick={handleSave}>
          저장하기
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      {/* Mobile Header */}
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1>내 프로필</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Sidebar - Profile Card & Nav */}
      <div className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-avatar-large">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="profile-info">
            <span className="profile-greeting">안녕하세요</span>
            <span className="profile-name">경제 뉴스 리스너</span>
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-box">
            <span className="stat-value">{weeklyStats?.totalSessions || 0}</span>
            <span className="stat-label">청취</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{weeklyStats?.totalMinutes || 0}분</span>
            <span className="stat-label">시간</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{weeklyStats?.avgCompletionRate || 0}%</span>
            <span className="stat-label">완료율</span>
          </div>
        </div>

        {/* Web: Quick Actions */}
        <div className="quick-actions">
          <button
            className={`quick-action-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            청취 현황
          </button>
          <button
            className={`quick-action-btn ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            목소리 설정
          </button>
          <button
            className={`quick-action-btn ${activeTab === 'interests' ? 'active' : ''}`}
            onClick={() => setActiveTab('interests')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            관심사 설정
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          청취 현황
        </button>
        <button
          className={`profile-tab ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          목소리
        </button>
        <button
          className={`profile-tab ${activeTab === 'interests' ? 'active' : ''}`}
          onClick={() => setActiveTab('interests')}
        >
          관심사
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-content">
          {activeTab === 'profile' && <ProfileContent />}
          {activeTab === 'voice' && <VoiceContent />}
          {activeTab === 'interests' && <InterestsContent />}
        </div>
      </div>
    </div>
  );
}

export default InterestSettings;
