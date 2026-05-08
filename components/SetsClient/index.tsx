"use client";
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import styles from '@/components/forms/forms.module.css';
import { SearchField } from '@/components/ui/SearchField';
import { sortSetsNewestFirst } from '@/lib/api';
import {
  searchService,
  type SearchSet,
} from '@/lib/services/searchService';

import pageStyles from './SetsClient.module.css';

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
    <div className={pageStyles.root}>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search sets by name or id"
        clearLabel="Clear set search"
      />

      {error && (
        <div className={styles.formError}>{error}</div>
      )}

      {loading ? (
        <div className={pageStyles.grid}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className={pageStyles.skeletonCard}
                style={{ animationDelay: `${(i % 6) * 0.1}s` }}
              >
                <div className={pageStyles.skeletonLogo} />
                <div className={pageStyles.skeletonLine} />
                <div className={pageStyles.skeletonLineSmall} />
                <div className={pageStyles.skeletonLineTiny} />
              </div>
            ))}
        </div>
      ) : filteredSets.length === 0 ? (
        <div className={pageStyles.empty}>
          no sets match "{query.trim()}"
        </div>
      ) : (
        <div className={pageStyles.grid}>
          {filteredSets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${encodeURIComponent(set.id)}?name=${encodeURIComponent(set.name)}`}
              className={pageStyles.card}
            >
              <div className={pageStyles.logoBox}>
                {set.logo ? (
                  <Image
                    src={`${set.logo}.webp`}
                    alt={`${set.name} logo`}
                    fill
                    unoptimized
                    sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 230px"
                    style={{ objectFit: "contain", padding: "0.35rem" }}
                  />
                ) : (
                  <div className={pageStyles.logoFallback}>
                    NO LOGO
                  </div>
                )}
              </div>

              <div className={pageStyles.title}>
                {set.name}
              </div>
              <div className={pageStyles.meta}>
                {set.id} · {set.cardCount.official} cards
              </div>
              {set.releaseDate && (
                <div className={pageStyles.release}>
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
