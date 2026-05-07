import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SnapshotBody {
  totalValue?: number;
  totalCards?: number;
  uniqueCards?: number;
  reason?: "daily" | "portfolio-change";
}

const DAILY_SNAPSHOT_COOLDOWN_MS = 1000 * 60 * 60 * 24;
const MUTATION_DUPLICATE_WINDOW_MS = 1000 * 60;
const VALUE_EPSILON = 0.0001;

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as SnapshotBody;
    const reason = body.reason === "portfolio-change" ? "portfolio-change" : "daily";

    const totalValue = Number(body.totalValue ?? 0);
    const totalCards = Math.max(0, Math.trunc(body.totalCards ?? 0));
    const uniqueCards = Math.max(0, Math.trunc(body.uniqueCards ?? 0));

    if (!Number.isFinite(totalValue)) {
      return NextResponse.json({ error: "Invalid totalValue" }, { status: 400 });
    }

    const latest = await prisma.portfolioSnapshot.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        totalValue: true,
        totalCards: true,
        uniqueCards: true,
      },
    });

    if (
      reason === "daily"
      && latest
      && Date.now() - latest.createdAt.getTime() < DAILY_SNAPSHOT_COOLDOWN_MS
    ) {
      return NextResponse.json({ skipped: true });
    }

    if (
      reason === "portfolio-change"
      && latest
      && Date.now() - latest.createdAt.getTime() < MUTATION_DUPLICATE_WINDOW_MS
      && Math.abs(latest.totalValue - totalValue) < VALUE_EPSILON
      && latest.totalCards === totalCards
      && latest.uniqueCards === uniqueCards
    ) {
      return NextResponse.json({ skipped: true });
    }

    await prisma.portfolioSnapshot.create({
      data: {
        userId: user.id,
        totalValue,
        totalCards,
        uniqueCards,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
