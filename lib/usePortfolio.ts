"use client";

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  portfolioService,
  type PortfolioService,
} from './services/portfolioService';
import type {
  AuthUser,
  PortfolioEntry,
  SealedProduct,
} from './types';

export function usePortfolio(service: PortfolioService = portfolioService) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [sealedItems, setSealedItems] = useState<SealedProduct[]>([]);
  const [portfolioMutationVersion, setPortfolioMutationVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const loadPortfolio = useCallback(async () => {
    const data = await service.getPortfolio();
    setEntries(data.entries ?? []);
    setSealedItems(data.sealedItems ?? []);
  }, [service]);

  const refresh = useCallback(async () => {
    setAuthLoading(true);
    try {
      const session = await service.getSession();
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
    await service.addCard(cardId);

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
  }, [service]);

  const removeCard = useCallback(async (cardId: string) => {
    await service.removeCard(cardId);

    setEntries((prev) => prev.filter((entry) => entry.cardId !== cardId));
    setPortfolioMutationVersion((prev) => prev + 1);
  }, [service]);

  const updateQuantity = useCallback(async (cardId: string, quantity: number) => {
    await service.updateCardQuantity(cardId, quantity);

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
  }, [service]);

  const logout = useCallback(async () => {
    await service.logout();
    setUser(null);
    setEntries([]);
    setSealedItems([]);
  }, [service]);

  const hasCard = useCallback(
    (cardId: string) => entries.some((entry) => entry.cardId === cardId),
    [entries]
  );

  const getQuantity = useCallback(
    (cardId: string) => entries.find((entry) => entry.cardId === cardId)?.quantity ?? 0,
    [entries]
  );

  const addSealedItem = useCallback(async (item: Omit<SealedProduct, "id" | "addedAt">) => {
    const data = await service.addSealedItem(item);

    setSealedItems((prev) => [data.item, ...prev]);
  }, [service]);

  const removeSealedItem = useCallback(async (id: string) => {
    await service.removeSealedItem(id);

    setSealedItems((prev) => prev.filter((item) => item.id !== id));
  }, [service]);

  const updateSealedItem = useCallback(async (id: string, patch: Partial<SealedProduct>) => {
    const data = await service.updateSealedItem(id, patch);

    setSealedItems((prev) => prev.map((item) => (item.id === id ? data.item : item)));
  }, [service]);

  const submitSnapshot = useCallback(async (snapshot: {
    totalValue: number;
    totalCards: number;
    uniqueCards: number;
    reason?: "daily" | "portfolio-change";
  }) => {
    await service.submitSnapshot(snapshot);
  }, [service]);

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
