"use client";

import {
  CardImagePane,
  PortfolioControls,
  SearchControls,
} from '@/components/CardItemParts';
import { useAuth } from '@/lib/authContext';
import { usePortfolioContext } from '@/lib/portfolioContext';
import type { NormalizedCard } from '@/lib/types';

interface CardItemProps {
  card: NormalizedCard;
  mode?: "search" | "portfolio" | "public";
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  onRemove?: () => void;
  style?: React.CSSProperties;
  animateIn?: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  common: "#9090aa",
  uncommon: "#3effa0",
  rare: "#ffd600",
  "rare holo": "#7c6cff",
  "rare ultra": "#ff8c42",
  "rare secret": "#ff4f6a",
  "amazing rare": "#00d4ff",
  "v": "#7c6cff",
  "vmax": "#ff8c42",
  "ex": "#3effa0",
};

function rarityColor(rarity?: string) {
  if (!rarity) return "var(--text-3)";
  const key = rarity.toLowerCase();
  for (const [k, v] of Object.entries(RARITY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "var(--text-3)";
}

export function CardItem({ card, mode = "search", quantity, onQuantityChange, onRemove, style, animateIn = true }: CardItemProps) {
  const { addCard, getQuantity, updateQuantity } = usePortfolioContext();
  const { user } = useAuth();
  const searchQty = getQuantity(card.id);

  const totalValue = card.price != null && quantity != null ? card.price * quantity : null;

  return (
    <div
      className={animateIn ? "card-hover animate-fade-up" : "card-hover"}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      <CardImagePane image={card.image} name={card.name} price={card.price} currency={card.currency} />

      <div style={{
        padding: "0.75rem",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        minWidth: 0,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: "0.88rem",
          color: "var(--text)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {card.name}
        </div>

        {(card.setName || card.localId) && (
          <div style={{
            fontSize: "0.68rem",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {card.setName
              ? `${card.setName}${card.localId ? ` #${card.localId}` : ""}`
              : `#${card.localId}`}
          </div>
        )}

        {card.rarity && (
          <div style={{
            fontSize: "0.62rem",
            color: rarityColor(card.rarity),
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {card.rarity}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {mode === "portfolio" && quantity !== undefined && (
          <PortfolioControls
            quantity={quantity}
            totalValue={totalValue}
            currency={card.currency}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        )}

        {mode === "search" && user && (
          <SearchControls
            searchQty={searchQty}
            onDecrement={() => void updateQuantity(card.id, searchQty - 1)}
            onIncrement={() => void updateQuantity(card.id, searchQty + 1)}
            onAdd={() => void addCard(card.id)}
          />
        )}
      </div>
    </div>
  );
}
