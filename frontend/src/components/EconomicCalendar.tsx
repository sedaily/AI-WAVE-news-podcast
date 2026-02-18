import { useState, useEffect } from 'react';
import {
  getEconomicEvents,
  formatEventDate,
  formatEventTime,
  countryFlags,
  categoryLabels,
  type EconomicEvent
} from '../services/calendarService';

interface EconomicCalendarProps {
  maxEvents?: number;
  showHighImportanceOnly?: boolean;
}

export function EconomicCalendar({
  maxEvents = 5,
  showHighImportanceOnly = false
}: EconomicCalendarProps) {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        let allEvents = await getEconomicEvents(7);

        if (showHighImportanceOnly) {
          allEvents = allEvents.filter(e => e.importance === 'high');
        }

        setEvents(allEvents.slice(0, maxEvents));
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [maxEvents, showHighImportanceOnly]);

  const toggleExpand = (eventId: string) => {
    setExpandedEvent(prev => prev === eventId ? null : eventId);
  };

  const getImportanceClass = (importance: EconomicEvent['importance']) => {
    return `event-importance event-importance-${importance}`;
  };

  if (isLoading) {
    return (
      <div className="economic-calendar">
        <h4 className="calendar-title">경제 캘린더</h4>
        <p className="calendar-empty">일정을 불러오는 중...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="economic-calendar">
        <h4 className="calendar-title">경제 캘린더</h4>
        <p className="calendar-empty">예정된 일정이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="economic-calendar">
      <h4 className="calendar-title">경제 캘린더</h4>
      <ul className="calendar-events">
        {events.map((event) => (
          <li
            key={event.id}
            className={`calendar-event ${expandedEvent === event.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(event.id)}
          >
            <div className="event-header">
              <div className="event-date-time">
                <span className="event-date">{formatEventDate(event.date)}</span>
                {event.time && (
                  <span className="event-time">{formatEventTime(event.time)}</span>
                )}
              </div>
              <span className={getImportanceClass(event.importance)} />
            </div>

            <div className="event-main">
              <span className="event-country">{countryFlags[event.country]}</span>
              <span className="event-title">{event.title}</span>
            </div>

            <div className="event-meta">
              <span className="event-category">{categoryLabels[event.category]}</span>
              {(event.previous || event.forecast) && (
                <div className="event-values">
                  {event.previous && (
                    <span className="event-value">
                      <span className="value-label">이전</span>
                      <span className="value-data">{event.previous}</span>
                    </span>
                  )}
                  {event.forecast && (
                    <span className="event-value">
                      <span className="value-label">예상</span>
                      <span className="value-data forecast">{event.forecast}</span>
                    </span>
                  )}
                  {event.actual && (
                    <span className="event-value">
                      <span className="value-label">실제</span>
                      <span className="value-data actual">{event.actual}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {expandedEvent === event.id && event.description && (
              <div className="event-description">
                {event.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EconomicCalendar;
