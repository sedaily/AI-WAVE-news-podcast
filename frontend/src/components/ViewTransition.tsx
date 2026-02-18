import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface ViewTransitionProps {
  children: ReactNode;
  viewKey: string;
  className?: string;
}

export function ViewTransition({ children, viewKey, className = '' }: ViewTransitionProps) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const prevKeyRef = useRef(viewKey);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Only animate when view actually changes
    if (viewKey !== prevKeyRef.current) {
      setShouldAnimate(true);
      prevKeyRef.current = viewKey;

      // Remove animation class after transition completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [viewKey, isFirstRender]);

  return (
    <div className={`view-transition ${className}`}>
      <div className={`view-content ${shouldAnimate ? 'view-animate-in' : ''}`} key={viewKey}>
        {children}
      </div>
    </div>
  );
}

export default ViewTransition;
