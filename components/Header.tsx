"use client";

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePortfolioContext } from '@/lib/portfolioContext';

export function Header() {
  const pathname = usePathname();
  const { entries, user, logout, authLoading } = usePortfolioContext();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

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

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* App nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <NavLink href="/" active={pathname === "/" || pathname === "/search"} label="Explore" />
            <NavLink href="/sets" active={pathname === "/sets" || pathname.startsWith("/sets/")} label="Sets" />
            <NavLink href="/portfolio" active={pathname === "/portfolio"} label="Portfolio" count={totalCards} />
          </nav>

          <div style={{ width: 1, height: 24, background: "var(--border)" }} />

          {/* Account nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", position: "relative" }}>
            {!authLoading && !user && (
              <Link
                href="/login"
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 6,
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                Login
              </Link>
            )}

            {!authLoading && user && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.35rem 0.65rem",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--bg-3)",
                    color: "var(--text)",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-display)",
                    cursor: "pointer",
                  }}
                  aria-expanded={accountMenuOpen}
                >
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                  }}>
                    {(user.username ?? user.email).slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{
                    maxWidth: 92,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {user.username ?? user.email}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>
                    {accountMenuOpen ? "▲" : "▼"}
                  </span>
                </button>

                {accountMenuOpen && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 0.45rem)",
                    right: 0,
                    minWidth: 200,
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
                    padding: "0.45rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    zIndex: 60,
                  }}>
                    <div style={{
                      padding: "0.45rem 0.55rem 0.55rem",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: "0.15rem",
                    }}>
                      <div style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        letterSpacing: "-0.02em",
                      }}>
                        {user.username ?? "Account"}
                      </div>
                      <div style={{
                        fontSize: "0.66rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-3)",
                        marginTop: "0.1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {user.email}
                      </div>
                    </div>

                    <MenuLink href="/settings" label="Settings" />
                    {user.publicSlug && <MenuLink href={`/u/${user.publicSlug}`} label="Public Portfolio" />}
                    <button
                      type="button"
                      onClick={() => void logout()}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.55rem 0.65rem",
                        borderRadius: 8,
                        border: "1px solid transparent",
                        background: "transparent",
                        color: "var(--text-2)",
                        fontSize: "0.8rem",
                        fontFamily: "var(--font-display)",
                        cursor: "pointer",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "0.55rem 0.65rem",
        borderRadius: 8,
        color: "var(--text)",
        fontSize: "0.8rem",
        fontFamily: "var(--font-display)",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
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
