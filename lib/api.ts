import type {
  CardBrief,
  CardFull,
  CardmarketPricing,
  NormalizedCard,
  SetBrief,
  TcgPlayerPricing,
} from './types';

const BASE_URL = "https://api.tcgdex.net/v2/en";
const SEARCH_PAGE_SIZE = 60;
const SET_CARDS_PAGE_SIZE = 120;
const MAX_SET_CARDS = 480;
const CARD_DETAIL_BATCH_SIZE = 24;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
//
// Combo search supports any mix of name, number, and set fragments
// without requiring a separate mode selector.
//
// TCGDex filter syntax:
//   name=pikachu          → cards whose name contains "pikachu"
//   localId=25            → card number within its set
//   set.name=Base Set     → all cards from set with that name

function isLocalIdToken(token: string): boolean {
  return /^(?=.*\d)[a-z0-9-]+$/i.test(token);
}

function isPocketSerieId(serieId?: string): boolean {
  return (serieId ?? "").toLowerCase() === "tcgp";
}

function isPocketAssetUrl(value?: string): boolean {
  return (value ?? "").toLowerCase().includes("/tcgp/");
}

function isPocketCardId(id?: string): boolean {
  return /^(a|b)\d/i.test(id ?? "") && !String(id ?? "").toLowerCase().startsWith("bw");
}

function isPocketSetName(name?: string): boolean {
  return /\bpocket\b/i.test(name ?? "");
}

function isPocketBrief(card: CardBrief): boolean {
  return Boolean(
    isPocketSerieId(card.set?.serie?.id)
    || isPocketSetName(card.set?.name)
    || isPocketAssetUrl(card.image)
    || isPocketCardId(card.id)
  );
}

function isPocketFull(card: CardFull): boolean {
  return Boolean(
    isPocketSerieId(card.set?.serie?.id)
    || isPocketSetName(card.set?.name)
    || isPocketAssetUrl(card.image)
    || isPocketAssetUrl(card.set?.logo)
    || isPocketAssetUrl(card.set?.symbol)
    || isPocketCardId(card.id)
  );
}

async function comboSearch(query: string): Promise<NormalizedCard[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);

  const rankedQueries: Array<{ rank: number; path: string }> = [];
  const seenQueries = new Set<string>();

  function addQuery(rank: number, params: string) {
    if (seenQueries.has(params)) return;
    seenQueries.add(params);
    rankedQueries.push({ rank, path: `/cards?${params}&pagination:itemsPerPage=${SEARCH_PAGE_SIZE}` });
  }

  // Baseline searches
  addQuery(3, `name=${encodeURIComponent(trimmed)}`);
  addQuery(4, `localId=${encodeURIComponent(trimmed)}`);
  addQuery(5, `set.name=${encodeURIComponent(trimmed)}`);

  // Split attempts for mixed queries.
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(" ");
    const right = words.slice(i).join(" ");
    if (!left || !right) continue;

    addQuery(2, `name=${encodeURIComponent(left)}&set.name=${encodeURIComponent(right)}`);

    // Boost exact card-number style queries, e.g. "charizard 6" or "mew xy95".
    if (isLocalIdToken(right)) {
      addQuery(1, `name=${encodeURIComponent(left)}&localId=${encodeURIComponent(right)}`);
    }
  }

  const responses = await Promise.all(
    rankedQueries.map(async ({ rank, path }) => {
      const data = await apiFetch<CardBrief[]>(path);
      return { rank, data: Array.isArray(data) ? data : [] };
    })
  );

  responses.sort((a, b) => a.rank - b.rank);

  const seen = new Set<string>();
  const ordered: NormalizedCard[] = [];
  for (const group of responses) {
    for (const card of group.data) {
      if (isPocketBrief(card)) continue;
      if (seen.has(card.id)) continue;
      seen.add(card.id);
      ordered.push(briefToNormalized(card));
    }
  }

  return ordered;
}

export async function searchCards(query: string): Promise<NormalizedCard[]> {
  const cards = await comboSearch(query);
  return hydrateNormalizedCards(cards);
}

export async function searchSets(query = ""): Promise<SetBrief[]> {
  const path = query.trim()
    ? `/sets?name=${encodeURIComponent(query.trim())}`
    : "/sets";
  const data = await apiFetch<SetBrief[]>(path);
  if (!data || !Array.isArray(data)) return [];

  // The list endpoint does not include releaseDate, so hydrate from set details.
  const detailResponses = await Promise.allSettled(
    data.map((set) => apiFetch<SetBrief>(`/sets/${encodeURIComponent(set.id)}`))
  );

  return data
    .map((set, index) => {
      const detail = detailResponses[index].status === "fulfilled"
        ? detailResponses[index].value
        : null;

      return {
        ...set,
        releaseDate: detail?.releaseDate ?? set.releaseDate,
        logo: set.logo ?? detail?.logo,
        symbol: set.symbol ?? detail?.symbol,
        cardCount: detail?.cardCount ?? set.cardCount,
        serie: detail?.serie ?? set.serie,
      };
    })
    .filter((set) => set.serie?.id !== "tcgp");
}

