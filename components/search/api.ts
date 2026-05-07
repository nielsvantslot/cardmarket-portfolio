import type { NormalizedCard } from '@/lib/types';

import { searchService } from '@/lib/services/searchService';

export async function fetchCardsByQuery(query: string, signal?: AbortSignal): Promise<NormalizedCard[]> {
  return searchService.searchCards(query, signal);
}
