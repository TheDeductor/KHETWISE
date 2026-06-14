"use client";

import { useState, useRef } from "react";
import { predictDisease, type DiseaseResult } from "@/services/api";
import { useLanguage, t } from "@/lib/i18n";
import GlossaryTooltip from "@/components/GlossaryTooltip";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";
const CROPS = ["Cotton", "Tomato", "Wheat", "Rice", "Maize", "Groundnut", "Sugarcane", "Soybean"];

const BUY_LINKS = [
  {
    name: "DeHaat",
    url: "https://app.dehaat.com",
    desc: "Order online — 24hr delivery",
    logoBg: "#15803D",
    emoji: "🌿",
  },
  {
    name: "BigHaat",
    url: "https://www.bighaat.com",
    desc: "Compare prices across brands",
    logoBg: "#D97706",
    emoji: "🛒",
  },
];

export default function DiseasePage() {
  const lang = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read crop from onboarding data if available
  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

  const storedCrop =
    typeof window !== "undefined"
      ? localStorage.getItem("field_crop") || "Cotton"
      : "Cotton";

  // If no crop selected yet, default to stored
  const activeCrop = selectedCrop || storedCrop;

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictDisease(file, fieldId, activeCrop);
      setResult(res);
    } catch {
      setError("Analysis failed. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const isHealthy = result?.disease?.toLowerCase() === "healthy";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="page-title">{t(lang, "disease_title")}</h1>
        <p className="page-subtitle">
          {t(lang, "disease_subtitle")}
        </p>
      </div>

      {/* Crop selector */}
      <div className="animate-slide-up">
        <p className="section-label" style={{ marginBottom: 10 }}>{t(lang, "select_crop")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CROPS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className="option-pill"
              style={{
                background: activeCrop === c ? "var(--accent)" : "var(--bg)",
                borderColor: activeCrop === c ? "var(--accent)" : "var(--border)",
                color: activeCrop === c ? "#fff" : "var(--text-secondary)",
                boxShadow: activeCrop === c ? "var(--shadow-accent)" : "none",
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className="animate-slide-up"
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: "var(--radius-lg)",
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--accent-light)" : "var(--surface)",
          transition: "all 200ms ease",
          animationDelay: "60ms",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onInputChange}
        />
        {preview ? (
          <img
            src={preview}
            alt="Leaf preview"
            style={{ maxHeight: 200, borderRadius: 12, objectFit: "contain", margin: "0 auto", display: "block" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "var(--accent-light)",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              🌿
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {t(lang, "drop_photo")}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {t(lang, "tap_browse")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analyze button */}
      {preview && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary"
            id="analyze-btn"
            style={{ flex: 1 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "spin-slow 0.8s linear infinite",
                  }}
                />
                {t(lang, "analyzing")}
              </span>
            ) : (
              t(lang, "analyze_btn")
            )}
          </button>
          <button
            onClick={() => { setFile(null); setPreview(null); setResult(null); }}
            className="btn-secondary"
          >
            {t(lang, "clear_btn")}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert-banner-danger animate-slide-up">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{error}</p>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-slide-up">
          <div className="card-elevated">
            {/* Status badge + name */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 4 }}>{t(lang, "diagnosis")}</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                  <GlossaryTooltip term={result.disease}>{result.disease}</GlossaryTooltip>
                </h2>
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
                  background: isHealthy ? "var(--success-bg)" : "var(--danger-bg)",
                  color: isHealthy ? "var(--success)" : "var(--danger)",
                  border: `1px solid ${isHealthy ? "var(--success-border)" : "var(--danger-border)"}`,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isHealthy ? "var(--success)" : "var(--danger)",
                    display: "inline-block",
                  }}
                />
                {isHealthy ? "Healthy" : "Disease Detected"}
              </span>
            </div>

            {/* Confidence bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="section-label">
                  <GlossaryTooltip term="Confidence">{t(lang, "ai_confidence" ) || "AI Confidence"}</GlossaryTooltip>
                </span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {result.confidence}%
                </span>
              </div>
              <div className="confidence-bar-track">
                <div className="confidence-bar-fill" style={{ width: `${result.confidence}%` }} />
              </div>
            </div>

            <div className="divider" style={{ margin: "16px 0" }} />

            {/* Treatment */}
            {!isHealthy && (
              <div>
                <p className="section-label" style={{ marginBottom: 8 }}>{t(lang, "recommended_treatment")}</p>
                <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.65 }}>
                  {result.treatment}
                </p>
              </div>
            )}

            {isHealthy && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--success-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--success-border)" }}>
                <span style={{ fontSize: 20 }}>🌱</span>
                <p style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                  {t(lang, "healthy_msg")}
                </p>
              </div>
            )}
          </div>

          {/* Buy treatment */}
          {!isHealthy && (
            <div className="card-elevated">
              <p className="section-label" style={{ marginBottom: 12 }}>{t(lang, "where_to_buy")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {BUY_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: "var(--radius)",
                      border: "1.5px solid var(--border)",
                      background: "var(--bg)",
                      textDecoration: "none",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: link.logoBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {link.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{link.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{link.desc}</p>
                    </div>
                    <span style={{ fontSize: 16, color: "var(--text-muted)" }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
