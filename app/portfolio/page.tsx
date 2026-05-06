"use client";

import { PortfolioList } from '@/components/PortfolioList';

export default function PortfolioPage() {
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
        <p style={{
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
