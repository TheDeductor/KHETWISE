"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { NdviPoint } from "@/services/api";
import { t } from "@/lib/i18n";

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
  const val = payload[0].value;
  const color = val >= 0.65 ? "var(--success)" : val >= 0.5 ? "var(--warning)" : "var(--danger)";
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 700, color }}>
        NDVI {val.toFixed(2)}
      </p>
    </div>
  );
}

export default function NDVIChart({ history, lang = "en" }: { history: NdviPoint[]; lang?: string }) {
  const latest = history[history.length - 1]?.ndvi ?? 0;
  const prev = history[history.length - 2]?.ndvi ?? latest;
  const delta = latest - prev;
  const trend = delta > 0.01 ? "↑" : delta < -0.01 ? "↓" : "→";
  const trendColor = delta > 0.01 ? "var(--success)" : delta < -0.01 ? "var(--danger)" : "var(--text-muted)";

  const min = Math.max(0, Math.min(...history.map((h) => h.ndvi)) - 0.08);
  const max = Math.min(1, Math.max(...history.map((h) => h.ndvi)) + 0.08);

  return (
    <div className="card-elevated animate-slide-up" style={{ animationDelay: "60ms" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>
            {t(lang, "ndvi_trend")}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", lineHeight: 1 }}>
              {latest.toFixed(2)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: trendColor }}>{trend}</span>
          </div>
        </div>
        <span
          style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
            background: "var(--surface-2)", color: "var(--accent-hover)", border: "1px solid #FDE68A",
          }}
        >
          {t(lang, "ndvi_7day")}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#D97706" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />

          {/* Stress threshold */}
          <ReferenceLine
            y={0.62}
            stroke="var(--border-strong)"
            strokeDasharray="4 4"
            label={{ value: t(lang, "stress_line"), position: "insideTopRight", fontSize: 9, fill: "var(--text-muted)" }}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(2)}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="ndvi"
            stroke="#D97706"
            strokeWidth={2.5}
            fill="url(#ndviGradient)"
            dot={{ r: 3, fill: "#D97706", stroke: "var(--bg)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#D97706", stroke: "var(--bg)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
