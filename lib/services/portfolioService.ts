import type {
  PortfolioEntry,
  PortfolioSnapshotPoint,
  SealedProduct,
} from '@/lib/types';

import { requestJson } from './httpClient';

interface PortfolioResponse {
  entries: PortfolioEntry[];
  sealedItems: SealedProduct[];
}

export interface SnapshotInput {
  totalValue: number;
  totalCards: number;
  uniqueCards: number;
  reason?: "daily" | "portfolio-change";
}

export interface PortfolioService {
  getPortfolio(): Promise<PortfolioResponse>;
  addCard(cardId: string): Promise<{ entry: PortfolioEntry }>;
  removeCard(cardId: string): Promise<{ removed: true }>;
  updateCardQuantity(cardId: string, quantity: number): Promise<{ entry?: PortfolioEntry }>;
  addSealedItem(item: Omit<SealedProduct, "id" | "addedAt">): Promise<{ item: SealedProduct }>;
  removeSealedItem(id: string): Promise<{ removed: true }>;
  updateSealedItem(id: string, patch: Partial<SealedProduct>): Promise<{ item: SealedProduct }>;
  submitSnapshot(snapshot: SnapshotInput): Promise<{ ok?: boolean; skipped?: boolean }>;
  getPortfolioHistory(): Promise<{ snapshots: PortfolioSnapshotPoint[] }>;
}

export const portfolioService: PortfolioService = {
  async getPortfolio() {
    return requestJson<PortfolioResponse>("/api/portfolio");
  },

  async addCard(cardId: string) {
    return requestJson<{ entry: PortfolioEntry }>("/api/portfolio/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, delta: 1 }),
    });
  },

  async removeCard(cardId: string) {
    return requestJson<{ removed: true }>(`/api/portfolio/cards?cardId=${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    });
  },

  async updateCardQuantity(cardId: string, quantity: number) {
    return requestJson<{ entry?: PortfolioEntry }>("/api/portfolio/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, quantity }),
    });
  },

  async addSealedItem(item: Omit<SealedProduct, "id" | "addedAt">) {
    return requestJson<{ item: SealedProduct }>("/api/portfolio/sealed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  },

  async removeSealedItem(id: string) {
    return requestJson<{ removed: true }>(`/api/portfolio/sealed/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async updateSealedItem(id: string, patch: Partial<SealedProduct>) {
    return requestJson<{ item: SealedProduct }>(`/api/portfolio/sealed/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  },

  async submitSnapshot(snapshot: SnapshotInput) {
    return requestJson<{ ok?: boolean; skipped?: boolean }>("/api/portfolio/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  },

  async getPortfolioHistory() {
    return requestJson<{ snapshots: PortfolioSnapshotPoint[] }>("/api/portfolio/history");
  },
};
