"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerField } from "@/services/api";

export const dynamic = "force-dynamic";

const CROPS = ["Cotton", "Tomato", "Wheat", "Rice", "Maize"];

export default function FieldPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    user_name: "",
    crop: "Cotton",
    latitude: "22.564",
    longitude: "72.928",
    area_acres: "2.5",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await registerField({
        user_name: form.user_name,
        crop: form.crop,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        area_acres: parseFloat(form.area_acres),
      });
      // Persist to localStorage for other pages
      localStorage.setItem("field_id", res.field_id);
      localStorage.setItem("field_crop", form.crop);
      localStorage.setItem("field_area", form.area_acres);
      setSuccess(`Field registered! ID: ${res.field_id}`);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError(
        "Could not register field. Make sure the backend is running, then try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Register Your Field</h1>
        <p className="page-subtitle">
          Set up your field once — all features use these coordinates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Name */}
        <FormField label="Your Name">
          <input
            className="input"
            placeholder="Ramesh Patel"
            value={form.user_name}
            onChange={(e) => update("user_name", e.target.value)}
            required
          />
        </FormField>

        {/* Crop */}
        <FormField label="Crop">
          <div className="flex gap-2 flex-wrap">
            {CROPS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => update("crop", c)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors duration-150 ${
                  form.crop === c
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                    : "bg-white text-[#737373] border-[#E5E5E5] hover:border-[#D4D4D4] hover:text-[#0A0A0A]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </FormField>

        {/* Lat / Lon */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude">
            <input
              className="input font-mono"
              type="number"
              step="0.001"
              placeholder="22.564"
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Longitude">
            <input
              className="input font-mono"
              type="number"
              step="0.001"
              placeholder="72.928"
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              required
            />
          </FormField>
        </div>

        {/* Area */}
        <FormField label="Field Area (acres)">
          <input
            className="input font-mono"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="2.5"
            value={form.area_acres}
            onChange={(e) => update("area_acres", e.target.value)}
            required
          />
        </FormField>

        {error && (
          <div className="alert-banner text-sm">
            <span>⚠</span>
            <p className="text-[#0A0A0A]">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-[#F0FDF4] border border-[#22C55E] rounded-lg text-sm text-[#16A34A] font-medium">
            {success} — Redirecting to dashboard…
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
          id="register-field-btn"
        >
          {loading ? "Registering…" : "Register Field"}
        </button>
      </form>

      {/* Location hint */}
      <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
        <p className="text-xs text-[#737373] leading-relaxed">
          <span className="font-medium text-[#0A0A0A]">Finding your coordinates: </span>
          Open Google Maps → long-press your field → the lat/lon appears at the top.
          Default is set to Anand, Gujarat for demo.
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
    <div className="space-y-1.5">
      <label className="section-label">{label}</label>
      {children}
    </div>
  );
}
