"use client";
import formsStyles from "@/components/forms/forms.module.css";

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { CardList } from '@/components/CardList';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAuth } from '@/lib/authContext';
import { searchService } from '@/lib/services/searchService';
import type { NormalizedCard } from '@/lib/types';

export function SetDetailClient({ setId }: { setId: string }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const setNameFromQuery = searchParams.get("name") ?? "";

  const [cards, setCards] = useState<NormalizedCard[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId.trim()) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    searchService.getCardsBySetId(setId)
      .then((data) => {
        setCards(data.cards ?? []);
      })
      .catch(() => {
        setCards([]);
        setError("Could not load cards for this set.");
      })
      .finally(() => setLoading(false));
  }, [setId]);

  const setLabel = useMemo(() => {
    if (setNameFromQuery.trim()) return setNameFromQuery;
    return setId;
  }, [setId, setNameFromQuery]);

  const filteredCards = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((card) => {
      return (
        card.name.toLowerCase().includes(q) ||
        (card.localId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [cards, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <Link
          href="/sets"
          style={{
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.76rem",
            textDecoration: "none",
          }}
        >
          ← back to sets
        </Link>
      </div>

      <div style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
        {setLabel} ({setId}) · {filteredCards.length}/{cards.length} cards{loading ? " · loading..." : ""}
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter cards in this set by name or #"
        className="portfolio-search-input"
      />

      {error && (
        <div className={formsStyles.formError}>{error}</div>
      )}

      {loading && cards.length === 0 ? (
        <div className="card-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={`card-skeleton-${i}`} isAuthenticated={!!user} />
          ))}
        </div>
      ) : (
        <CardList
          cards={filteredCards}
          mode="search"
          animateItems={false}
          emptyMessage={loading ? "Loading cards..." : "No cards found in this set"}
        />
      )}
    </div>
  );
}
