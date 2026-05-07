"use client";

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  getCards,
  normalizeCard,
} from '@/lib/api';
import { usePortfolioContext } from '@/lib/portfolioContext';
import type {
  NormalizedCard,
  PortfolioSnapshotPoint,
} from '@/lib/types';

import { CardList } from './CardList';
import { PortfolioHistoryChart } from './PortfolioHistoryChart';

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "1.25rem 1.5rem",
    }}>
      <div style={{
        fontSize: "0.7rem",
        color: "var(--text-3)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.75rem",
        fontWeight: 800,
        fontFamily: "var(--font-display)",
        letterSpacing: "-0.04em",
        color: accent ? "var(--green)" : "var(--text)",
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
}

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const ONE_HOUR_MS = 1000 * 60 * 60;

export function PortfolioList() {
  const {
    entries,
    hydrated,
    removeCard,
    updateQuantity,
    submitSnapshot,
    portfolioMutationVersion,
  } = usePortfolioContext();
  const [cards, setCards] = useState<Map<string, NormalizedCard>>(new Map());
  const [history, setHistory] = useState<PortfolioSnapshotPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [dayBucket, setDayBucket] = useState(() => Math.floor(Date.now() / ONE_DAY_MS));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDayBucket(Math.floor(Date.now() / ONE_DAY_MS));
    }, ONE_HOUR_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    fetch("/api/portfolio/history")
      .then((res) => (res.ok ? res.json() : { snapshots: [] }))
      .then((data: { snapshots?: PortfolioSnapshotPoint[] }) => {
        setHistory(data.snapshots ?? []);
      })
      .catch(() => setHistory([]));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || entries.length === 0) {
      setCards(new Map());
      return;
    }

    const missing = entries
      .map((e) => e.cardId)
      .filter((id) => !cards.has(id));

    if (missing.length === 0) return;

    setLoading(true);
    getCards(missing).then((fetched) => {
      setCards((prev) => {
        const next = new Map(prev);
        fetched.forEach((card, id) => {
          next.set(id, normalizeCard(card));
        });
        return next;
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, hydrated]);

  if (!hydrated) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: "2.5/3.5", borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "5rem 2rem",
        border: "1px dashed var(--border)",
        borderRadius: 16,
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🃏</div>
        <div style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--text)",
          marginBottom: "0.5rem",
        }}>
          Your portfolio is empty
        </div>
        <div style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Search for cards and add them to start tracking your collection
        </div>
        <Link
          href="/search"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.25rem",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Search Cards
        </Link>
      </div>
    );
  }

  // Compute stats
  const quantities: Record<string, number> = {};
  entries.forEach((e) => { quantities[e.cardId] = e.quantity; });

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  const uniqueCards = entries.length;

  let totalValue = 0;
  let cardsWithPrice = 0;
  entries.forEach((e) => {
    const card = cards.get(e.cardId);
    if (card?.price != null) {
      totalValue += card.price * e.quantity;
      cardsWithPrice++;
    }
  });

  const allCardsLoaded = entries.length === 0 || entries.every((entry) => cards.has(entry.cardId));

  const normalizedCards = useMemo(() => {
    const filtered = entries
      .map((entry) => ({
        entry,
        card: cards.get(entry.cardId),
      }))
      .filter((row): row is { entry: typeof entries[number]; card: NormalizedCard } => Boolean(row.card));

    const trimmedQuery = query.trim().toLowerCase();
    const visible = trimmedQuery
      ? filtered.filter(({ entry, card }) => {
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
      : filtered;

    return visible
      .sort((left, right) => {
        const rightWorth = (right.card.price ?? 0) * right.entry.quantity;
        const leftWorth = (left.card.price ?? 0) * left.entry.quantity;
        if (rightWorth !== leftWorth) return rightWorth - leftWorth;
        return left.card.name.localeCompare(right.card.name);
      })
      .map(({ card }) => card);
  }, [cards, entries, query]);

  useEffect(() => {
    if (!hydrated || entries.length === 0 || portfolioMutationVersion === 0 || !allCardsLoaded) return;

    void submitSnapshot({
      totalValue,
      totalCards,
      uniqueCards,
      reason: "portfolio-change",
    });
  }, [
    allCardsLoaded,
    entries.length,
    hydrated,
    portfolioMutationVersion,
    submitSnapshot,
    totalCards,
    totalValue,
    uniqueCards,
  ]);

  useEffect(() => {
    if (!hydrated || entries.length === 0 || !allCardsLoaded) return;

    void submitSnapshot({
      totalValue,
      totalCards,
      uniqueCards,
      reason: "daily",
    });
  }, [allCardsLoaded, dayBucket, entries.length, hydrated, submitSnapshot, totalCards, totalValue, uniqueCards]);

  return (
    <div className="portfolio-shell">
      {/* Stats row */}
      <div className="portfolio-stats-grid">
        <StatCard label="Total Cards" value={String(totalCards)} />
        <StatCard label="Unique Cards" value={String(uniqueCards)} />
        <StatCard
          label="Portfolio Value"
          value={cardsWithPrice > 0 ? `~${totalValue.toFixed(2)}` : "—"}
          accent
        />
        <StatCard
          label="Avg Card Value"
          value={cardsWithPrice > 0 ? `~${(totalValue / cardsWithPrice).toFixed(2)}` : "—"}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "1rem",
          color: "var(--text-3)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
        }}>
          loading card details…
        </div>
      )}

      <PortfolioHistoryChart snapshots={history} />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search your portfolio"
        className="portfolio-search-input"
      />

      {/* Card grid */}
      <CardList
        cards={normalizedCards}
        mode="portfolio"
        quantities={quantities}
        onQuantityChange={updateQuantity}
        onRemove={removeCard}
        emptyMessage={query.trim() ? `No cards found for "${query.trim()}"` : "Loading cards…"}
      />
    </div>
  );
}
