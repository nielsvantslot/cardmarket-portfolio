import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { SealedProduct } from '@/lib/types';

type NewSealedInput = Omit<SealedProduct, "id" | "addedAt">;

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as NewSealedInput;

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const created = await prisma.sealedItem.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        setName: body.setName?.trim() || null,
        type: body.type,
        condition: body.condition,
        quantity: Math.max(1, Math.trunc(body.quantity || 1)),
        purchasePrice: body.purchasePrice ?? null,
        currency: body.currency ?? null,
        notes: body.notes?.trim() || null,
        imageUrl: body.imageUrl ?? null,
      },
    });

    return NextResponse.json({
      item: {
        id: created.id,
        name: created.name,
        setName: created.setName ?? undefined,
        type: created.type,
        condition: created.condition,
        quantity: created.quantity,
        purchasePrice: created.purchasePrice ?? undefined,
        currency: created.currency ?? undefined,
        notes: created.notes ?? undefined,
        imageUrl: created.imageUrl ?? undefined,
        addedAt: created.createdAt.getTime(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
