import { CardItem } from '@/components/CardItem';
import type { NormalizedCard } from '@/lib/types';

import styles from './CardList.module.css';

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
    return <div className={styles.emptyState}>{emptyMessage}</div>;
  }

  return (
    <div className="card-grid">
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
