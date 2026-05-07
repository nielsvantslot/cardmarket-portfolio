"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PortfolioSnapshotPoint } from '@/lib/types';

interface PortfolioHistoryChartProps {
  snapshots: PortfolioSnapshotPoint[];
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PortfolioHistoryChart({ snapshots }: PortfolioHistoryChartProps) {
  if (snapshots.length < 2) {
    return (
      <div style={{
        border: "1px dashed var(--border)",
        borderRadius: 12,
        padding: "1rem",
        color: "var(--text-3)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.76rem",
      }}>
        Value history will appear after multiple snapshots are recorded.
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 12,
      background: "var(--bg-2)",
      padding: "0.8rem 0.6rem 0.25rem",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        color: "var(--text-3)",
        textTransform: "uppercase",
        marginBottom: "0.5rem",
        paddingLeft: "0.35rem",
      }}>
        Portfolio Value History
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={snapshots} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="createdAt"
              tickFormatter={formatDateLabel}
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
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value) => {
                const numeric = typeof value === "number" ? value : Number(value ?? 0);
                return [numeric.toFixed(2), "Value"];
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-3)",
                color: "var(--text)",
              }}
            />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke="var(--green)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
