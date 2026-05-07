import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let user;
  try {
    user = await requireSessionUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [entries, sealedItems, latestSnapshotRows] = await Promise.all([
      prisma.portfolioCard.findMany({
        where: { userId: user.id },
        select: {
          cardId: true,
          quantity: true,
          createdAt: true,
        },
      }),
      prisma.sealedItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.portfolioSnapshot.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          totalValue: true,
          totalCards: true,
          uniqueCards: true,
          createdAt: true,
        },
      }),
    ]);

    const latestSnapshot = latestSnapshotRows[0];

    return NextResponse.json({
      entries: entries.map((entry) => ({
        cardId: entry.cardId,
        quantity: entry.quantity,
        addedAt: entry.createdAt.getTime(),
      })),
      sealedItems: sealedItems.map((item) => ({
        id: item.id,
        name: item.name,
        setName: item.setName ?? undefined,
        type: item.type,
        condition: item.condition,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice ?? undefined,
        currency: item.currency ?? undefined,
        notes: item.notes ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        addedAt: item.createdAt.getTime(),
      })),
      latestSnapshot: latestSnapshot
        ? {
            totalValue: latestSnapshot.totalValue,
            totalCards: latestSnapshot.totalCards,
            uniqueCards: latestSnapshot.uniqueCards,
            createdAt: latestSnapshot.createdAt.toISOString(),
          }
        : null,
    });
  } catch (err) {
    console.error("[GET /api/portfolio]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
