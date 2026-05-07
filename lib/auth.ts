import {
  jwtVerify,
  SignJWT,
} from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = "cv_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  publicSlug: string | null;
  bio: string | null;
}

function authSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionCookie(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    publicSlug: user.publicSlug,
    bio: user.bio,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(authSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const result = await jwtVerify(token, authSecretKey());
    const payload = result.payload;
    if (!payload.sub || !payload.email) return null;

    return {
      id: payload.sub,
      email: String(payload.email),
      name: payload.name ? String(payload.name) : null,
      username: payload.username ? String(payload.username) : null,
      publicSlug: payload.publicSlug ? String(payload.publicSlug) : null,
      bio: payload.bio ? String(payload.bio) : null,
    };
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
