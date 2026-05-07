"use client";

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  AuthUser,
  PortfolioEntry,
  SealedProduct,
} from './types';

interface PortfolioResponse {
  entries: PortfolioEntry[];
  sealedItems: SealedProduct[];
}

interface SessionResponse {
  user: AuthUser | null;
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

export function usePortfolio() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [sealedItems, setSealedItems] = useState<SealedProduct[]>([]);
  const [portfolioMutationVersion, setPortfolioMutationVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const loadPortfolio = useCallback(async () => {
    const data = await fetchJson<PortfolioResponse>("/api/portfolio");
    setEntries(data.entries ?? []);
    setSealedItems(data.sealedItems ?? []);
  }, []);

  const refresh = useCallback(async () => {
    setAuthLoading(true);
    try {
      const session = await fetchJson<SessionResponse>("/api/auth/session");
      setUser(session.user);
      await loadPortfolio();
    } catch {
      setUser(null);
      setEntries([]);
      setSealedItems([]);
    } finally {
      setAuthLoading(false);
      setHydrated(true);
    }
  }, [loadPortfolio]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addCard = useCallback(async (cardId: string) => {
    await fetchJson<{ entry: PortfolioEntry }>("/api/portfolio/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, delta: 1 }),
    });

    setEntries((prev) => {
      const existing = prev.find((entry) => entry.cardId === cardId);
      if (!existing) {
        return [...prev, { cardId, quantity: 1, addedAt: Date.now() }];
      }
      return prev.map((entry) =>
        entry.cardId === cardId ? { ...entry, quantity: entry.quantity + 1 } : entry
      );
    });
    setPortfolioMutationVersion((prev) => prev + 1);
  }, []);

  const removeCard = useCallback(async (cardId: string) => {
    await fetchJson<{ removed: true }>(`/api/portfolio/cards?cardId=${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    });

    setEntries((prev) => prev.filter((entry) => entry.cardId !== cardId));
    setPortfolioMutationVersion((prev) => prev + 1);
  }, []);

  const updateQuantity = useCallback(async (cardId: string, quantity: number) => {
    await fetchJson<{ entry?: PortfolioEntry }>("/api/portfolio/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, quantity }),
    });

    setEntries((prev) => {
      if (quantity <= 0) return prev.filter((entry) => entry.cardId !== cardId);

      const exists = prev.some((entry) => entry.cardId === cardId);
      if (!exists) {
        return [...prev, { cardId, quantity, addedAt: Date.now() }];
      }

      return prev.map((entry) =>
        entry.cardId === cardId ? { ...entry, quantity } : entry
      );
    });
    setPortfolioMutationVersion((prev) => prev + 1);
  }, []);

  const logout = useCallback(async () => {
    await fetchJson<{ ok: true }>("/api/auth/logout", { method: "POST" });
    setUser(null);
    setEntries([]);
    setSealedItems([]);
  }, []);

  const hasCard = useCallback(
    (cardId: string) => entries.some((entry) => entry.cardId === cardId),
    [entries]
  );

  const getQuantity = useCallback(
    (cardId: string) => entries.find((entry) => entry.cardId === cardId)?.quantity ?? 0,
    [entries]
  );

  const addSealedItem = useCallback(async (item: Omit<SealedProduct, "id" | "addedAt">) => {
    const data = await fetchJson<{ item: SealedProduct }>("/api/portfolio/sealed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    setSealedItems((prev) => [data.item, ...prev]);
  }, []);

  const removeSealedItem = useCallback(async (id: string) => {
    await fetchJson<{ removed: true }>(`/api/portfolio/sealed/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    setSealedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateSealedItem = useCallback(async (id: string, patch: Partial<SealedProduct>) => {
    const data = await fetchJson<{ item: SealedProduct }>(`/api/portfolio/sealed/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSealedItems((prev) => prev.map((item) => (item.id === id ? data.item : item)));
  }, []);

  const submitSnapshot = useCallback(async (snapshot: {
    totalValue: number;
    totalCards: number;
    uniqueCards: number;
    reason?: "daily" | "portfolio-change";
  }) => {
    await fetchJson<{ ok?: boolean; skipped?: boolean }>("/api/portfolio/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  }, []);

  return {
    user,
    authLoading,
    refresh,
    logout,
    entries,
    sealedItems,
    hydrated,
    addCard,
    removeCard,
    updateQuantity,
    hasCard,
    getQuantity,
    portfolioMutationVersion,
    addSealedItem,
    removeSealedItem,
    updateSealedItem,
    submitSnapshot,
  };
}
