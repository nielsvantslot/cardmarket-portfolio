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
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
