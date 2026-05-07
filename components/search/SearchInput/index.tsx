"use client";

interface SearchInputProps {
  query: string;
  isSearching: boolean;
  onChange: (nextValue: string) => void;
}

export function SearchInput({ query, isSearching, onChange }: SearchInputProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-3)',
          pointerEvents: 'none',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search: charizard 6, xy95, power keepers…"
          autoFocus
          style={{
            width: '100%',
            padding: '0.875rem 4rem 0.875rem 2.75rem',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.15s ease',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />

        {isSearching && (
          <span style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.05em',
          }}>
            searching…
          </span>
        )}
      </div>
    </section>
  );
}
