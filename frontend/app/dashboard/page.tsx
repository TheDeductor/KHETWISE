"use client";

import { useEffect, useState } from "react";
import HealthCard from "@/components/HealthCard";
import NDVIChart from "@/components/NDVIChart";
import StressAlert from "@/components/StressAlert";
import VoiceBox from "@/components/VoiceBox";
import { getHealth, getNdviHistory, type HealthData, type NdviPoint } from "@/services/api";
import { mockHealth, mockNdviHistory } from "@/services/mock";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<NdviPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

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
        // Fall back to mock data if backend is not running
        setHealth(mockHealth);
        setHistory(mockNdviHistory.history);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fieldId]);

  const crop =
    typeof window !== "undefined"
      ? localStorage.getItem("field_crop") || "Cotton"
      : "Cotton";

  const areaAcres =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_area") || "2.5")
      : 2.5;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-[#A3A3A3]">Loading field data…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Real-time crop health for your {crop} field
        </p>
      </div>

      {/* Stress alert — spans full width when visible */}
      {health && (
        <StressAlert
          show={health.stress_detected}
          reason={health.stress_reason}
        />
      )}

      {/* Top row: health card + NDVI chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {health && (
          <HealthCard data={health} crop={crop} areaAcres={areaAcres} />
        )}
        {history.length > 0 && <NDVIChart history={history} />}
      </div>

      {/* Divider */}
      <hr className="divider" />

      {/* Voice assistant */}
      <VoiceBox />

      {/* Quick links */}
      <div>
        <p className="section-label mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/disease",    label: "Analyze Disease",   primary: true  },
            { href: "/irrigation", label: "Irrigation Plan",   primary: false },
            { href: "/market",     label: "Market Prices",     primary: false },
            { href: "/outbreaks",  label: "View Outbreaks",    primary: false },
          ].map(({ href, label, primary }) => (
            <a
              key={href}
              href={href}
              className={primary ? "btn-primary justify-center" : "btn-secondary justify-center"}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
