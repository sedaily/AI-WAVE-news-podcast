import { useState, useRef, useEffect } from 'react';
import './Glossary.css';

export interface TermExplanation {
  term: string;
  explanation: string;
  simpleAnalogy?: string;
  examples?: string[];
  relatedTerms?: string[];
}

interface TermTooltipProps {
  term: string;
  children: React.ReactNode;
  explanation?: TermExplanation;
  isLoading?: boolean;
  onRequestExplanation?: (term: string) => void;
  knowledgeLevel?: 'beginner' | 'intermediate' | 'expert';
}

function TermTooltip({
  term,
  children,
  explanation,
  isLoading = false,
  onRequestExplanation,
  knowledgeLevel = 'beginner',
}: TermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceAbove < 200 && spaceBelow > spaceAbove) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }

      if (!explanation && onRequestExplanation) {
        onRequestExplanation(term);
      }
    }
  }, [isOpen, term, explanation, onRequestExplanation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getLevelLabel = () => {
    switch (knowledgeLevel) {
      case 'beginner':
        return '쉬운 설명';
      case 'intermediate':
        return '핵심 개념';
      case 'expert':
        return '심층 분석';
    }
  };

  return (
    <span className="term-tooltip-wrapper">
      <span
        ref={triggerRef}
        className="term-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
        <span className="term-underline" />
      </span>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`term-tooltip ${position}`}
        >
          <div className="term-tooltip-header">
            <span className="term-name">{term}</span>
            <span className="term-level-badge">{getLevelLabel()}</span>
          </div>

          {isLoading ? (
            <div className="term-tooltip-loading">
              <span className="term-loading-spinner" />
              <span>설명을 불러오는 중...</span>
            </div>
          ) : explanation ? (
            <div className="term-tooltip-content">
              <p className="term-explanation">{explanation.explanation}</p>

              {explanation.simpleAnalogy && (
                <div className="term-analogy">
                  <span className="term-analogy-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <span>{explanation.simpleAnalogy}</span>
                </div>
              )}

              {explanation.examples && explanation.examples.length > 0 && (
                <div className="term-examples">
                  <span className="term-examples-label">예시</span>
                  <ul>
                    {explanation.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.relatedTerms && explanation.relatedTerms.length > 0 && (
                <div className="term-related">
                  <span className="term-related-label">관련 용어</span>
                  <div className="term-related-tags">
                    {explanation.relatedTerms.map((related, idx) => (
                      <span key={idx} className="term-related-tag">
                        {related}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="term-tooltip-error">
              <p>설명을 불러올 수 없습니다</p>
            </div>
          )}

          <button
            className="term-tooltip-close"
            onClick={() => setIsOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </span>
  );
}

export default TermTooltip;