export async function getCardsBySetId(setId: string): Promise<NormalizedCard[]> {
  const id = setId.trim();
  if (!id || id.toLowerCase().includes("tcgp") || id.toLowerCase().includes("pocket") || isPocketCardId(id)) return [];

  const pages = Math.ceil(MAX_SET_CARDS / SET_CARDS_PAGE_SIZE);
  const pagePromises: Promise<CardBrief[] | null>[] = [];

  for (let page = 1; page <= pages; page++) {
    pagePromises.push(
      apiFetch<CardBrief[]>(
        `/cards?set.id=${encodeURIComponent(id)}&pagination:itemsPerPage=${SET_CARDS_PAGE_SIZE}&pagination:page=${page}`
      )
    );
  }

  const allPages = await Promise.all(pagePromises);
  const cards: CardBrief[] = [];
  for (const pageData of allPages) {
    if (!pageData || !Array.isArray(pageData) || pageData.length === 0) break;
    cards.push(...pageData);
    if (pageData.length < SET_CARDS_PAGE_SIZE) break;
  }

  return hydrateBriefCards(cards);
}

async function hydrateBriefCards(cards: CardBrief[]): Promise<NormalizedCard[]> {
  const normalized = cards.map(briefToNormalized);
  return hydrateNormalizedCards(normalized);
}

async function hydrateNormalizedCards(cards: NormalizedCard[]): Promise<NormalizedCard[]> {
  if (cards.length === 0) return [];

  const uniqueIds = Array.from(new Set(cards.map((card) => card.id)));
  const fullCards = await getCards(uniqueIds);

  return cards.flatMap((card) => {
    const full = fullCards.get(card.id);
    if (!full) return [card];
    if (isPocketFull(full)) return [];

    const hydrated = normalizeCard(full);
    return [{
      ...card,
      ...hydrated,
      image: card.image ?? hydrated.image,
      setName: hydrated.setName ?? card.setName,
      setId: hydrated.setId ?? card.setId,
      localId: hydrated.localId ?? card.localId,
      rarity: hydrated.rarity ?? card.rarity,
    }];
  });
}

function setDateTimestamp(set: SetBrief): number {
  if (!set.releaseDate) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(set.releaseDate);
  if (Number.isNaN(t)) return Number.NEGATIVE_INFINITY;
  return t;
}

export function sortSetsNewestFirst(sets: SetBrief[]): SetBrief[] {
  return [...sets].sort((a, b) => {
    const dateDiff = setDateTimestamp(b) - setDateTimestamp(a);
    if (dateDiff !== 0) return dateDiff;
    return b.id.localeCompare(a.id);
  });
}

function briefToNormalized(card: CardBrief): NormalizedCard {
  return {
    id: card.id,
    name: card.name,
    image: card.image ? `${card.image}/low.webp` : undefined,
    localId: card.localId,
    setName: undefined,
    setId: undefined,
    rarity: undefined,
    price: null,
    currency: null,
  };
}

// ── Full card fetch ───────────────────────────────────────────────────────────

export async function getCard(id: string): Promise<CardFull | null> {
  return apiFetch<CardFull>(`/cards/${id}`);
}

export async function getCards(ids: string[]): Promise<Map<string, CardFull>> {
  const map = new Map<string, CardFull>();

  for (let i = 0; i < ids.length; i += CARD_DETAIL_BATCH_SIZE) {
    const batch = ids.slice(i, i + CARD_DETAIL_BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((id) => getCard(id)));
    results.forEach((result, batchIndex) => {
      if (result.status === "fulfilled" && result.value) {
        map.set(batch[batchIndex], result.value);
      }
    });
  }

  return map;
}

// ── Price extraction ──────────────────────────────────────────────────────────

export function extractPrice(card: CardFull): { price: number | null; currency: string | null } {
  const cm = card.pricing?.cardmarket;
  if (cm) {
    const price = bestCardmarketPrice(cm);
    if (price != null && price > 0) return { price, currency: cm.unit ?? "EUR" };
  }

  const tcp = card.pricing?.tcgplayer;
  if (tcp) {
    const price = bestTcgPlayerPrice(tcp);
    if (price != null && price > 0) return { price, currency: tcp.unit ?? "USD" };
  }

  return { price: null, currency: null };
}

function bestCardmarketPrice(cm: CardmarketPricing): number | null {
  return cm.avg ?? cm.trend ?? cm.avg7 ?? cm.avg30 ?? cm.low ?? null;
}

function bestTcgPlayerPrice(tcp: TcgPlayerPricing): number | null {
  const variants = [
    tcp.normal,
    tcp.holofoil,
    tcp["reverse-holofoil"],
    tcp["1st-edition"],
    tcp.unlimited,
  ];
  for (const v of variants) {
    if (!v) continue;
    const p = v.marketPrice ?? v.midPrice ?? v.lowPrice ?? null;
    if (p != null && p > 0) return p;
  }
  return null;
}

// ── Normalize full card ───────────────────────────────────────────────────────

export function normalizeCard(card: CardFull): NormalizedCard {
  const { price, currency } = extractPrice(card);
  return {
    id: card.id,
    name: card.name,
    image: card.image ? `${card.image}/low.webp` : undefined,
    setName: card.set?.name,
    setId: card.set?.id,
    localId: card.localId,
    rarity: card.rarity,
    price,
    currency,
  };
}
