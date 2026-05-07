import { NextResponse } from 'next/server';

import {
  createSessionCookie,
  requireSessionUser,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProfileBody {
  username?: string;
  publicSlug?: string;
  name?: string;
  bio?: string;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,24}$/.test(value);
}

function validatePublicSlug(value: string): boolean {
  return /^[a-z0-9-]{3,32}$/.test(value);
}

export async function GET() {
  try {
    const session = await requireSessionUser();
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, username: true, publicSlug: true, bio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSessionUser();
    const body = (await request.json()) as ProfileBody;

    const updates: { username?: string; publicSlug?: string; name?: string | null; bio?: string | null } = {};

    if (body.username !== undefined) {
      const username = body.username.trim();
      if (!validateUsername(username)) {
        return NextResponse.json({ error: "Username must be 3-24 chars (letters, numbers, underscore)." }, { status: 400 });
      }
      updates.username = username;
    }

    if (body.publicSlug !== undefined) {
      const slug = normalizeSlug(body.publicSlug);
      if (!validatePublicSlug(slug)) {
        return NextResponse.json({ error: "Public URL slug must be 3-32 chars (lowercase, numbers, hyphens)." }, { status: 400 });
      }
      updates.publicSlug = slug;
    }

    if (body.name !== undefined) {
      updates.name = body.name.trim() || null;
    }

    if (body.bio !== undefined) {
      updates.bio = body.bio.trim() || null;
    }

    try {
      const user = await prisma.user.update({
        where: { id: session.id },
        data: updates,
        select: { id: true, email: true, name: true, username: true, publicSlug: true, bio: true },
      });

      await createSessionCookie(user);
      return NextResponse.json({ user });
    } catch {
      return NextResponse.json({ error: "Username or public URL is already in use." }, { status: 409 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
