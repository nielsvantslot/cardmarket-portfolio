"use client";

import { CardItem } from '@/components/CardItem';
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
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
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

          return <FeaturedSkeletonCard key={queries[slotIndex]} isAuthenticated={!!user} />;
        })}
      </div>
    </>
  );
}

function FeaturedSkeletonCard({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'var(--bg-3)',
          aspectRatio: '2.5/3.5',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      />

      <div
        style={{
          padding: '0.75rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          minWidth: 0,
        }}
      >
        <SkeletonBar height="0.88rem" width="80%" />
        <SkeletonBar height="0.68rem" width="65%" />
        <SkeletonBar height="0.62rem" width="50%" />
        <div style={{ flex: 1 }} />
        {isAuthenticated && <SkeletonBar height={30} width="100%" />}
      </div>
    </div>
  );
}

function SkeletonBar({ height, width }: { height: number | string; width: number | string }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 6,
        background: 'var(--bg-3)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );
}
