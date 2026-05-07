import type { NormalizedCard } from '@/lib/types';

import { CardItem } from './CardItem';

interface CardListProps {
  cards: NormalizedCard[];
  mode?: "search" | "portfolio" | "public";
  quantities?: Record<string, number>;
  onQuantityChange?: (cardId: string, qty: number) => void;
  onRemove?: (cardId: string) => void;
  emptyMessage?: string;
  animateItems?: boolean;
}

export function CardList({
  cards,
  mode = "search",
  quantities,
  onQuantityChange,
  onRemove,
  emptyMessage = "No cards found",
  animateItems = true,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "4rem 2rem",
        color: "var(--text-3)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.85rem",
        border: "1px dashed var(--border)",
        borderRadius: 12,
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: "1rem",
    }}>
      {cards.map((card, i) => (
        <CardItem
          key={card.id}
          card={card}
          mode={mode}
          quantity={quantities?.[card.id]}
          onQuantityChange={(qty) => onQuantityChange?.(card.id, qty)}
          onRemove={() => onRemove?.(card.id)}
          animateIn={animateItems}
          style={animateItems ? { animationDelay: `${i * 30}ms` } : undefined}
        />
      ))}
    </div>
  );
}
