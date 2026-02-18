import { useState, useEffect, useMemo } from 'react';
import {
  getEconomicEvents,
  formatEventTime,
  countryFlags,
  categoryLabels,
  type EconomicEvent
} from '../services/calendarService';

interface CalendarPageProps {
  onClose?: () => void;
}

type FilterCountry = 'all' | EconomicEvent['country'];
type FilterCategory = 'all' | EconomicEvent['category'];
type FilterImportance = 'all' | EconomicEvent['importance'];

function CalendarPage({ onClose }: CalendarPageProps) {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 필터 상태
  const [filterCountry, setFilterCountry] = useState<FilterCountry>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterImportance, setFilterImportance] = useState<FilterImportance>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const allEvents = await getEconomicEvents(14); // 2주간
        setEvents(allEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterCountry !== 'all' && event.country !== filterCountry) return false;
      if (filterCategory !== 'all' && event.category !== filterCategory) return false;
      if (filterImportance !== 'all' && event.importance !== filterImportance) return false;
      if (selectedDate && event.date !== selectedDate) return false;
      return true;
    });
  }, [events, filterCountry, filterCategory, filterImportance, selectedDate]);

  // 날짜별 그룹핑
  const groupedEvents = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {};
    filteredEvents.forEach(event => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // 날짜 목록 (달력용)
  const dates = useMemo(() => {
    const result: { date: string; dayOfWeek: number; hasEvents: boolean; eventCount: number; hasHighImportance: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date === dateStr);

      result.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        hasEvents: dayEvents.length > 0,
        eventCount: dayEvents.length,
        hasHighImportance: dayEvents.some(e => e.importance === 'high')
      });
    }

    return result;
  }, [events]);

  const formatDateHeader = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[date.getDay()];

    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (diffDays === 0) return `오늘 (${month}/${day} ${dayName})`;
    if (diffDays === 1) return `내일 (${month}/${day} ${dayName})`;
    return `${month}월 ${day}일 (${dayName})`;
  };

  const formatDateShort = (dateStr: string): { day: number; dayName: string } => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return {
      day: date.getDate(),
      dayName: days[date.getDay()]
    };
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvent(prev => prev === eventId ? null : eventId);
  };

  const getImportanceClass = (importance: EconomicEvent['importance']) => {
    return `cal-event-importance cal-event-importance-${importance}`;
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-header-top">
          <h1 className="calendar-page-title">경제 캘린더</h1>
          <p className="calendar-page-subtitle">주요 경제 일정을 한눈에 확인하세요</p>
        </div>
        {onClose && (
          <button className="calendar-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </header>

      {/* 미니 캘린더 - 날짜 선택 */}
      <div className="calendar-mini">
        <div className="calendar-mini-scroll">
          {dates.map(({ date, dayOfWeek, hasEvents, eventCount, hasHighImportance }) => {
            const { day, dayName } = formatDateShort(date);
            const isSelected = selectedDate === date;
            const isToday = date === new Date().toISOString().split('T')[0];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <button
                key={date}
                className={`calendar-mini-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : date)}
              >
                <span className="mini-day-name">{dayName}</span>
                <span className="mini-day-num">{day}</span>
                {hasEvents && (
                  <span className={`mini-day-indicator ${hasHighImportance ? 'high' : ''}`}>
                    {eventCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 필터 */}
      <div className="calendar-filters">
        <div className="filter-group">
          <label className="filter-label">국가</label>
          <select
            className="filter-select"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value as FilterCountry)}
          >
            <option value="all">전체</option>
            <option value="KR">🇰🇷 한국</option>
            <option value="US">🇺🇸 미국</option>
            <option value="CN">🇨🇳 중국</option>
            <option value="JP">🇯🇵 일본</option>
            <option value="EU">🇪🇺 유럽</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">분류</label>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
          >
            <option value="all">전체</option>
            <option value="interest_rate">금리</option>
            <option value="gdp">GDP</option>
            <option value="employment">고용</option>
            <option value="inflation">물가</option>
            <option value="trade">무역</option>
            <option value="earnings">실적</option>
            <option value="policy">정책</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">중요도</label>
          <select
            className="filter-select"
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value as FilterImportance)}
          >
            <option value="all">전체</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>

        {(filterCountry !== 'all' || filterCategory !== 'all' || filterImportance !== 'all' || selectedDate) && (
          <button
            className="filter-reset"
            onClick={() => {
              setFilterCountry('all');
              setFilterCategory('all');
              setFilterImportance('all');
              setSelectedDate(null);
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 이벤트 목록 */}
      <div className="calendar-events-container">
        {isLoading ? (
          <div className="calendar-empty">
            <p>경제 일정을 불러오는 중...</p>
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="calendar-empty">
            <p>해당 조건에 맞는 일정이 없습니다</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date} className="calendar-date-group">
              <h3 className="calendar-date-header">{formatDateHeader(date)}</h3>
              <div className="calendar-date-events">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`cal-event ${expandedEvent === event.id ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className="cal-event-left">
                      <span className={getImportanceClass(event.importance)} />
                      <span className="cal-event-time">
                        {event.time ? formatEventTime(event.time) : '종일'}
                      </span>
                    </div>

                    <div className="cal-event-center">
                      <div className="cal-event-title-row">
                        <span className="cal-event-country">{countryFlags[event.country]}</span>
                        <span className="cal-event-title">{event.title}</span>
                      </div>
                      <div className="cal-event-meta">
                        <span className="cal-event-category">{categoryLabels[event.category]}</span>
                      </div>
                    </div>

                    <div className="cal-event-right">
                      {event.previous && (
                        <div className="cal-event-value">
                          <span className="cal-value-label">이전</span>
                          <span className="cal-value-data">{event.previous}</span>
                        </div>
                      )}
                      {event.forecast && (
                        <div className="cal-event-value">
                          <span className="cal-value-label">예상</span>
                          <span className="cal-value-data forecast">{event.forecast}</span>
                        </div>
                      )}
                      {event.actual && (
                        <div className="cal-event-value">
                          <span className="cal-value-label">실제</span>
                          <span className="cal-value-data actual">{event.actual}</span>
                        </div>
                      )}
                    </div>

                    {expandedEvent === event.id && event.description && (
                      <div className="cal-event-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 범례 */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot high" />
          <span className="legend-text">높은 중요도</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot medium" />
          <span className="legend-text">보통</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot low" />
          <span className="legend-text">낮음</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
