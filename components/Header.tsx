"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePortfolioContext } from '@/lib/portfolioContext';

export function Header() {
  const pathname = usePathname();
  const { entries } = usePortfolioContext();

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <header style={{
      background: "var(--bg-2)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 1rem",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}>
            Card<span style={{ color: "var(--accent)" }}>Vault</span>
          </span>
          <span style={{
            fontSize: "0.6rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-3)",
            background: "var(--bg-3)",
            padding: "1px 6px",
            borderRadius: 3,
            border: "1px solid var(--border)",
            letterSpacing: "0.1em",
          }}>BETA</span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <NavLink href="/portfolio" active={pathname === "/portfolio"} label="Portfolio" count={totalCards} />
          <NavLink href="/" active={pathname === "/" || pathname === "/search"} label="Explore" />
          <NavLink href="/sets" active={pathname === "/sets" || pathname.startsWith("/sets/")} label="Sets" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.75rem",
        borderRadius: 6,
        fontSize: "0.85rem",
        fontWeight: 600,
        fontFamily: "var(--font-display)",
        letterSpacing: "-0.01em",
        color: active ? "var(--text)" : "var(--text-2)",
        background: active ? "var(--bg-3)" : "transparent",
        border: active ? "1px solid var(--border)" : "1px solid transparent",
        textDecoration: "none",
        transition: "all 0.15s ease",
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: "0.65rem",
          fontFamily: "var(--font-mono)",
          background: "var(--accent)",
          color: "#fff",
          padding: "1px 5px",
          borderRadius: 10,
          lineHeight: 1.5,
        }}>
          {count}
        </span>
      )}
    </Link>
  );
}
