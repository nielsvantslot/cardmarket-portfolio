import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { createSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RegisterBody {
  email?: string;
  password?: string;
}

function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: null,
    },
    select: { id: true, email: true, name: true, username: true, publicSlug: true, bio: true },
  });

  await createSessionCookie(user);
  return NextResponse.json({ user });
}
