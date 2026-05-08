"use client";

import Link from 'next/link';

import { PortfolioList } from '@/components/PortfolioList';
import { useAuth } from '@/lib/authContext';

export default function PortfolioPage() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>Loading account...</div>;
  }

  if (!user) {
    return (
      <div style={{
        border: "1px dashed var(--border)",
        borderRadius: 14,
        padding: "2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        alignItems: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: "-0.04em" }}>Portfolio requires an account</h1>
        <p className="hide-on-mobile" style={{ margin: 0, color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          Sign in to sync your cards, sealed products, and value history.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.4rem" }}>
          <Link href="/login" style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}>
            Login
          </Link>
          <Link href="/register" style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            color: "var(--text)",
            textDecoration: "none",
            fontWeight: 700,
          }}>
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (!user.username || !user.publicSlug) {
    return (
      <div style={{
        border: "1px dashed var(--border)",
        borderRadius: 14,
        padding: "2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        alignItems: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: "-0.04em" }}>Complete your setup</h1>
        <p className="hide-on-mobile" style={{ margin: 0, color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          Pick your username and public URL to finish onboarding.
        </p>
        <Link href="/onboarding" style={{
          padding: "0.5rem 1rem",
          borderRadius: 8,
          background: "var(--accent)",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
        }}>
          Continue setup
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: "0.4rem",
        }}>
          My Portfolio
        </h1>
        <p className="hide-on-mobile" style={{
          color: "var(--text-3)",
          fontSize: "0.85rem",
          fontFamily: "var(--font-mono)",
        }}>
          track card quantity and market value in one place
        </p>
      </div>

      <PortfolioList />
    </div>
  );
}
