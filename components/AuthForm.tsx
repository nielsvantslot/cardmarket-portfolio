"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authService } from '@/lib/services/authService';

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const passwordType = showPassword ? "text" : "password";
  const canSubmit = useMemo(() => {
    if (!isRegister) return true;
    return password.length >= 8 && password === confirmPassword;
  }, [confirmPassword, isRegister, password]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const data = await (isRegister
        ? authService.register(email, password)
        : authService.login(email, password));

      const needsOnboarding = !data.user?.username || !data.user?.publicSlug;
      router.push(isRegister || needsOnboarding ? "/onboarding" : "/portfolio");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        padding: "1.25rem",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--bg-2)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: "-0.04em" }}>
        {isRegister ? "Create account" : "Welcome back"}
      </h1>
      <p style={{ margin: 0, color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
        {isRegister ? "Start tracking your collection with cloud sync." : "Sign in to load your portfolio."}
      </p>

      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={fieldStyle}
        autoComplete="email"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        <input
          required
          type={passwordType}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={8}
          style={fieldStyle}
          autoComplete={isRegister ? "new-password" : "current-password"}
        />

        {isRegister && (
          <input
            required
            type={passwordType}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            minLength={8}
            style={fieldStyle}
            autoComplete="new-password"
          />
        )}

        <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.74rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          Show password
        </label>

        {isRegister && confirmPassword.length > 0 && password !== confirmPassword && (
          <div style={{ color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
            Passwords do not match.
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        style={{
          marginTop: "0.35rem",
          border: "none",
          borderRadius: 8,
          padding: "0.65rem 0.9rem",
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading || !canSubmit ? 0.6 : 1,
        }}
      >
        {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>

      <p style={{ margin: "0.35rem 0 0", color: "var(--text-3)", fontSize: "0.8rem" }}>
        {isRegister ? "Already have an account?" : "Need an account?"} {" "}
        <Link href={isRegister ? "/login" : "/register"} style={{ color: "var(--accent)" }}>
          {isRegister ? "Sign in" : "Register"}
        </Link>
      </p>
    </form>
  );
}

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
