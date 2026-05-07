import { NextResponse } from 'next/server';

import { requireSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { SealedProduct } from '@/lib/types';

type SealedPatch = Partial<SealedProduct>;

export async function PATCH(request: Request, context: RouteContext<"/api/portfolio/sealed/[id]">) {
  try {
    const user = await requireSessionUser();
    const params = await context.params;
    const id = params.id;
    const patch = (await request.json()) as SealedPatch;

    const existing = await prisma.sealedItem.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.sealedItem.update({
      where: { id },
      data: {
        name: patch.name?.trim(),
        setName: patch.setName === undefined ? undefined : patch.setName?.trim() || null,
        type: patch.type,
        condition: patch.condition,
        quantity: patch.quantity == null ? undefined : Math.max(1, Math.trunc(patch.quantity)),
        purchasePrice: patch.purchasePrice === undefined ? undefined : patch.purchasePrice,
        currency: patch.currency === undefined ? undefined : patch.currency,
        notes: patch.notes === undefined ? undefined : patch.notes.trim() || null,
        imageUrl: patch.imageUrl === undefined ? undefined : patch.imageUrl,
      },
    });

    return NextResponse.json({
      item: {
        id: updated.id,
        name: updated.name,
        setName: updated.setName ?? undefined,
        type: updated.type,
        condition: updated.condition,
        quantity: updated.quantity,
        purchasePrice: updated.purchasePrice ?? undefined,
        currency: updated.currency ?? undefined,
        notes: updated.notes ?? undefined,
        imageUrl: updated.imageUrl ?? undefined,
        addedAt: updated.createdAt.getTime(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized or not found" }, { status: 401 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/portfolio/sealed/[id]">) {
  try {
    const user = await requireSessionUser();
    const params = await context.params;
    const id = params.id;

    await prisma.sealedItem.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ removed: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
