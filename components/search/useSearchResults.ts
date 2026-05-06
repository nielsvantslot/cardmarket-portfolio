"use client";

import {
  useEffect,
  useState,
  useTransition,
} from 'react';

import type { NormalizedCard } from '@/lib/types';

import { fetchCardsByQuery } from './api';

interface UseSearchResultsResult {
  results: NormalizedCard[];
  error: string | null;
  isSearching: boolean;
}
export function useSearchResults(query: string): UseSearchResultsResult {
  const [results, setResults] = useState<NormalizedCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();

    startTransition(async () => {
      try {
        setError(null);
        const cards = await fetchCardsByQuery(query, controller.signal);
        if (controller.signal.aborted) return;
        setResults(cards);
      } catch {
        if (controller.signal.aborted) return;
        setError('Search failed — please try again.');
        setResults([]);
      }
    });

    return () => controller.abort();
  }, [query]);

  return {
    results,
    error,
    isSearching,
  };
}
