"use client";

import { useEffect, useState } from "react";
import { usePortfolioContext } from "@/lib/portfolioContext";
import { getCards, normalizeCard } from "@/lib/api";
import type { NormalizedCard } from "@/lib/types";
import { CardList } from "./CardList";
import Link from "next/link";

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

export function PortfolioList() {
  const { entries, hydrated, removeCard, updateQuantity } = usePortfolioContext();
  const [cards, setCards] = useState<Map<string, NormalizedCard>>(new Map());
  const [loading, setLoading] = useState(false);

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
  const normalizedCards = entries
    .map((e) => cards.get(e.cardId))
    .filter(Boolean) as NormalizedCard[];

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
      }}>
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

      {/* Card grid */}
      <CardList
        cards={normalizedCards}
        mode="portfolio"
        quantities={quantities}
        onQuantityChange={updateQuantity}
        onRemove={removeCard}
        emptyMessage="Loading cards…"
      />
    </div>
  );
}
