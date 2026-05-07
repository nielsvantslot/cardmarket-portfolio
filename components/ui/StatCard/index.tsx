import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "1.25rem 1.5rem",
    }}>
      <div className={styles.label} style={{ marginBottom: "0.4rem" }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.75rem",
        fontWeight: 800,
        fontFamily: "var(--font-display)",
        letterSpacing: "-0.04em",
        color: accent ? "var(--green)" : "var(--text)",
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
}
