"use client";

import type { MutableRefObject } from 'react';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

interface UseVisibleCountOptions {
  initialCount: number;
  chunkSize: number;
  totalCount: number;
  resetKey: string;
}

interface UseVisibleCountResult {
  visibleCount: number;
  hasMoreToShow: boolean;
  sentinelRef: MutableRefObject<HTMLDivElement | null>;
}
export function useVisibleCount({
  initialCount,
  chunkSize,
  totalCount,
  resetKey,
}: UseVisibleCountOptions): UseVisibleCountResult {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, resetKey]);

  const hasMoreToShow = visibleCount < totalCount;

  useEffect(() => {
    if (!hasMoreToShow || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + chunkSize, totalCount));
        }
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [chunkSize, hasMoreToShow, totalCount]);

  return {
    visibleCount,
    hasMoreToShow,
    sentinelRef,
  };
}
