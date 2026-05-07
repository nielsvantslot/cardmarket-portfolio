"use client";

import {
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { usePortfolioContext } from '@/lib/portfolioContext';
import type { AuthUser } from '@/lib/types';

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
  const { refresh } = usePortfolioContext();

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
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, publicSlug, bio }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to save profile");
      }

      await refresh();
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
      style={{
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "1.25rem",
      }}
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

      <label style={labelStyle}>Display Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Your display name" />

      <label style={labelStyle}>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={fieldStyle}
        placeholder="e.g. cardhunter"
        required
      />

      <label style={labelStyle}>Public URL</label>
      <input
        value={publicSlug}
        onChange={(e) => setPublicSlug(e.target.value)}
        style={fieldStyle}
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
          <button type="button" onClick={() => void copyShareUrl()} style={smallButtonStyle}>Copy</button>
        </div>
      )}

      <label style={labelStyle}>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
        placeholder="Tell people what you collect"
      />

      {error && <div style={{ color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{error}</div>}
      {saved && !error && mode === "settings" && (
        <div style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
          Profile saved.
        </div>
      )}

      <button type="submit" disabled={loading} style={submitButtonStyle}>
        {loading ? "Saving..." : mode === "onboarding" ? "Finish setup" : "Save changes"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontFamily: "var(--font-mono)",
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginTop: "0.2rem",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.65rem 0.75rem",
  background: "var(--bg-3)",
  color: "var(--text)",
  outline: "none",
};

const submitButtonStyle: React.CSSProperties = {
  marginTop: "0.4rem",
  border: "none",
  borderRadius: 8,
  padding: "0.65rem 0.9rem",
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 700,
  fontFamily: "var(--font-display)",
  cursor: "pointer",
};

const smallButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "0.25rem 0.5rem",
  background: "var(--bg-2)",
  color: "var(--text)",
  cursor: "pointer",
};
