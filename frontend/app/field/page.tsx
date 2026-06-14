"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerField } from "@/services/api";
import { useLanguage, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SOIL_TYPES = ["Red", "Black Cotton", "Loamy", "Sandy", "Alluvial"];
const WATER_SOURCES = ["Borewell", "Canal", "Rainwater", "Drip Irrigation", "Tank/Pond"];
const CROPS = [
  "Cotton", "Tomato", "Wheat", "Rice", "Maize",
  "Groundnut", "Soybean", "Sugarcane", "Onion", "Potato",
];

export default function FieldPage() {
  const lang = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
    user_name:    "",
    crop:         "Cotton",
    latitude:     "22.564",
    longitude:    "72.928",
    area_acres:   "2.5",
    soil_type:    "Black Cotton",
    water_source: "Borewell",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await registerField({
        user_name:   form.user_name,
        crop:        form.crop,
        latitude:    parseFloat(form.latitude),
        longitude:   parseFloat(form.longitude),
        area_acres:  parseFloat(form.area_acres),
        soil_type:   form.soil_type,
        water_source: form.water_source,
      });
      localStorage.setItem("field_id",          res.field_id);
      localStorage.setItem("field_crop",         form.crop);
      localStorage.setItem("field_area",         form.area_acres);
      localStorage.setItem("field_lat",          form.latitude);
      localStorage.setItem("field_lon",          form.longitude);
      localStorage.setItem("user_name",          form.user_name);
      localStorage.setItem("soil_type",          form.soil_type);
      localStorage.setItem("water_source",       form.water_source);
      localStorage.setItem("onboarding_complete","true");
      router.push("/dashboard");
    } catch {
      setError("Could not save. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="page-title">{t(lang, "field_title")}</h1>
        <p className="page-subtitle">
          {t(lang, "field_subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Name */}
        <FormField label={t(lang, "field_your_name")}>
          <input
            className="input"
            placeholder={t(lang, "name_placeholder")}
            value={form.user_name}
            onChange={(e) => update("user_name", e.target.value)}
            required
          />
        </FormField>

        {/* Crop */}
        <FormField label={t(lang, "field_primary_crop")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CROPS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => update("crop", c)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1.5px solid ${form.crop === c ? "var(--accent)" : "var(--border)"}`,
                  background: form.crop === c ? "var(--accent)" : "var(--bg)",
                  color: form.crop === c ? "#fff" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </FormField>

        {/* Soil type */}
        <FormField label={t(lang, "field_soil_type")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SOIL_TYPES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => update("soil_type", s)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1.5px solid ${form.soil_type === s ? "var(--accent)" : "var(--border)"}`,
                  background: form.soil_type === s ? "var(--accent)" : "var(--bg)",
                  color: form.soil_type === s ? "#fff" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </FormField>

        {/* Water source */}
        <FormField label={t(lang, "field_water_source")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {WATER_SOURCES.map((w) => (
              <button
                type="button"
                key={w}
                onClick={() => update("water_source", w)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1.5px solid ${form.water_source === w ? "var(--accent)" : "var(--border)"}`,
                  background: form.water_source === w ? "var(--accent)" : "var(--bg)",
                  color: form.water_source === w ? "#fff" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </FormField>

        {/* Lat / Lon */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label={t(lang, "field_latitude")}>
            <input
              className="input"
              type="number"
              step="0.001"
              placeholder="22.564"
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              required
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </FormField>
          <FormField label={t(lang, "field_longitude")}>
            <input
              className="input"
              type="number"
              step="0.001"
              placeholder="72.928"
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              required
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </FormField>
        </div>

        {/* Area */}
        <FormField label={t(lang, "field_area")}>
          <input
            className="input"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="2.5"
            value={form.area_acres}
            onChange={(e) => update("area_acres", e.target.value)}
            required
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </FormField>

        {/* Error */}
        {error && (
          <div className="alert-banner-danger">
            <span>⚠️</span>
            <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          id="save-field-btn"
          style={{ width: "100%" }}
        >
          {loading ? t(lang, "field_saving") : t(lang, "field_save")}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            router.push("/onboarding");
          }}
          className="btn-secondary"
          style={{ width: "100%", color: "var(--danger)", borderColor: "var(--danger-border)", marginTop: 8 }}
        >
          Log out / Reset Onboarding
        </button>
      </form>

      {/* Location hint */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{t(lang, "field_coords_hint")} </span>
          {t(lang, "field_coords_body")}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label className="section-label">{label}</label>
      {children}
    </div>
  );
}
