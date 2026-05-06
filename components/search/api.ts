import type { NormalizedCard } from '@/lib/types';

import type { SearchCardsResponse } from './types';

export async function fetchCardsByQuery(query: string, signal?: AbortSignal): Promise<NormalizedCard[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) {
    throw new Error('Search failed');
  }

  const data = (await res.json()) as SearchCardsResponse;
  return data.cards ?? [];
}
