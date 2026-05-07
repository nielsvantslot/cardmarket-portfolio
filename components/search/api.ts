import { searchService } from '@/lib/services/searchService';
import type { NormalizedCard } from '@/lib/types';

export async function fetchCardsByQuery(query: string, signal?: AbortSignal): Promise<NormalizedCard[]> {
  return searchService.searchCards(query, signal);
}
