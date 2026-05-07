// ── TCGDex Brief (search results) ────────────────────────────────────────────

export interface CardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
  set?: {
    id: string;
    name: string;
    serie?: { id: string; name: string };
  };
}

// ── Pricing (from full card) ──────────────────────────────────────────────────

export interface CardmarketPricing {
  updated?: string;
  unit?: string;
  avg?: number;
  low?: number;
  trend?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
  "avg-holo"?: number;
  "low-holo"?: number;
  "trend-holo"?: number;
  "avg1-holo"?: number;
  "avg7-holo"?: number;
  "avg30-holo"?: number;
}

export interface TcgPlayerVariant {
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
}

export interface TcgPlayerPricing {
  updated?: string;
  unit?: string;
  normal?: TcgPlayerVariant;
  holofoil?: TcgPlayerVariant;
  "reverse-holofoil"?: TcgPlayerVariant;
  "1st-edition"?: TcgPlayerVariant;
  "1st-edition-holofoil"?: TcgPlayerVariant;
  unlimited?: TcgPlayerVariant;
  "unlimited-holofoil"?: TcgPlayerVariant;
}

export interface CardPricing {
  cardmarket?: CardmarketPricing;
  tcgplayer?: TcgPlayerPricing;
}

// ── Set brief (embedded in card) ─────────────────────────────────────────────

export interface SetBrief {
  id: string;
  name: string;
  releaseDate?: string;
  logo?: string;
  symbol?: string;
  cardCount: { total: number; official: number };
  serie?: { id: string; name: string };
}

// ── Full card ─────────────────────────────────────────────────────────────────

export interface CardFull {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category: "Pokemon" | "Trainer" | "Energy";
  illustrator?: string;
  rarity?: string;
  set: SetBrief;
  hp?: number;
  types?: string[];
  stage?: string;
  variants?: {
    normal: boolean;
    reverse: boolean;
    holo: boolean;
    firstEdition: boolean;
  };
  pricing?: CardPricing;
  updated?: string;
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export interface PortfolioEntry {
  cardId: string;
  quantity: number;
  addedAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  publicSlug: string | null;
  bio: string | null;
}

export interface PortfolioSnapshotPoint {
  totalValue: number;
  totalCards: number;
  uniqueCards: number;
  createdAt: string;
}

// ── Sealed Product ────────────────────────────────────────────────────────────

export type SealedCondition = "sealed" | "opened";

export interface SealedProduct {
  id: string;           // uuid
  name: string;         // e.g. "Scarlet & Violet Booster Box"
  setName?: string;     // e.g. "Scarlet & Violet"
  type: "booster-box" | "booster-pack" | "etb" | "tin" | "collection-box" | "blister" | "other";
  condition: SealedCondition;
  quantity: number;
  purchasePrice?: number; // what you paid per unit
  currency?: string;      // "USD" | "EUR"
  notes?: string;
  addedAt: number;
  imageUrl?: string;
}

// ── Normalized (used throughout UI) ──────────────────────────────────────────

export interface NormalizedCard {
  id: string;
  name: string;
  image?: string;
  setName?: string;
  setId?: string;
  localId?: string;
  rarity?: string;
  /** Best available price in its native currency */
  price: number | null;
  /** Currency symbol for the price */
  currency: string | null;
}
