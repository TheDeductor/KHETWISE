"use client";

import { useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function StressAlert({
  reason,
  show,
  lang = "en",
}: {
  reason: string | null;
  show: boolean;
  lang?: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || !reason || dismissed) return null;

  return (
    <div
      className="animate-slide-up"
      style={{
        background: "var(--warning-bg)",
        border: "1px solid var(--warning-border)",
        borderLeft: "4px solid var(--warning)",
        borderRadius: "0 var(--radius) var(--radius) 0",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "var(--warning-bg)",
          border: "1px solid var(--warning-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        ⚠️
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
            {t(lang, "stress_detected")}
          </p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{reason}</p>
          <Link
            href="/disease"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 13, fontWeight: 600, color: "var(--accent-hover)", textDecoration: "none" }}
          >
            {t(lang, "stress_scan_cta")}
          </Link>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--border)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }}
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </div>
  );
}
