import type { AuthUser } from '@/lib/types';

import { requestJson } from './httpClient';

interface AuthResponse {
  user: AuthUser & { username?: string | null; publicSlug?: string | null };
}

interface SessionResponse {
  user: AuthUser | null;
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  register(email: string, password: string): Promise<AuthResponse>;
  getSession(): Promise<SessionResponse>;
  logout(): Promise<{ ok: true }>;
}

export const authService: AuthService = {
  async login(email: string, password: string) {
    return requestJson<AuthResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string) {
    return requestJson<AuthResponse>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  async getSession() {
    return requestJson<SessionResponse>("/api/auth/session");
  },

  async logout() {
    return requestJson<{ ok: true }>("/api/auth/logout", { method: "POST" });
  },
};
