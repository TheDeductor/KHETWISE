"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import type { NdviPoint } from "@/services/api";

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="text-sm font-mono font-medium text-[#0A0A0A]">
        NDVI {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export default function NDVIChart({ history }: { history: NdviPoint[] }) {
  const min = Math.min(...history.map((h) => h.ndvi)) - 0.05;
  const max = Math.max(...history.map((h) => h.ndvi)) + 0.05;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#0A0A0A]">NDVI Trend</span>
        <span className="text-xs text-[#A3A3A3] font-mono">7-day</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke="#F5F5F5" vertical={false} />

          {/* Stress threshold reference line */}
          <ReferenceLine
            y={0.62}
            stroke="#E5E5E5"
            strokeDasharray="4 4"
            label={{
              value: "Stress",
              position: "insideTopRight",
              fontSize: 10,
              fill: "#A3A3A3",
              fontFamily: "monospace",
            }}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#A3A3A3", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[Math.max(0, min), Math.min(1, max)]}
            tick={{ fontSize: 11, fill: "#A3A3A3", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(2)}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="ndvi"
            stroke="#FF5722"
            strokeWidth={2}
            dot={<Dot r={4} fill="#FF5722" stroke="#ffffff" strokeWidth={2} />}
            activeDot={{ r: 5, fill: "#FF5722", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
