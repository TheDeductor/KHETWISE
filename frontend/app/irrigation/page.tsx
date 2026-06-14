"use client";

import { useEffect, useState } from "react";
import IrrigationSchedule from "@/components/IrrigationSchedule";
import { getIrrigation, type IrrigationData } from "@/services/api";
import { mockIrrigation } from "@/services/mock";
import { useLanguage, t } from "@/lib/i18n";
import GlossaryTooltip from "@/components/GlossaryTooltip";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";

export default function IrrigationPage() {
  const lang = useLanguage();
  const [data, setData] = useState<IrrigationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

  useEffect(() => {
    async function load() {
      try {
        const res = await getIrrigation(fieldId);
        setData(res);
      } catch {
        setData(mockIrrigation);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fieldId]);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
        <div>
          <div className="skeleton" style={{ height: 24, width: "50%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "70%" }} />
        </div>
        <div className="skeleton" style={{ height: 100 }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80 }} />
          ))}
        </div>
      </div>
    );
  }

  const shouldIrrigate = !data.recommendation.toLowerCase().includes("do not");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ paddingTop: 4 }}>
        <h1 className="page-title">{t(lang, "irr_title")}</h1>
        <p className="page-subtitle">
          {t(lang, "irr_subtitle")}
        </p>
      </div>

      {/* Recommendation banner */}
      <div
        className="card-elevated animate-slide-up"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          borderLeft: `4px solid ${shouldIrrigate ? "var(--info)" : "var(--success)"}`,
          borderRadius: `0 var(--radius-lg) var(--radius-lg) 0`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: shouldIrrigate ? "var(--info-bg)" : "var(--success-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {shouldIrrigate ? "💧" : "✅"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            {data.recommendation}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {data.reason}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        <StatCard label={t(lang, "water_saved")} value={`${(data.water_saved_liters / 1000).toFixed(1)}K L`} sub={t(lang, "this_week")} emoji="💧" />
        <StatCard label={t(lang, "cost_saved")} value={`₹${data.money_saved_inr}`} sub={t(lang, "pump_power")} emoji="⚡" />
        <StatCard
          label={t(lang, "today_et")}
          value={`${data.et0} mm`}
          sub={t(lang, "evapotrans")}
          emoji="🌡"
          glossaryTerm="ET₀"
        />
        <StatCard label={t(lang, "rain_today")} value={`${data.rain_expected_mm} mm`} sub={t(lang, "expected")} emoji="🌧" />
      </div>

      {/* 7-day schedule */}
      <div className="animate-slide-up" style={{ animationDelay: "120ms" }}>
        <p className="section-label" style={{ marginBottom: 10 }}>{t(lang, "seven_day_schedule")}</p>
        <IrrigationSchedule schedule={data.schedule} />
      </div>

      {/* How it works */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
        className="animate-slide-up"
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          {t(lang, "how_it_works")}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {t(lang, "irr_formula")}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  emoji,
  glossaryTerm,
}: {
  label: string;
  value: string;
  sub: string;
  emoji: string;
  glossaryTerm?: string;
}) {
  return (
    <div
      className="stat-card animate-slide-up"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span className="section-label">
          {glossaryTerm ? <GlossaryTooltip term={glossaryTerm}>{label}</GlossaryTooltip> : label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}
