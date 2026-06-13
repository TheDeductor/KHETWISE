"use client";

import { useEffect, useState } from "react";
import loadDynamic from "next/dynamic";
import { getOutbreaks, type OutbreaksData } from "@/services/api";
import { mockOutbreaks } from "@/services/mock";

export const dynamic = "force-dynamic";

// Dynamically import the map — no SSR
const OutbreakMap = loadDynamic(() => import("@/components/OutbreakMap"), {

  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] border border-[#E5E5E5] rounded-lg flex items-center justify-center bg-[#FAFAFA]">
      <p className="text-sm text-[#A3A3A3]">Loading map…</p>
    </div>
  ),
});

const DOT_LEGEND = [
  { color: "bg-[#EF4444]", label: "Last 7 days",   desc: "High risk" },
  { color: "bg-[#F59E0B]", label: "8–14 days ago", desc: "Monitor closely" },
  { color: "bg-[#22C55E]", label: "15–30 days ago",desc: "Awareness" },
];

// Default to Anand, Gujarat
const DEFAULT_LAT = 22.564;
const DEFAULT_LON = 72.928;

export default function OutbreaksPage() {
  const [data, setData] = useState<OutbreaksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getOutbreaks(DEFAULT_LAT, DEFAULT_LON, 100);
        setData(res);
      } catch {
        setData(mockOutbreaks);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Pest Outbreak Heatmap</h1>
        <p className="page-subtitle">
          Community-reported disease sightings within 100 km of Anand, Gujarat
        </p>
      </div>

      {/* Alert banner */}
      {data?.alert && data.alert_message && (
        <div className="alert-banner">
          <span className="text-[#FF5722]">⚠</span>
          <div>
            <p className="text-sm font-medium text-[#0A0A0A]">Nearby Outbreak Alert</p>
            <p className="text-sm text-[#737373] mt-0.5">{data.alert_message}</p>
          </div>
        </div>
      )}

      {/* Map */}
      {!loading && data && (
        <OutbreakMap
          outbreaks={data.outbreaks}
          centerLat={DEFAULT_LAT}
          centerLon={DEFAULT_LON}
        />
      )}

      {loading && (
        <div className="w-full h-[420px] border border-[#E5E5E5] rounded-lg flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-sm text-[#A3A3A3]">Fetching outbreak data…</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {DOT_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-sm text-[#0A0A0A] font-medium">{l.label}</span>
            <span className="text-sm text-[#737373]">— {l.desc}</span>
          </div>
        ))}
      </div>

      {/* Reports table */}
      {data && data.outbreaks.length > 0 && (
        <div>
          <p className="section-label mb-3">Reported Outbreaks</p>
          <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-[#FAFAFA] border-b border-[#E5E5E5] px-4 py-2">
              {["Disease", "Distance", "Reported", "Risk"].map((h) => (
                <span key={h} className="text-xs font-medium text-[#737373] uppercase tracking-wide">
                  {h}
                </span>
              ))}
            </div>
            {/* Rows */}
            {data.outbreaks.map((o, i) => {
              const dotColor =
                o.color === "red"
                  ? "bg-[#EF4444]"
                  : o.color === "yellow"
                  ? "bg-[#F59E0B]"
                  : "bg-[#22C55E]";
              const riskLabel =
                o.color === "red" ? "High" : o.color === "yellow" ? "Medium" : "Low";
              const badgeClass =
                o.color === "red"
                  ? "badge-alert"
                  : o.color === "yellow"
                  ? "bg-[#FFF7ED] text-[#EA580C]"
                  : "badge-healthy";
              return (
                <div
                  key={i}
                  className="grid grid-cols-4 px-4 py-3 border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors duration-100 items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="text-sm text-[#0A0A0A] font-medium">{o.disease}</span>
                  </div>
                  <span className="text-sm font-mono text-[#0A0A0A]">{o.distance_km} km</span>
                  <span className="text-sm text-[#737373]">{o.reported_at}</span>
                  <span className={`badge ${badgeClass} w-fit`}>{riskLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data && data.outbreaks.length === 0 && !loading && (
        <div className="p-8 text-center border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-sm font-medium text-[#0A0A0A]">No outbreaks reported nearby</p>
          <p className="text-xs text-[#737373] mt-1">Your area looks clear in the last 30 days</p>
        </div>
      )}
    </div>
  );
}
