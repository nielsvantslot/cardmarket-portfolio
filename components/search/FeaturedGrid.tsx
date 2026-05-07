"use client";

import { CardItem } from '@/components/CardItem';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAuth } from '@/lib/authContext';
import type { NormalizedCard } from '@/lib/types';

import type { SlotStatus } from './types';

interface FeaturedGridProps {
  slots: Array<NormalizedCard | null>;
  statuses: SlotStatus[];
  queries: readonly string[];
  visibleCount: number;
}

export function FeaturedGrid({ slots, statuses, queries, visibleCount }: FeaturedGridProps) {
  const { user } = useAuth();
  const visibleIndexes: number[] = [];

  for (let i = 0; i < queries.length && visibleIndexes.length < visibleCount; i++) {
    if (statuses[i] === 'failed') continue;
    visibleIndexes.push(i);
  }

  if (visibleIndexes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="card-grid">
        {visibleIndexes.map((slotIndex) => {
          const card = slots[slotIndex];

          if (card) {
            return (
              <CardItem
                key={queries[slotIndex]}
                card={card}
                mode="search"
                animateIn={false}
              />
            );
          }

          return <SkeletonCard key={queries[slotIndex]} isAuthenticated={!!user} />;
        })}
      </div>
    </>
  );
}
