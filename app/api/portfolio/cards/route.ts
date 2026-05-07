import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CardBody {
  cardId?: string;
  quantity?: number;
  delta?: number;
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as CardBody;
    const cardId = (body.cardId ?? "").trim();

    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    const delta = Number.isFinite(body.delta) ? Math.trunc(body.delta as number) : 1;

    const existing = await prisma.portfolioCard.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
    });

    const nextQuantity = Math.max(1, (existing?.quantity ?? 0) + delta);

    const entry = await prisma.portfolioCard.upsert({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
      update: { quantity: nextQuantity },
      create: {
        userId: user.id,
        cardId,
        quantity: nextQuantity,
      },
      select: {
        cardId: true,
        quantity: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      entry: {
        cardId: entry.cardId,
        quantity: entry.quantity,
        addedAt: entry.createdAt.getTime(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as CardBody;
    const cardId = (body.cardId ?? "").trim();
    const quantity = Math.trunc(body.quantity ?? 0);

    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.portfolioCard.deleteMany({ where: { userId: user.id, cardId } });
      return NextResponse.json({ removed: true });
    }

    const entry = await prisma.portfolioCard.upsert({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
      update: { quantity },
      create: {
        userId: user.id,
        cardId,
        quantity,
      },
      select: {
        cardId: true,
        quantity: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      entry: {
        cardId: entry.cardId,
        quantity: entry.quantity,
        addedAt: entry.createdAt.getTime(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSessionUser();
    const url = new URL(request.url);
    const cardId = (url.searchParams.get("cardId") ?? "").trim();

    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    await prisma.portfolioCard.deleteMany({ where: { userId: user.id, cardId } });
    return NextResponse.json({ removed: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
