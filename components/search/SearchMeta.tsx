"use client";

interface SearchErrorProps {
  error: string;
}

export function SearchError({ error }: SearchErrorProps) {
  return (
    <div style={{
      padding: '0.75rem 1rem',
      background: 'rgba(255,79,106,0.08)',
      border: '1px solid var(--red)',
      borderRadius: 8,
      color: 'var(--red)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
    }}>
      {error}
    </div>
  );
}

interface SearchResultCountProps {
  count: number;
}

export function SearchResultCount({ count }: SearchResultCountProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
      {count} card{count !== 1 ? 's' : ''} found
    </div>
  );
}
