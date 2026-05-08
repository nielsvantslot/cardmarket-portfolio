import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  const valueRef = useRef<HTMLDivElement | null>(null);
  const [autoFontSizePx, setAutoFontSizePx] = useState<number | null>(null);
  const [wrapFallback, setWrapFallback] = useState(false);

  useEffect(() => {
    const element = valueRef.current;
    if (!element) return;

    const MAX_SIZE_PX = window.matchMedia("(min-width: 901px)").matches ? 26 : 34;
    const MIN_SIZE_PX = 12;

    const fit = () => {
      const node = valueRef.current;
      if (!node) return;

      // Measure in single-line mode first; only allow wrapping if minimum readable size still overflows.
      node.style.whiteSpace = "nowrap";

      let low = MIN_SIZE_PX;
      let high = MAX_SIZE_PX;
      let best = MIN_SIZE_PX;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        node.style.fontSize = `${mid}px`;

        const fits = node.scrollWidth <= node.clientWidth + 1;
        if (fits) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      node.style.fontSize = `${best}px`;
      const stillOverflows = node.scrollWidth > node.clientWidth + 1;

      setAutoFontSizePx(best);
      setWrapFallback(stillOverflows);
    };

    fit();

    const resizeObserver = new ResizeObserver(() => fit());
    resizeObserver.observe(element);
    if (element.parentElement) resizeObserver.observe(element.parentElement);

    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      resizeObserver.disconnect();
    };
  }, [value]);

  return (
    <div className={styles.card}>
      <div className={styles.label} style={{ marginBottom: "0.6rem" }}>
        {label}
      </div>
      <div
        ref={valueRef}
        className={`${styles.value} ${wrapFallback ? styles.valueWrapFallback : ""}`}
        style={{
          color: accent ? "var(--green)" : "var(--text)",
          ...(autoFontSizePx ? { fontSize: `${autoFontSizePx}px` } : {}),
        }}
      >
        {value}
      </div>
    </div>
  );
}
