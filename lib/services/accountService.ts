import type { AuthUser } from '@/lib/types';

import { requestJson } from './httpClient';

export interface ProfileUpdateInput {
  name?: string;
  username?: string;
  publicSlug?: string;
  bio?: string;
}

export interface AccountService {
  updateProfile(input: ProfileUpdateInput): Promise<{ user: AuthUser }>;
}

export const accountService: AccountService = {
  async updateProfile(input: ProfileUpdateInput) {
    return requestJson<{ user: AuthUser }>("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
};
