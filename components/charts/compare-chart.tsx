"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const tooltipStyle = {
  background: "rgba(4, 12, 22, 0.94)",
  border: "1px solid rgba(125, 211, 252, 0.25)",
  borderRadius: 8,
  color: "#e2e8f0"
};

export function CompareChart({
  data,
  bars
}: {
  data: Array<Record<string, string | number>>;
  bars: Array<{ key: string; label: string; color: string }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 12, right: 16, bottom: 10, left: 0 }} barGap={6} barCategoryGap="26%">
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="country" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.08)" }} />
        <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={34}
            minPointSize={5}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
