'use client';

import { useEffect, useRef, useState } from 'react';

const sharedObserver = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = (entry.target as HTMLElement).dataset.intersectCallback;
            if (callback) {
              try {
                const handler = JSON.parse(callback);
                if (handler) {
                  entry.target.dispatchEvent(new CustomEvent('intersect'));
                }
              } catch {}
            }
          }
        });
      },
      { threshold: 0.1 }
    )
  : null;

export function useIntersection(): { ref: React.RefObject<HTMLDivElement | null>; isVisible: boolean } {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !sharedObserver) {
      setIsVisible(true);
      return;
    }

    const handler = () => {
      setIsVisible(true);
      sharedObserver.unobserve(el);
    };

    el.addEventListener('intersect', handler);
    sharedObserver.observe(el);

    return () => {
      el.removeEventListener('intersect', handler);
      sharedObserver.unobserve(el);
    };
  }, []);

  return { ref, isVisible };
}
