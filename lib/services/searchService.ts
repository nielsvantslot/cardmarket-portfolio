import type {
  NormalizedCard,
  SetBrief,
} from "@/lib/types";

import { requestJson } from "./httpClient";

export type SearchSet = Pick<SetBrief, "id" | "name" | "cardCount" | "logo" | "symbol" | "releaseDate">;

export interface SearchService {
  getSets(query?: string): Promise<{ sets: SearchSet[] }>;
  getCardsBySetId(setId: string): Promise<{ cards: NormalizedCard[] }>;
  searchCards(query: string, signal?: AbortSignal): Promise<NormalizedCard[]>;
}

export const searchService: SearchService = {
  async getSets(query = "") {
    const params = new URLSearchParams({ type: "sets" });
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    }
    return requestJson<{ sets: SearchSet[] }>(`/api/search?${params.toString()}`);
  },

  async getCardsBySetId(setId: string) {
    return requestJson<{ cards: NormalizedCard[] }>(`/api/search?setId=${encodeURIComponent(setId)}`);
  },

  async searchCards(query: string, signal?: AbortSignal) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) {
      throw new Error("Search failed");
    }
    const data = (await res.json()) as { cards?: NormalizedCard[] };
    return data.cards ?? [];
  },
};
