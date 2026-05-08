"use client";

import { useState } from 'react';

import { CardList } from '@/components/CardList';
import {
  FEATURED_CARDS,
  INITIAL_RENDER_COUNT,
  LOAD_MORE_COUNT,
  SEARCH_DEBOUNCE_MS,
} from '@/components/search/constants';
import { FeaturedGrid } from '@/components/search/FeaturedGrid';
import {
  SearchError,
  SearchResultCount,
} from '@/components/search/SearchMeta';
import { useDebouncedValue } from '@/components/search/useDebouncedValue';
import { useFeaturedSlots } from '@/components/search/useFeaturedSlots';
import { useSearchResults } from '@/components/search/useSearchResults';
import { useVisibleCount } from '@/components/search/useVisibleCount';
import { SearchField } from '@/components/ui/SearchField';

export function SearchClient() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const isSearchMode = debouncedQuery.trim().length > 0;

  const { results, error, isSearching } = useSearchResults(debouncedQuery);

  const activeTotalCount = isSearchMode ? results.length : FEATURED_CARDS.length;
  const { visibleCount, hasMoreToShow, sentinelRef } = useVisibleCount({
    initialCount: INITIAL_RENDER_COUNT,
    chunkSize: LOAD_MORE_COUNT,
    totalCount: activeTotalCount,
    resetKey: debouncedQuery,
  });

  const { slots: featuredSlots, statuses: featuredStatuses } = useFeaturedSlots({
    queries: FEATURED_CARDS,
    visibleCount,
    enabled: !isSearchMode,
  });

  const visibleResults = results.slice(0, visibleCount);

  return (
    <div className="portfolio-shell">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search: charizard 6, xy95, power keepers..."
        clearLabel="Clear search"
        autoFocusDesktop
        showLeadingIcon
      />
      {error && <SearchError error={error} />}
      <SearchResultCount count={results.length} />

      {!isSearchMode && (
        <FeaturedGrid
          slots={featuredSlots}
          statuses={featuredStatuses}
          queries={FEATURED_CARDS}
          visibleCount={visibleCount}
        />
      )}

      {isSearchMode && !error && (
        <CardList
          cards={visibleResults}
          mode="search"
          animateItems={false}
          emptyMessage={
            isSearching
              ? 'Searching...'
              : `No cards found for "${debouncedQuery}"`
          }
        />
      )}

      {hasMoreToShow && <div ref={sentinelRef} style={{ height: 1 }} />}
    </div>
  );
}
