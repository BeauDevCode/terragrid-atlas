"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fuelColors, type GenerationMix } from "@/lib/data";

const tooltipStyle = {
  background: "rgba(4, 12, 22, 0.94)",
  border: "1px solid rgba(125, 211, 252, 0.25)",
  borderRadius: 8,
  color: "#e2e8f0"
};

export function GenerationMixChart({
  data,
  variant = "donut"
}: {
  data: GenerationMix[];
  variant?: "donut" | "bar";
}) {
  if (variant === "bar") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="fuelType" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.08)" }} />
          <Bar dataKey="capacityMW" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.fuelType} fill={fuelColors[entry.fuelType]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="share"
            nameKey="fuelType"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="rgba(2, 6, 23, 0.9)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.fuelType} fill={fuelColors[entry.fuelType]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Share"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col justify-center gap-2">
        {data.map((entry) => (
          <div key={entry.fuelType} className="flex items-center justify-between gap-3 rounded-md bg-slate-900/55 px-3 py-2">
            <span className="flex items-center gap-2 text-sm capitalize text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fuelColors[entry.fuelType] }} />
              {entry.fuelType}
            </span>
            <span className="text-sm font-medium text-slate-50">{entry.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadTimeSeriesChart({
  data,
  unit = "GW"
}: {
  data: Array<{ timestamp: string; value: number }>;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 12, right: 12, bottom: 10, left: 0 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="timestamp" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} ${unit}`, "Load"]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#22d3ee"
          strokeWidth={3}
          dot={{ r: 3, strokeWidth: 2, fill: "#061019" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
