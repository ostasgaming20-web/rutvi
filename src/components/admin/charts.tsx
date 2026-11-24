"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = ["#0d1f3c", "#c3a068", "#1b3358", "#8a857a", "#e3cfa6", "#4f6b8f"];

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid rgba(16,18,22,0.08)",
  fontSize: 11,
  boxShadow: "0 12px 30px -18px rgba(16,18,22,0.5)",
};

export function AreaTrend({
  data,
  xKey = "day",
  series,
  height = 240,
}: {
  data: Record<string, unknown>[];
  xKey?: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            {series.map((item, index) => (
              <linearGradient key={item.key} id={`grad-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color ?? PALETTE[index]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={item.color ?? PALETTE[index]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,22,0.06)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatDay}
            tick={{ fontSize: 10, fill: "#8b919d" }}
            axisLine={false}
            tickLine={false}
            minTickGap={18}
          />
          <YAxis tick={{ fontSize: 10, fill: "#8b919d" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(label) => formatDay(String(label))} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
          {series.map((item, index) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color ?? PALETTE[index]}
              strokeWidth={2}
              fill={`url(#grad-${item.key})`}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarTrend({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,18,22,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#8b919d" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8b919d" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
          {series.map((item, index) => (
            <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color ?? PALETTE[index]} radius={[4, 4, 0, 0]} maxBarSize={26} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({
  data,
  nameKey,
  valueKey,
  height = 220,
}: {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
            {data.map((_, index) => (
              <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={7} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniBars({ data, valueKey }: { data: Record<string, unknown>[]; valueKey: string }) {
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey={valueKey} fill="#0d1f3c" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
