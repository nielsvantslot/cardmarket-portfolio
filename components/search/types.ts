import type { NormalizedCard } from '@/lib/types';

export type SlotStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export interface SearchCardsResponse {
  cards?: NormalizedCard[];
}
