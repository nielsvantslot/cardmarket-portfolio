"use client";

import { useState, useEffect, useCallback } from "react";
import type { PortfolioEntry, SealedProduct } from "./types";

const STORAGE_KEY = "card-portfolio-v1";
const SEALED_STORAGE_KEY = "card-portfolio-sealed-v1";

function loadPortfolio(): PortfolioEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PortfolioEntry[];
  } catch {
    return [];
  }
}

function savePortfolio(entries: PortfolioEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function loadSealed(): SealedProduct[] {
  try {
    const raw = localStorage.getItem(SEALED_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SealedProduct[];
  } catch {
    return [];
  }
}

function saveSealed(items: SealedProduct[]) {
  try {
    localStorage.setItem(SEALED_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function usePortfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [sealedItems, setSealedItems] = useState<SealedProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(loadPortfolio());
    setSealedItems(loadSealed());
    setHydrated(true);
  }, []);

  const addCard = useCallback((cardId: string) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      const next = existing
        ? prev.map((e) =>
            e.cardId === cardId ? { ...e, quantity: e.quantity + 1 } : e
          )
        : [...prev, { cardId, quantity: 1, addedAt: Date.now() }];
      savePortfolio(next);
      return next;
    });
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.cardId !== cardId);
      savePortfolio(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((cardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCard(cardId);
      return;
    }
    setEntries((prev) => {
      const next = prev.map((e) =>
        e.cardId === cardId ? { ...e, quantity } : e
      );
      savePortfolio(next);
      return next;
    });
  }, [removeCard]);

  const hasCard = useCallback(
    (cardId: string) => entries.some((e) => e.cardId === cardId),
    [entries]
  );

  const getQuantity = useCallback(
    (cardId: string) => entries.find((e) => e.cardId === cardId)?.quantity ?? 0,
    [entries]
  );

  // ── Sealed ────────────────────────────────────────────────────────────────

  const addSealedItem = useCallback((item: Omit<SealedProduct, "id" | "addedAt">) => {
    setSealedItems((prev) => {
      const next = [...prev, { ...item, id: generateId(), addedAt: Date.now() }];
      saveSealed(next);
      return next;
    });
  }, []);

  const removeSealedItem = useCallback((id: string) => {
    setSealedItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveSealed(next);
      return next;
    });
  }, []);

  const updateSealedItem = useCallback((id: string, patch: Partial<SealedProduct>) => {
    setSealedItems((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, ...patch } : i);
      saveSealed(next);
      return next;
    });
  }, []);

  return {
    entries,
    sealedItems,
    hydrated,
    addCard,
    removeCard,
    updateQuantity,
    hasCard,
    getQuantity,
    addSealedItem,
    removeSealedItem,
    updateSealedItem,
  };
}
