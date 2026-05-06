import { SearchClient } from '@/components/SearchClient';

export default function SearchPage() {
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
          Explore
        </h1>
      </div>
      <SearchClient />
    </div>
  );
}
