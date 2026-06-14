"use client";

import type { HealthData } from "@/services/api";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import { t } from "@/lib/i18n";


const STATUS_CONFIG: Record<
  string,
  { key: string; bg: string; text: string; dotBg: string; emoji: string }
> = {
  Healthy:  { key: "status_healthy",  bg: "var(--success-bg)",  text: "var(--success)",  dotBg: "#22C55E", emoji: "🌱" },
  Stressed: { key: "status_stressed", bg: "var(--warning-bg)",  text: "var(--warning)",  dotBg: "#F97316", emoji: "⚠️" },
  "At Risk":{ key: "status_at_risk",  bg: "var(--danger-bg)",   text: "var(--danger)",   dotBg: "#EF4444", emoji: "🚨" },
};

export default function HealthCard({
  data,
  crop,
  areaAcres,
  lang = "en",
}: {
  data: HealthData;
  crop?: string;
  areaAcres?: number;
  lang?: string;
}) {
  const cfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG["At Risk"];
  const statusLabel = t(lang, cfg.key);

  // Compute score ring stroke
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const fill = (data.health_score / 100) * circ;

  return (
    <div className="card-elevated animate-slide-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 2 }}>
            <GlossaryTooltip term="Health Score">{t(lang, "crop_health")}</GlossaryTooltip>
          </p>
          {crop && (
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {crop} {areaAcres ? `· ${areaAcres} ac` : ""}
            </p>
          )}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
            background: cfg.bg,
            color: cfg.text,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dotBg, display: "inline-block" }} />
          {statusLabel}
        </span>
      </div>

      {/* Score ring + number */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle
              cx={48} cy={48} r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={8}
            />
            {/* Fill */}
            <circle
              cx={48} cy={48} r={radius}
              fill="none"
              stroke={cfg.dotBg}
              strokeWidth={8}
              strokeDasharray={`${fill} ${circ}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
          </svg>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", lineHeight: 1 }}>
              {data.health_score}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/100</span>
          </div>
        </div>

        {/* Data rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <DataRow label={t(lang, "ndvi_label")} value={data.ndvi.toFixed(2)} glossaryTerm="NDVI" />
          <DataRow label={t(lang, "status_label")} value={`${cfg.emoji} ${statusLabel}`} />
          {data.stress_reason && (
            <DataRow label={t(lang, "issue_label")} value={data.stress_reason} valueColor="var(--danger)" />
          )}
        </div>
      </div>

      {/* Bottom divider line */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 0 14px" }} />
      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {t(lang, "health_updated")}
      </p>
    </div>
  );
}

function DataRow({
  label,
  value,
  valueColor = "var(--text-primary)",
  glossaryTerm,
}: {
  label: string;
  value: string;
  valueColor?: string;
  glossaryTerm?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", flexShrink: 0 }}>
        {glossaryTerm ? <GlossaryTooltip term={glossaryTerm}>{label}</GlossaryTooltip> : label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor, fontFamily: label === "NDVI" ? "var(--font-mono)" : "inherit", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
