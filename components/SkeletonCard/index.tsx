export function SkeletonCard({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div
        className="skeleton"
        style={{
          position: 'relative',
          aspectRatio: '2.5/3.5',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      />

      <div
        style={{
          padding: '0.75rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          minWidth: 0,
        }}
      >
        <SkeletonBar height="0.88rem" width="80%" />
        <SkeletonBar height="0.68rem" width="65%" />
        <SkeletonBar height="0.62rem" width="50%" />
        <div style={{ flex: 1 }} />
        {isAuthenticated && <SkeletonBar height={30} width="100%" />}
      </div>
    </div>
  );
}

function SkeletonBar({ height, width }: { height: number | string; width: number | string }) {
  return (
    <div
      className="skeleton"
      style={{
        height,
        width,
        borderRadius: 6,
      }}
    />
  );
}
