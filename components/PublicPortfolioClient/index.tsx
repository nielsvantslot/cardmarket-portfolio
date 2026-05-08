"use client";

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import { CardList } from '@/components/CardList';
import { SearchField } from '@/components/ui/SearchField';
import { StatCard } from '@/components/ui/StatCard';
import {
  getCards,
  normalizeCard,
} from '@/lib/api';
import type {
  NormalizedCard,
  PortfolioEntry,
} from '@/lib/types';

interface PublicPortfolioClientProps {
  ownerName: string;
  entries: PortfolioEntry[];
}

export function PublicPortfolioClient({ ownerName, entries }: PublicPortfolioClientProps) {
  const [cardsMap, setCardsMap] = useState<Map<string, NormalizedCard>>(new Map());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const ids = entries.map((entry) => entry.cardId);
    if (ids.length === 0) return;

    getCards(ids).then((result) => {
      const next = new Map<string, NormalizedCard>();
      result.forEach((card, id) => {
        next.set(id, normalizeCard(card));
      });
      setCardsMap(next);
    });
  }, [entries]);

  const totalCards = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalValue = entries.reduce((sum, entry) => {
    const card = cardsMap.get(entry.cardId);
    if (!card?.price) return sum;
    return sum + card.price * entry.quantity;
  }, 0);

  const quantities = useMemo(() => {
    const next: Record<string, number> = {};
    entries.forEach((entry) => {
      next[entry.cardId] = entry.quantity;
    });
    return next;
  }, [entries]);

  const normalizedCards = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    return entries
      .map((entry) => ({
        entry,
        card: cardsMap.get(entry.cardId),
      }))
      .filter((row): row is { entry: PortfolioEntry; card: NormalizedCard } => Boolean(row.card))
      .filter(({ entry, card }) => {
        if (!trimmedQuery) return true;

        const haystack = [
          card.name,
          card.setName,
          card.localId,
          entry.cardId,
          card.rarity,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(trimmedQuery);
      })
      .sort((left, right) => {
        const rightWorth = (right.card.price ?? 0) * right.entry.quantity;
        const leftWorth = (left.card.price ?? 0) * left.entry.quantity;
        if (rightWorth !== leftWorth) return rightWorth - leftWorth;
        return left.card.name.localeCompare(right.card.name);
      })
      .map(({ card }) => card);
  }, [cardsMap, entries, query]);

  return (
    <div className="portfolio-shell" style={{ gap: "1rem" }}>
      <div>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: "0.4rem",
        }}>
          {ownerName}&apos;s Portfolio
        </h1>
        <p className="hide-on-mobile" style={{ marginTop: "0.35rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
          Public collection snapshot
        </p>
      </div>

      <div className="portfolio-stats-grid">
        <StatCard label="Total Cards" value={String(totalCards)} />
        <StatCard label="Unique Cards" value={String(entries.length)} />
        <StatCard label="Portfolio Value" value={totalValue > 0 ? `~${totalValue.toFixed(2)}` : "—"} accent />
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={`Search ${ownerName}'s portfolio`}
        clearLabel="Clear public portfolio search"
      />

      <CardList
        cards={normalizedCards}
        mode="public"
        quantities={quantities}
        emptyMessage={query.trim() ? `No cards found for "${query.trim()}"` : "No public cards yet."}
      />

      <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
          Create your own portfolio
        </Link>
      </div>
    </div>
  );
}


