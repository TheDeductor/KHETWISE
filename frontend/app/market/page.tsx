"use client";

import { useEffect, useState } from "react";
import { getMarket, type MarketData } from "@/services/api";
import { mockMarket } from "@/services/mock";
import { useLanguage, t } from "@/lib/i18n";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export const dynamic = "force-dynamic";

const CROPS = [
  { name: "Cotton",     emoji: "🌿" },
  { name: "Tomato",     emoji: "🍅" },
  { name: "Wheat",      emoji: "🌾" },
  { name: "Rice",       emoji: "🍚" },
  { name: "Maize",      emoji: "🌽" },
  { name: "Groundnut",  emoji: "🥜" },
  { name: "Soybean",    emoji: "🫘" },
  { name: "Sugarcane",  emoji: "🎋" },
];

export default function MarketPage() {
  const lang = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  const areaAcres =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_area") || "2.5")
      : 2.5;

  const storedCrop =
    typeof window !== "undefined"
      ? localStorage.getItem("field_crop") || "Cotton"
      : "Cotton";

  const activeCrop = selectedCrop || storedCrop;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMarket(activeCrop, areaAcres);
        setData(res);
      } catch {
        setData({ ...mockMarket, crop: activeCrop });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCrop, areaAcres]);

  const profitPct = data
    ? Math.round(((data.best_price - data.local_price) / data.local_price) * 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="page-title">{t(lang, "mkt_title")}</h1>
        <p className="page-subtitle">{t(lang, "mkt_subtitle")}</p>
      </div>

      {/* Crop selector */}
      <div className="animate-slide-up">
        <p className="section-label" style={{ marginBottom: 10 }}>{t(lang, "select_crop")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CROPS.map(({ name, emoji }) => (
            <button
              key={name}
              onClick={() => setSelectedCrop(name)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 999,
                border: `1.5px solid ${activeCrop === name ? "var(--accent)" : "var(--border)"}`,
                background: activeCrop === name ? "var(--accent)" : "var(--bg)",
                color: activeCrop === name ? "#fff" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 150ms ease",
                boxShadow: activeCrop === name ? "var(--shadow-accent)" : "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 100 }} />
        </div>
      )}

      {/* Data */}
      {data && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-slide-up">

          {/* Price comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Local */}
            <div className="card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>🏪</span>
                <p className="section-label">
                  <GlossaryTooltip term="Mandi">{t(lang, "local_mandi")}</GlossaryTooltip>
                </p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                {data.local_market}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                  ₹{data.local_price}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/kg</span>
              </div>
            </div>

            {/* Best */}
            <div
              className="card-elevated"
              style={{
                border: "2px solid var(--accent)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Best price badge */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderBottomLeftRadius: 8,
                  letterSpacing: "0.05em",
                }}
              >
                ⭐ BEST
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>🏆</span>
                <p className="section-label">{t(lang, "best_market")}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                {data.best_market}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, color: "var(--accent-hover)", lineHeight: 1 }}>
                  ₹{data.best_price}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/kg</span>
              </div>
            </div>
          </div>

          {/* ── MSP vs Market Price — Government Guarantee Banner ── */}
          {data.msp_per_kg && (
            <div
              className="card-elevated animate-slide-up"
              style={{
                border: `2px solid ${
                  data.msp_status === "below"
                    ? "#ef4444"
                    : data.msp_status === "great"
                    ? "#22c55e"
                    : "#f59e0b"
                }`,
                background: `${
                  data.msp_status === "below"
                    ? "rgba(239,68,68,0.06)"
                    : data.msp_status === "great"
                    ? "rgba(34,197,94,0.06)"
                    : "rgba(245,158,11,0.06)"
                }`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Govt badge */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background:
                    data.msp_status === "below"
                      ? "#ef4444"
                      : data.msp_status === "great"
                      ? "#22c55e"
                      : "#f59e0b",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderBottomLeftRadius: 8,
                  letterSpacing: "0.08em",
                }}
              >
                🏛 GOVT MSP 2026-27
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {data.msp_status === "below" ? "🚨" : data.msp_status === "great" ? "🎉" : "✅"}
                </span>
                <p className="section-label">
                  {data.msp_status === "below"
                    ? "Price BELOW Government MSP"
                    : data.msp_status === "great"
                    ? "Price Well Above MSP"
                    : "Price Above Government MSP"}
                </p>
              </div>

              {/* MSP vs Market comparison bar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Your Market Price</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: data.msp_status === "below" ? "#ef4444" : "var(--accent-hover)" }}>
                      ₹{data.local_price}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/kg</span>
                  </div>
                </div>
                <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Govt MSP Floor</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "#22c55e" }}>
                      ₹{data.msp_per_kg}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/kg</span>
                  </div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    ₹{data.msp_per_quintal}/quintal
                  </p>
                </div>
              </div>

              {/* Visual progress bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                  <span>₹0</span>
                  <span style={{ fontWeight: 600, color: data.msp_status === "below" ? "#ef4444" : "#22c55e" }}>
                    {data.msp_status === "below"
                      ? `₹${(data.msp_per_kg - data.local_price).toFixed(2)} below MSP`
                      : `+${data.msp_diff_pct}% above MSP`}
                  </span>
                  <span>₹{Math.max(data.msp_per_kg * 1.3, data.local_price * 1.2).toFixed(0)}</span>
                </div>
                <div style={{ height: 8, background: "var(--border)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
                  {/* MSP line marker */}
                  <div style={{
                    position: "absolute",
                    left: `${Math.min(90, (data.msp_per_kg / (data.msp_per_kg * 1.3)) * 100)}%`,
                    top: 0, bottom: 0, width: 2,
                    background: "#22c55e",
                    zIndex: 2,
                  }} />
                  {/* Market price fill */}
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, (data.local_price / (data.msp_per_kg * 1.3)) * 100)}%`,
                    background: data.msp_status === "below"
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : "linear-gradient(90deg, var(--accent), var(--accent-hover))",
                    borderRadius: 999,
                    transition: "width 800ms ease",
                  }} />
                </div>
              </div>

              {/* MSP action message */}
              <p style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: data.msp_status === "below" ? "#dc2626" : "var(--text-secondary)",
                fontWeight: data.msp_status === "below" ? 600 : 400,
              }}>
                {data.msp_message}
              </p>
            </div>
          )}

          {/* Market Intelligence */}

          <div className="card-elevated" style={{ background: "var(--surface)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🧠</span>
                <p className="section-label">Market Intelligence</p>
              </div>
              {data.best_time_to_sell && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: `var(--${data.sell_badge_color}-bg, #e6f4ea)`,
                    color: `var(--${data.sell_badge_color}, #137333)`,
                    border: `1px solid var(--${data.sell_badge_color}-border, #ceead6)`,
                  }}
                >
                  {data.best_time_to_sell}
                </span>
              )}
            </div>

            {/* Sparkline Chart */}
            {data.price_trend && data.price_trend.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Price Trend (Last 7 Days)</p>
                <div style={{ height: 80, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.price_trend.map((p, i) => ({ day: i, price: p }))}>
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--accent)" }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Transport Cost Estimator */}
            {data.mandi_distance_km && data.transport_cost_inr && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                <div style={{ background: "var(--bg)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Mandi Distance</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{data.mandi_distance_km} km</p>
                </div>
                <div style={{ background: "var(--bg)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Est. Transport Cost</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>₹{data.transport_cost_inr.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Profit callout */}
          <div
            className="card-elevated"
            style={{ background: "var(--surface)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📈</span>
                <p className="section-label">{t(lang, "extra_income")}</p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "var(--success-bg)",
                  color: "var(--success)",
                  border: "1px solid var(--success-border)",
                }}
              >
                +{profitPct}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 700, color: "var(--accent-hover)", lineHeight: 1 }}>
                ₹{data.total_extra_income.toLocaleString("en-IN")}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
              {data.recommendation}
            </p>

            {/* Breakdown bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <span>+₹{data.profit_increase}/kg</span>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: "var(--border)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, profitPct * 3)}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
                    borderRadius: 999,
                    transition: "width 700ms ease",
                  }}
                />
              </div>
              <span>per kg premium</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            ⚠ {t(lang, "mkt_disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
