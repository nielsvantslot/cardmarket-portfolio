import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireSessionUser();

    const [entries, sealedItems] = await Promise.all([
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
    ]);

    let latestSnapshotRows: Array<{
      totalValue: number;
      totalCards: number;
      uniqueCards: number;
      createdAt: Date;
    }> = [];

    try {
      latestSnapshotRows = await prisma.$queryRaw<Array<{
        totalValue: number;
        totalCards: number;
        uniqueCards: number;
        createdAt: Date;
      }>>`
        SELECT "totalValue", "totalCards", "uniqueCards", "createdAt"
        FROM "UserLatestPortfolioSnapshot"
        WHERE "userId" = ${user.id}
        LIMIT 1
      `;
    } catch {
      latestSnapshotRows = await prisma.portfolioSnapshot.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          totalValue: true,
          totalCards: true,
          uniqueCards: true,
          createdAt: true,
        },
      });
    }

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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
