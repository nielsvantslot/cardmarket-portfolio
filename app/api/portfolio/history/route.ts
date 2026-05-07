import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireSessionUser();

    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 180,
      select: {
        totalValue: true,
        totalCards: true,
        uniqueCards: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      snapshots: snapshots.map((item: { totalValue: number; totalCards: number; uniqueCards: number; createdAt: Date }) => ({
        totalValue: item.totalValue,
        totalCards: item.totalCards,
        uniqueCards: item.uniqueCards,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
