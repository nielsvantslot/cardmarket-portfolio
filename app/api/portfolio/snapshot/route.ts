import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SnapshotBody {
  totalValue?: number;
  totalCards?: number;
  uniqueCards?: number;
}

const SNAPSHOT_COOLDOWN_MS = 1000 * 60 * 60 * 6;

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as SnapshotBody;

    const totalValue = Number(body.totalValue ?? 0);
    const totalCards = Math.max(0, Math.trunc(body.totalCards ?? 0));
    const uniqueCards = Math.max(0, Math.trunc(body.uniqueCards ?? 0));

    if (!Number.isFinite(totalValue)) {
      return NextResponse.json({ error: "Invalid totalValue" }, { status: 400 });
    }

    const latest = await prisma.portfolioSnapshot.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (latest && Date.now() - latest.createdAt.getTime() < SNAPSHOT_COOLDOWN_MS) {
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
