import { useState, useEffect } from 'react';
import { getHistory, calculateStreak, getTodayDate } from '../utils/historyStorage';
import type { DailyActivity } from '../types/history';

interface HistoryProps {
  onClose: () => void;
}

function History({ onClose }: HistoryProps) {
  const [history, setHistory] = useState<DailyActivity[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const streak = calculateStreak();

  // 캘린더 생성
  const generateCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar: (Date | null)[] = [];

    // 빈 칸 추가
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(null);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(new Date(year, month, day));
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const today = getTodayDate();

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const activity = history.find(h => h.date === dateStr);
    setSelectedActivity(activity || null);
  };

  const getActivityForDate = (date: Date): DailyActivity | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return history.find(h => h.date === dateStr);
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>히스토리</h2>
        <button className="history-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Streak 정보 */}
      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <div className="streak-number">{streak.currentStreak}</div>
            <div className="streak-label">연속 일수</div>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon">🏆</div>
          <div className="streak-info">
            <div className="streak-number">{streak.longestStreak}</div>
            <div className="streak-label">최장 기록</div>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon">📚</div>
          <div className="streak-info">
            <div className="streak-number">{streak.totalDays}</div>
            <div className="streak-label">총 활동일</div>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={handlePrevMonth}>‹</button>
          <h3>{selectedMonth.getFullYear()}년 {monthNames[selectedMonth.getMonth()]}</h3>
          <button className="calendar-nav-btn" onClick={handleNextMonth}>›</button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}
          {calendar.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }

            const dateStr = date.toISOString().split('T')[0];
            const activity = getActivityForDate(date);
            const isToday = dateStr === today;
            const hasActivity = !!activity;
            const hasNews = activity?.newsRead;
            const hasQuiz = activity?.quizScore !== undefined;

            return (
              <div
                key={dateStr}
                className={`calendar-day ${isToday ? 'today' : ''} ${hasActivity ? 'active' : ''}`}
                onClick={() => handleDayClick(date)}
              >
                <div className="day-number">{date.getDate()}</div>
                <div className="day-indicators">
                  {hasNews && <span className="indicator news" title="뉴스 읽음">📰</span>}
                  {hasQuiz && <span className="indicator quiz" title="퀴즈 완료">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedActivity && (
        <div className="activity-detail">
          <h4>활동 상세</h4>
          <div className="activity-detail-content">
            <div className="activity-item">
              <span className="activity-icon">📰</span>
              <span>뉴스 읽기: {selectedActivity.newsRead ? '완료' : '미완료'}</span>
            </div>
            {selectedActivity.quizScore !== undefined && (
              <div className="activity-item">
                <span className="activity-icon">📝</span>
                <span>
                  퀴즈: {selectedActivity.quizCorrect}/{selectedActivity.quizTotal} 
                  ({selectedActivity.quizScore}점)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
