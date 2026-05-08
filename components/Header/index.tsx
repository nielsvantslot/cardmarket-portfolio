"use client";

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/lib/authContext';

import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();
  const { user, logout, authLoading } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileAccountOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileAccountOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileAccountOpen(false);
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isExploreActive = pathname === "/" || pathname === "/search";
  const isSetsActive = pathname === "/sets" || pathname.startsWith("/sets/");
  const isPortfolioActive = pathname === "/portfolio";
  const isSettingsActive = pathname === "/settings";
  const isPublicPortfolioActive = user?.publicSlug ? pathname === `/u/${user.publicSlug}` : false;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
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
          }} className={styles.logoBeta}>BETA</span>
        </Link>

        <div className={styles.right}>
          {/* App nav */}
          <div className={styles.desktopNav}>
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

          <div className={styles.mobileMenuButtonSpacer} aria-hidden />
        </div>
      </div>

      <nav className={styles.mobileBottomBar} aria-label="Mobile navigation">
        <div className={styles.mobileBottomBarInner}>
          <MobileBottomLink href="/" label="Explore" icon="explore" active={isExploreActive} />
          <MobileBottomLink href="/sets" label="Sets" icon="sets" active={isSetsActive} />
          <MobileBottomLink href="/portfolio" label="Portfolio" icon="portfolio" active={isPortfolioActive} />
          <button
            type="button"
            className={[styles.mobileBottomItem, mobileAccountOpen && styles.isActive].filter(Boolean).join(" ")}
            onClick={() => setMobileAccountOpen((current) => !current)}
            aria-expanded={mobileAccountOpen}
            aria-controls="mobile-account-sheet"
            aria-label="Open account actions"
            disabled={authLoading}
          >
            <span className={styles.mobileBottomIcon} aria-hidden>
              <MobileTabIcon icon="account" active={mobileAccountOpen} />
            </span>
            <span className={styles.mobileBottomLabel}>Account</span>
          </button>
        </div>
      </nav>

      {mobileAccountOpen && (
        <div
          className={styles.mobileSheetBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileAccountOpen(false);
            }
          }}
        >
          <section
            className={styles.mobileAccountSheet}
            role="dialog"
            aria-modal="true"
            id="mobile-account-sheet"
            aria-label="Account actions"
          >
            <div className={styles.mobileSheetHeader}>
              <div>
                <div className={styles.mobileSheetHandle} aria-hidden />
                <div className={styles.mobileSheetTitle}>Account</div>
              </div>
              <button
                type="button"
                className={styles.overlayClose}
                onClick={() => setMobileAccountOpen(false)}
                aria-label="Close account actions"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>

            {user ? (
              <>
                <div className={styles.mobileSheetIdentity}>
                  <div className={styles.mobileAccountUser}>{user.username ?? "Account"}</div>
                  <div className={styles.mobileAccountEmail}>{user.email}</div>
                </div>

                <div className={styles.mobileSheetLinks}>
                  <SheetLink href="/settings" label="Settings" active={isSettingsActive} onNavigate={() => setMobileAccountOpen(false)} />
                  {user.publicSlug && (
                    <SheetLink href={`/u/${user.publicSlug}`} label="Public Portfolio" active={isPublicPortfolioActive} onNavigate={() => setMobileAccountOpen(false)} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setMobileAccountOpen(false);
                  }}
                  className={styles.mobileLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className={styles.mobileSheetLinks}>
                <SheetLink href="/login" label="Login" active={pathname === "/login"} onNavigate={() => setMobileAccountOpen(false)} />
                <SheetLink href="/register" label="Register" active={pathname === "/register"} onNavigate={() => setMobileAccountOpen(false)} />
              </div>
            )}
          </section>
        </div>
      )}
    </header>
  );
}

function MobileBottomLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: "explore" | "sets" | "portfolio";
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[styles.mobileBottomItem, active && styles.isActive].filter(Boolean).join(" ")}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <span className={styles.mobileBottomIcon} aria-hidden>
        <MobileTabIcon icon={icon} active={active} />
      </span>
      <span className={styles.mobileBottomLabel}>{label}</span>
    </Link>
  );
}

function MobileTabIcon({
  icon,
  active,
}: {
  icon: "explore" | "sets" | "portfolio" | "account";
  active?: boolean;
}) {
  const stroke = active ? "var(--text)" : "var(--text-2)";

  if (icon === "explore") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.8 8.2 13.9 13.9 8.2 15.8 10.1 10.1Z" />
      </svg>
    );
  }

  if (icon === "sets") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (icon === "portfolio") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M8 11h8" />
        <path d="M8 14h5" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function SheetLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[styles.mobileSheetLink, active && styles.isActive].filter(Boolean).join(" ")}
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
