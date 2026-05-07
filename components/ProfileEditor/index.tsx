"use client";

import {
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/authContext';
import { accountService } from '@/lib/services/accountService';
import type { AuthUser } from '@/lib/types';
import styles from '@/components/forms/forms.module.css';

interface ProfileEditorProps {
  mode: "onboarding" | "settings";
  initialUser: AuthUser;
  title: string;
  description: string;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProfileEditor({ mode, initialUser, title, description }: ProfileEditorProps) {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [name, setName] = useState(initialUser.name ?? "");
  const [username, setUsername] = useState(initialUser.username ?? "");
  const [publicSlug, setPublicSlug] = useState(initialUser.publicSlug ?? "");
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewUrl = useMemo(() => {
    const slug = normalizeSlug(publicSlug);
    if (!slug) return "";
    return `${origin}/u/${slug}`;
  }, [origin, publicSlug]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    try {
      await accountService.updateProfile({ name, username, publicSlug, bio });

      await refreshAuth();
      setSaved(true);

      if (mode === "onboarding") {
        router.push("/portfolio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setLoading(false);
    }
  }

  async function copyShareUrl() {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      setSaved(true);
    } catch {}
  }

  return (
    <form
      onSubmit={onSubmit}
      className={styles.formCard}
      style={{ maxWidth: 640, margin: "0 auto" }}
    >
      <h1 style={{
        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        marginBottom: "0.4rem",
      }}>{title}</h1>
      <p style={{ margin: 0, color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
        {description}
      </p>

      <label className={styles.formLabel}>Display Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className={styles.formInput} placeholder="Your display name" />

      <label className={styles.formLabel}>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.formInput}
        placeholder="e.g. cardhunter"
        required
      />

      <label className={styles.formLabel}>Public URL</label>
      <input
        value={publicSlug}
        onChange={(e) => setPublicSlug(e.target.value)}
        className={styles.formInput}
        placeholder="e.g. cardhunter"
        required
      />

      {previewUrl && (
        <div style={{
          fontSize: "0.76rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "0.5rem 0.65rem",
          background: "var(--bg-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}>
          <span>{previewUrl}</span>
          <button type="button" onClick={() => void copyShareUrl()} style={{
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "0.25rem 0.5rem",
            background: "var(--bg-2)",
            color: "var(--text)",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}>Copy</button>
        </div>
      )}

      <label className={styles.formLabel}>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className={styles.formInput}
        style={{ minHeight: 90, resize: "vertical" }}
        placeholder="Tell people what you collect"
      />

      {error && <div className={styles.formError}>{error}</div>}
      {saved && !error && mode === "settings" && (
        <div className={styles.formSuccess}>Profile saved.</div>
      )}

      <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ marginTop: "0.4rem" }}>
        {loading ? "Saving..." : mode === "onboarding" ? "Finish setup" : "Save changes"}
      </button>
    </form>
  );
}
