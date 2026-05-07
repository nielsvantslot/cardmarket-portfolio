import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { createSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    publicSlug: user.publicSlug,
    bio: user.bio,
  };
  await createSessionCookie(sessionUser);

  return NextResponse.json({ user: sessionUser });
}
