"use client";
import styles from "@/components/forms/forms.module.css";

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { sortSetsNewestFirst } from '@/lib/api';
import {
  searchService,
  type SearchSet,
} from '@/lib/services/searchService';

export function SetsClient() {
  const [query, setQuery] = useState("");
  const [sets, setSets] = useState<SearchSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    searchService.getSets()
      .then((data) => {
        const next = (data.sets ?? []) as SearchSet[];
        setSets(sortSetsNewestFirst(next));
      })
      .catch(() => {
        setError("Could not load sets.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sets;
    return sets.filter((set) => {
      return set.name.toLowerCase().includes(q) || set.id.toLowerCase().includes(q);
    });
  }, [query, sets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sets by name or id"
        className="portfolio-search-input"
      />

      {error && (
        <div className={styles.formError}>{error}</div>
      )}

      {loading ? (
        <>
          <style>{`
            @keyframes sets-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `}</style>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "0.8rem",
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "0.8rem",
                  animation: `sets-pulse 1.6s ease-in-out ${(i % 6) * 0.1}s infinite`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 58,
                    marginBottom: "0.45rem",
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <div
                  style={{
                    height: "0.82rem",
                    width: "70%",
                    background: "var(--bg-3)",
                    borderRadius: 4,
                    marginBottom: "0.4rem",
                  }}
                />
                <div
                  style={{
                    height: "0.65rem",
                    width: "50%",
                    background: "var(--bg-3)",
                    borderRadius: 4,
                    marginBottom: "0.25rem",
                  }}
                />
                <div
                  style={{
                    height: "0.6rem",
                    width: "35%",
                    background: "var(--bg-3)",
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </div>
        </>
      ) : filteredSets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            border: "1px dashed var(--border)",
            borderRadius: 12,
          }}
        >
          no sets match "{query.trim()}"
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "0.8rem",
          }}
        >
          {filteredSets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${encodeURIComponent(set.id)}?name=${encodeURIComponent(set.name)}`}
              style={{
                display: "block",
                textDecoration: "none",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "0.8rem",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 58,
                  marginBottom: "0.45rem",
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {set.logo ? (
                  <Image
                    src={`${set.logo}.webp`}
                    alt={`${set.name} logo`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 45vw, 230px"
                    style={{ objectFit: "contain", padding: "0.35rem" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-3)",
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    NO LOGO
                  </div>
                )}
              </div>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  color: "var(--text)",
                }}
              >
                {set.name}
              </div>
              <div
                style={{
                  marginTop: "0.25rem",
                  color: "var(--text-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                }}
              >
                {set.id} · {set.cardCount.official} cards
              </div>
              {set.releaseDate && (
                <div
                  style={{
                    marginTop: "0.2rem",
                    color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                  }}
                >
                  released {set.releaseDate}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
