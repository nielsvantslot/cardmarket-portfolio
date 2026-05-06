import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  getCardsBySetId,
  searchCards,
  searchSets,
} from '@/lib/api';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "cards";
  const setId = request.nextUrl.searchParams.get("setId") ?? "";
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    if (type === "sets") {
      const sets = await searchSets(q);
      return NextResponse.json({ sets });
    }

    if (setId.trim()) {
      const cards = await getCardsBySetId(setId);
      return NextResponse.json({ cards });
    }

    if (!q.trim()) {
      return NextResponse.json({ cards: [] });
    }

    const cards = await searchCards(q);
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
