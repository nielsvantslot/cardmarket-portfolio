import { SetsClient } from '@/components/SetsClient';

export default function SetsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "0.4rem",
          }}
        >
          Sets
        </h1>
        <p className="hide-on-mobile" style={{ color: "var(--text-3)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          browse sets by release date and open one to see every card inside
        </p>
      </div>

      <SetsClient />
    </div>
  );
}
