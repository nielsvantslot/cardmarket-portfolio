"use client";

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/lib/authContext';
import { usePortfolioContext } from '@/lib/portfolioContext';

export function Header() {
  const pathname = usePathname();
  const { entries } = usePortfolioContext();
  const { user, logout, authLoading } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);

  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const isExploreActive = pathname === "/" || pathname === "/search";
  const isSetsActive = pathname === "/sets" || pathname.startsWith("/sets/");
  const isPortfolioActive = pathname === "/portfolio";
  const isSettingsActive = pathname === "/settings";
  const isPublicPortfolioActive = user?.publicSlug ? pathname === `/u/${user.publicSlug}` : false;

  return (
    <header className="cv-header">
      <div className="cv-header-inner">
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
          }} className="cv-logo-beta">BETA</span>
        </Link>

        <div className="cv-header-right">
          {/* App nav */}
          <div className="cv-desktop-nav">
            <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <NavLink href="/" active={isExploreActive} label="Explore" />
              <NavLink href="/sets" active={isSetsActive} label="Sets" />
              <NavLink href="/portfolio" active={isPortfolioActive} label="Portfolio" />
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

          <button
            type="button"
            className="cv-mobile-menu-button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className={`cv-burger ${mobileMenuOpen ? "is-open" : ""}`} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="cv-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileMenuOpen(false);
            }
          }}
        >
          <div className="cv-mobile-menu-content">
            <div className="cv-mobile-menu-head">
              <button
                type="button"
                className="cv-mobile-overlay-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>

            <nav className="cv-mobile-links">
              <MobileMenuLink href="/" label="Explore" active={isExploreActive} onNavigate={() => setMobileMenuOpen(false)} />
              <MobileMenuLink href="/sets" label="Sets" active={isSetsActive} onNavigate={() => setMobileMenuOpen(false)} />
              <MobileMenuLink href="/portfolio" label={`Portfolio`} active={isPortfolioActive} onNavigate={() => setMobileMenuOpen(false)} />
            </nav>

            <section className="cv-mobile-account-section" aria-label="Account">
              {!authLoading && !user && (
                <nav className="cv-mobile-account-links">
                  <MobileMenuLink href="/login" label="Login" compact active={pathname === "/login"} onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileMenuLink href="/register" label="Register" compact active={pathname === "/register"} onNavigate={() => setMobileMenuOpen(false)} />
                </nav>
              )}

              {!authLoading && user && (
                <div className="cv-mobile-account-block">
                  <div className="cv-mobile-account-meta">
                    <div className="cv-mobile-account-user">{user.username ?? "Account"}</div>
                    <div className="cv-mobile-account-email">{user.email}</div>
                  </div>

                  <nav className="cv-mobile-account-links">
                    <MobileMenuLink href="/settings" label="Settings" compact active={isSettingsActive} onNavigate={() => setMobileMenuOpen(false)} />
                    {user.publicSlug && <MobileMenuLink href={`/u/${user.publicSlug}`} label="Public" compact active={isPublicPortfolioActive} onNavigate={() => setMobileMenuOpen(false)} />}
                  </nav>

                  <button
                    type="button"
                    onClick={() => {
                      void logout();
                      setMobileMenuOpen(false);
                    }}
                    className="cv-mobile-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileMenuLink({
  href,
  label,
  active,
  compact,
  onNavigate,
}: {
  href: string;
  label: string;
  active?: boolean;
  compact?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`cv-mobile-link${active ? " is-active" : ""}${compact ? " is-compact" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
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
