"use client";

import { useState, useRef } from "react";
import { predictDisease, type DiseaseResult } from "@/services/api";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";
const CROPS = ["Cotton", "Tomato", "Wheat", "Rice", "Maize"];

const BUY_LINKS = [
  {
    name: "DeHaat",
    url: "https://app.dehaat.com",
    desc: "Order online — 24hr delivery in Gujarat",
    logo: "D",
    logoBg: "bg-[#16A34A]",
  },
  {
    name: "BigHaat",
    url: "https://www.bighaat.com",
    desc: "Compare prices across brands",
    logo: "B",
    logoBg: "bg-[#FF5722]",
  },
];

export default function DiseasePage() {
  const [selectedCrop, setSelectedCrop] = useState("Cotton");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

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
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictDisease(file, fieldId, selectedCrop);
      setResult(res);
    } catch {
      setError("Analysis failed. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const isHealthy = result?.disease?.toLowerCase() === "healthy";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="page-title">AI Disease Detection</h1>
        <p className="page-subtitle">Upload a leaf photo — Gemini Vision identifies the disease in seconds</p>
      </div>

      {/* Crop selector */}
      <div>
        <p className="section-label mb-2">Crop</p>
        <div className="flex gap-2 flex-wrap">
          {CROPS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors duration-150 ${
                selectedCrop === c
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-white text-[#737373] border-[#E5E5E5] hover:border-[#D4D4D4] hover:text-[#0A0A0A]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#D4D4D4] rounded-lg p-8 text-center cursor-pointer hover:border-[#FF5722] hover:bg-[#FFF3F0] transition-colors duration-150"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
        {preview ? (
          <img
            src={preview}
            alt="Leaf preview"
            className="mx-auto max-h-48 rounded-lg object-contain"
          />
        ) : (
          <div className="space-y-2">
            <p className="text-3xl">🌿</p>
            <p className="text-sm font-medium text-[#0A0A0A]">Drop a leaf image here</p>
            <p className="text-xs text-[#A3A3A3]">or click to browse — JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {preview && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-primary w-full"
          id="analyze-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyzing with Gemini…
            </span>
          ) : (
            "Analyze Disease"
          )}
        </button>
      )}

      {error && (
        <div className="alert-banner">
          <span>⚠</span>
          <p className="text-sm text-[#0A0A0A]">{error}</p>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="section-label">Diagnosis</p>
                <h2 className="text-xl font-semibold text-[#0A0A0A] mt-1">{result.disease}</h2>
              </div>
              <span
                className={`badge ${
                  isHealthy ? "badge-healthy" : "badge-alert"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHealthy ? "bg-[#22C55E]" : "bg-[#EF4444]"
                  }`}
                />
                {isHealthy ? "Healthy" : "Disease Detected"}
              </span>
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="section-label">Confidence</span>
                <span className="font-mono text-sm font-medium text-[#0A0A0A]">
                  {result.confidence}%
                </span>
              </div>
              <div className="confidence-bar-track">
                <div
                  className="confidence-bar-fill"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            <hr className="divider mb-4" />

            {/* Treatment */}
            {!isHealthy && (
              <div>
                <p className="section-label mb-2">Treatment</p>
                <p className="text-sm text-[#0A0A0A] leading-relaxed">{result.treatment}</p>
              </div>
            )}
          </div>

          {/* Where to buy — only for diseased crops */}
          {!isHealthy && (
            <div className="card">
              <p className="section-label mb-3">Where to Buy Treatment</p>
              <div className="space-y-3">
                {BUY_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] hover:border-[#D4D4D4] hover:bg-[#FAFAFA] transition-colors duration-150"
                  >
                    <span
                      className={`w-8 h-8 rounded-md ${link.logoBg} text-white text-sm font-bold flex items-center justify-center shrink-0`}
                    >
                      {link.logo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A]">{link.name}</p>
                      <p className="text-xs text-[#737373]">{link.desc}</p>
                    </div>
                    <span className="text-xs text-[#A3A3A3]">→</span>
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
