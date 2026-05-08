"use client";

import {
  useMemo,
  useState,
} from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ResponsiveRangeSelector,
} from '@/components/ui/ResponsiveRangeSelector';
import type { PortfolioSnapshotPoint } from '@/lib/types';

import styles from './PortfolioHistoryChart.module.css';

interface PortfolioHistoryChartProps {
  snapshots: PortfolioSnapshotPoint[];
}

type RangeKey = "day" | "week" | "month" | "threeMonths" | "sixMonths" | "year" | "all";

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string; days: number | null }> = [
  { key: "day", label: "1D", days: 1 },
  { key: "week", label: "1W", days: 7 },
  { key: "month", label: "1M", days: 30 },
  { key: "threeMonths", label: "3M", days: 90 },
  { key: "sixMonths", label: "6M", days: 180 },
  { key: "year", label: "1Y", days: 365 },
  { key: "all", label: "All", days: null },
];

function formatDateLabel(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PortfolioHistoryChart({ snapshots }: PortfolioHistoryChartProps) {
  const [range, setRange] = useState<RangeKey>("month");

  const filteredSnapshots = useMemo(() => {
    if (snapshots.length === 0) return [];

    const option = RANGE_OPTIONS.find((item) => item.key === range);
    if (!option || option.days == null) return snapshots;

    const latestDateMs = new Date(snapshots[snapshots.length - 1]?.createdAt ?? Date.now()).getTime();
    const cutoffMs = latestDateMs - (option.days * 24 * 60 * 60 * 1000);

    const firstVisibleIndex = snapshots.findIndex((item) => new Date(item.createdAt).getTime() >= cutoffMs);
    if (firstVisibleIndex <= 0) return snapshots;

    // Include one point just before the cutoff so the trend line remains continuous at range start.
    return snapshots.slice(firstVisibleIndex - 1);
  }, [range, snapshots]);

  if (snapshots.length < 2) {
    return (
      <div className={styles.emptyState}>
        Value history will appear after multiple snapshots are recorded.
      </div>
    );
  }

  return (
    <div className={styles.chartShell}>
      <div className={styles.headerRow}>
        <div className={styles.title}>Portfolio Value History</div>
        <div className={styles.unitPill}>€</div>
      </div>

      <ResponsiveRangeSelector
        label="Range"
        value={range}
        options={RANGE_OPTIONS}
        onChange={setRange}
        desktopAriaLabel="History range"
        mobileDialogTitle="History Range"
        mobileButtonAriaLabel="Open value history range selector"
      />

      <div className={styles.chartFrame}>
        <ResponsiveContainer>
          <LineChart accessibilityLayer={false} data={filteredSnapshots} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="createdAt"
              tickFormatter={formatDateLabel}
              minTickGap={22}
              tick={{ fill: "#97a0b6", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#97a0b6", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              width={44}
            />
            <Tooltip
              allowEscapeViewBox={{ x: false, y: false }}
              reverseDirection={{ x: true, y: false }}
              cursor={false}
              wrapperStyle={{
                maxWidth: "min(78vw, 260px)",
                pointerEvents: "none",
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }}
              formatter={(value) => {
                const numeric = typeof value === "number" ? value : Number(value ?? 0);
                return [`€${numeric.toFixed(2)}`, "Value"];
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-3)",
                color: "var(--text)",
                maxWidth: "min(78vw, 260px)",
                whiteSpace: "normal",
              }}
            />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke="var(--green)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--green)",
                stroke: "var(--green)",
                strokeWidth: 1,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
