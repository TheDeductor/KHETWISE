"use client";

import { useEffect, useState } from "react";
import HealthCard from "@/components/HealthCard";
import NDVIChart from "@/components/NDVIChart";
import StressAlert from "@/components/StressAlert";
import VoiceBox from "@/components/VoiceBox";
import { getHealth, getNdviHistory, type HealthData, type NdviPoint } from "@/services/api";
import { mockHealth, mockNdviHistory } from "@/services/mock";
import Link from "next/link";
import { useLanguage, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";

// ── Quick action config ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/disease",
    labelKey: "qa_disease",
    descKey: "qa_disease_desc",
    emoji: "🔬",
    bg: "#FEF3C7",
    border: "#FDE68A",
    primary: true,
  },
  {
    href: "/irrigation",
    labelKey: "qa_water",
    descKey: "qa_water_desc",
    emoji: "💧",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    primary: false,
  },
  {
    href: "/market",
    labelKey: "qa_market",
    descKey: "qa_market_desc",
    emoji: "📊",
    bg: "#F0FDF4",
    border: "#86EFAC",
    primary: false,
  },
  {
    href: "/outbreaks",
    labelKey: "qa_outbreaks",
    descKey: "qa_outbreaks_desc",
    emoji: "🗺",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    primary: false,
  },
];

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card-elevated" style={{ minHeight: 200 }}>
      <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 60, width: "60%", marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 10, width: "80%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 10, width: "60%" }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<NdviPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [greetingKey, setGreetingKey] = useState("greeting_morning");
  const lang = useLanguage();

  // Greeting based on time of day (client-side only)
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreetingKey("greeting_morning");
    else if (h < 17) setGreetingKey("greeting_afternoon");
    else setGreetingKey("greeting_evening");
  }, []);

  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("user_name") || "Farmer"
      : "Farmer";

  const crop =
    typeof window !== "undefined"
      ? localStorage.getItem("field_crop") || "Cotton"
      : "Cotton";

  const areaAcres =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_area") || "2.5")
      : 2.5;

  useEffect(() => {
    async function load() {
      try {
        const [h, n] = await Promise.all([
          getHealth(fieldId),
          getNdviHistory(fieldId),
        ]);
        setHealth(h);
        setHistory(n.history);
      } catch {
        setHealth(mockHealth);
        setHistory(mockNdviHistory.history);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fieldId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ paddingTop: 4 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginBottom: 2 }}>
          {t(lang, greetingKey)} 👋
        </p>
        <h1 className="page-title">
          {t(lang, "dash_title", { name: userName })}
        </h1>
        <p className="page-subtitle">
          {crop} · {areaAcres} {t(lang, "acres")} · {t(lang, "dash_subtitle")}
        </p>
      </div>

      {/* ── Stress alert ─────────────────────────────────────────────────────── */}
      {health?.stress_detected && (
        <StressAlert show={health.stress_detected} reason={health.stress_reason} lang={lang} />
      )}

      {/* ── Health + NDVI charts ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {health && (
              <HealthCard data={health} crop={crop} areaAcres={areaAcres} lang={lang} />
            )}
            {history.length > 0 && <NDVIChart history={history} lang={lang} />}
          </>
        )}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────────── */}
      <div>
        <p className="section-label" style={{ marginBottom: 10 }}>{t(lang, "quick_actions")}</p>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children"
          style={{ gridAutoRows: "1fr" }}
        >
          {QUICK_ACTIONS.map(({ href, labelKey, descKey, emoji, bg, border, primary }) => (
            <Link
              key={href}
              href={href}
              className="animate-slide-up"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "16px",
                background: "var(--bg)",
                border: `1.5px solid ${primary ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                boxShadow: primary ? "var(--shadow-accent)" : "var(--shadow-xs)",
                textDecoration: "none",
                color: "var(--text-primary)",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = primary ? "var(--shadow-accent)" : "var(--shadow-xs)";
                (e.currentTarget as HTMLElement).style.borderColor = primary ? "var(--accent)" : "var(--border)";
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: bg,
                  border: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {emoji}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                  {t(lang, labelKey)}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{t(lang, descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────────── */}
      <div className="divider" />

      {/* ── Voice assistant ───────────────────────────────────────────────────── */}
      <VoiceBox language={lang} />
    </div>
  );
}
