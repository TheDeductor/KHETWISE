"use client";

import { useEffect, useState } from "react";
import loadDynamic from "next/dynamic";
import { getOutbreaks, type OutbreaksData, type OutbreakPoint } from "@/services/api";
import { mockOutbreaks } from "@/services/mock";
import { useLanguage, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// Dynamically import the map — no SSR
const OutbreakMap = loadDynamic(() => import("@/components/OutbreakMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: 420,
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🗺</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading map…</p>
      </div>
    </div>
  ),
});

const DOT_LEGEND = [
  { bg: "var(--danger)",  label: "Last 7 days",    desc: "High risk",      dotBg: "#DC2626" },
  { bg: "var(--accent)",  label: "8–14 days ago",   desc: "Monitor closely", dotBg: "#D97706" },
  { bg: "var(--success)", label: "15–30 days ago",  desc: "Awareness",      dotBg: "#15803D" },
];

const RISK_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  red:    { label: "High",   bg: "var(--danger-bg)",  text: "var(--danger)",  border: "var(--danger-border)"  },
  yellow: { label: "Medium", bg: "var(--warning-bg)", text: "var(--warning)", border: "var(--warning-border)" },
  green:  { label: "Low",    bg: "var(--success-bg)", text: "var(--success)", border: "var(--success-border)" },
};

export default function OutbreaksPage() {
  const lang = useLanguage();
  const [data, setData] = useState<OutbreaksData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [diseaseFilter, setDiseaseFilter] = useState("All");
  const [distanceFilter, setDistanceFilter] = useState(500); // 500 = any distance
  const [recencyFilter, setRecencyFilter] = useState(30); // 30 = any time

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);


  const lat =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_lat") || "22.564")
      : 22.564;
  const lon =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_lon") || "72.928")
      : 72.928;

  useEffect(() => {
    async function load() {
      try {
        const res = await getOutbreaks(lat, lon, 100);
        setData(res);
      } catch {
        setData(mockOutbreaks);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lat, lon]);

  const uniqueDiseases = ["All", ...Array.from(new Set(data?.outbreaks.map(o => o.disease) || []))];

  const filteredOutbreaks = data?.outbreaks.filter((o) => {
    if (diseaseFilter !== "All" && o.disease !== diseaseFilter) return false;
    if (o.distance_km > distanceFilter) return false;
    if (o.days_ago > recencyFilter) return false;
    return true;
  }) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="page-title">{t(lang, "outbreak_title")}</h1>
        <p className="page-subtitle">
          {t(lang, "outbreak_subtitle")}
        </p>
      </div>

      {/* Alert banner */}
      {data?.alert && data.alert_message && (
        <div className="alert-banner-danger animate-slide-up">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
              Nearby Outbreak Alert
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {data.alert_message}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      {loading ? (
        <div
          style={{
            width: "100%",
            height: 420,
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Fetching outbreak data…</p>
          </div>
        </div>
      ) : (
        data && (
          <OutbreakMap
            outbreaks={data.outbreaks}
            centerLat={lat}
            centerLon={lon}
          />
        )
      )}

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {DOT_LEGEND.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: l.dotBg,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{l.label}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>— {l.desc}</span>
          </div>
        ))}
      </div>

      {/* Outbreak list / Feed */}
      {data && data.outbreaks.length > 0 && (
        <div className="animate-slide-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 0 }}>{t(lang, "reported_outbreaks") || "Reported Outbreaks"}</p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <select value={diseaseFilter} onChange={e => setDiseaseFilter(e.target.value)} className="input" style={{ flex: 1, minWidth: 120 }}>
              {uniqueDiseases.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={distanceFilter} onChange={e => setDistanceFilter(Number(e.target.value))} className="input" style={{ flex: 1, minWidth: 120 }}>
              <option value={500}>Any Distance</option>
              <option value={10}>&lt; 10 km</option>
              <option value={20}>&lt; 20 km</option>
              <option value={50}>&lt; 50 km</option>
            </select>
            <select value={recencyFilter} onChange={e => setRecencyFilter(Number(e.target.value))} className="input" style={{ flex: 1, minWidth: 120 }}>
              <option value={30}>Any Time (30d)</option>
              <option value={7}>&lt; 7 days</option>
              <option value={14}>&lt; 14 days</option>
            </select>
          </div>

          {/* Card List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filteredOutbreaks.map((o: OutbreakPoint, i: number) => {
              const risk = RISK_CONFIG[o.color] ?? RISK_CONFIG.green;
              return (
                <div key={i} className="card-elevated" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: risk.text, display: "inline-block" }} />
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{o.disease}</h3>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: risk.bg, color: risk.text, border: `1px solid ${risk.border}` }}>
                      {risk.label} Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 14 }}>📍</span> {o.distance_km} km away
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {o.days_ago} days ago
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredOutbreaks.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", gridColumn: "1 / -1", padding: 20 }}>
                No outbreaks match your filters.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data && data.outbreaks.length === 0 && !loading && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            {t(lang, "no_outbreaks") || "No outbreaks reported nearby"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {t(lang, "no_outbreaks_sub") || "Your area looks clear in the last 30 days"}
          </p>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={() => setShowReportModal(true)}
        style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 9998,
          width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", color: "#fff",
          boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          border: "none", cursor: "pointer"
        }}
        title="Report an Outbreak"
      >
        +
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div className="animate-slide-up" style={{ width: "100%", maxWidth: 600, background: "var(--bg)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Report a Problem</h2>
              <button onClick={() => setShowReportModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-secondary)" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="section-label">Disease / Pest Name</label>
                <input type="text" placeholder="e.g. Fall Armyworm" className="input" style={{ width: "100%" }} />
              </div>
              <div>
                <label className="section-label">Photo (Optional)</label>
                <div style={{ width: "100%", height: 80, border: "2px dashed var(--border-strong)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }}>
                  📷 Tap to upload photo
                </div>
              </div>
              <div>
                 <label className="section-label">Location</label>
                 <div style={{ display: "flex", gap: 8 }}>
                   <button className="btn-secondary" style={{ flex: 1 }}>📍 Use Current GPS</button>
                 </div>
              </div>
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => { alert("Report submitted successfully!"); setShowReportModal(false); }}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
