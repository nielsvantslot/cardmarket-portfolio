"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type { NormalizedCard } from '@/lib/types';

import { fetchCardsByQuery } from './api';
import type { SlotStatus } from './types';

interface UseFeaturedSlotsOptions {
  queries: readonly string[];
  visibleCount: number;
  enabled: boolean;
}

interface UseFeaturedSlotsResult {
  slots: Array<NormalizedCard | null>;
  statuses: SlotStatus[];
  isLoading: boolean;
}

const FEATURED_SLOT_TIMEOUT_MS = 8000;
const MAX_FEATURED_FETCH_ATTEMPTS = 2;

export function useFeaturedSlots({
  queries,
  visibleCount,
  enabled,
}: UseFeaturedSlotsOptions): UseFeaturedSlotsResult {
  const [slots, setSlots] = useState<Array<NormalizedCard | null>>(() => Array(queries.length).fill(null));
  const [statuses, setStatuses] = useState<SlotStatus[]>(() => Array(queries.length).fill('idle'));
  const requestedIndexesRef = useRef<Set<number>>(new Set());
  const attemptsRef = useRef<Map<number, number>>(new Map());
  const timeoutIdsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setSlots(Array(queries.length).fill(null));
    setStatuses(Array(queries.length).fill('idle'));
    requestedIndexesRef.current.clear();
    attemptsRef.current.clear();

    timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIdsRef.current.clear();
  }, [queries]);

  useEffect(() => {
    if (!enabled) return;

    const maxVisible = Math.min(visibleCount, queries.length);
    const indexesToLoad: number[] = [];
    let displaySlotsCount = 0;

    for (let i = 0; i < queries.length && displaySlotsCount < maxVisible; i++) {
      if (statuses[i] === 'failed') continue;
      displaySlotsCount++;

      if (requestedIndexesRef.current.has(i)) continue;
      requestedIndexesRef.current.add(i);
      indexesToLoad.push(i);
    }

    if (indexesToLoad.length === 0) return;

    setStatuses((prev) => {
      const next = [...prev];
      for (const i of indexesToLoad) {
        next[i] = 'loading';

        const currentAttempts = attemptsRef.current.get(i) ?? 0;
        attemptsRef.current.set(i, currentAttempts + 1);

        const timeoutId = setTimeout(() => {
          setStatuses((innerPrev) => {
            if (innerPrev[i] !== 'loading') return innerPrev;
            const innerNext = [...innerPrev];

            const attempts = attemptsRef.current.get(i) ?? 0;
            if (attempts < MAX_FEATURED_FETCH_ATTEMPTS) {
              requestedIndexesRef.current.delete(i);
              innerNext[i] = 'idle';
            } else {
              innerNext[i] = 'failed';
            }

            return innerNext;
          });
          timeoutIdsRef.current.delete(i);
        }, FEATURED_SLOT_TIMEOUT_MS);

        timeoutIdsRef.current.set(i, timeoutId);
      }
      return next;
    });

    indexesToLoad.forEach(async (index) => {
      try {
        const cards = await fetchCardsByQuery(queries[index]);
        const foundCard = cards[0];

        const timeoutId = timeoutIdsRef.current.get(index);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutIdsRef.current.delete(index);
        }

        if (!foundCard) {
          setStatuses((prev) => {
            const next = [...prev];

            const attempts = attemptsRef.current.get(index) ?? 0;
            if (attempts < MAX_FEATURED_FETCH_ATTEMPTS) {
              requestedIndexesRef.current.delete(index);
              next[index] = 'idle';
            } else {
              next[index] = 'failed';
            }

            return next;
          });
          return;
        }

        setSlots((prev) => {
          const next = [...prev];
          next[index] = foundCard;
          return next;
        });

        setStatuses((prev) => {
          const next = [...prev];
          next[index] = 'loaded';
          return next;
        });
      } catch {
        const timeoutId = timeoutIdsRef.current.get(index);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutIdsRef.current.delete(index);
        }

        setStatuses((prev) => {
          const next = [...prev];

          const attempts = attemptsRef.current.get(index) ?? 0;
          if (attempts < MAX_FEATURED_FETCH_ATTEMPTS) {
            requestedIndexesRef.current.delete(index);
            next[index] = 'idle';
          } else {
            next[index] = 'failed';
          }

          return next;
        });
      }
    });
  }, [enabled, queries, visibleCount]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIdsRef.current.clear();
    };
  }, []);

  const isLoading = statuses.some((status) => status === 'loading');

  return {
    slots,
    statuses,
    isLoading,
  };
}
