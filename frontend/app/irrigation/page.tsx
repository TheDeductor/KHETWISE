"use client";

import { useEffect, useState } from "react";
import IrrigationSchedule from "@/components/IrrigationSchedule";
import { getIrrigation, type IrrigationData } from "@/services/api";
import { mockIrrigation } from "@/services/mock";

export const dynamic = "force-dynamic";

const DEFAULT_FIELD_ID = "demo-field-001";

export default function IrrigationPage() {
  const [data, setData] = useState<IrrigationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fieldId =
    typeof window !== "undefined"
      ? localStorage.getItem("field_id") || DEFAULT_FIELD_ID
      : DEFAULT_FIELD_ID;

  useEffect(() => {
    async function load() {
      try {
        const res = await getIrrigation(fieldId);
        setData(res);
      } catch {
        setData(mockIrrigation);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fieldId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#A3A3A3]">Fetching live weather data…</p>
      </div>
    );
  }

  const skip = data.recommendation.toLowerCase().includes("do not");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Irrigation Advisor</h1>
        <p className="page-subtitle">
          ET0-based scheduling using real Open-Meteo weather data
        </p>
      </div>

      {/* Headline recommendation */}
      <div className={`card flex items-start gap-4 ${skip ? "" : "border-l-[3px] border-l-[#FF5722]"}`}>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
            skip ? "bg-[#F0FDF4]" : "bg-[#FFF3F0]"
          }`}
        >
          {skip ? "✓" : "💧"}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#0A0A0A]">{data.recommendation}</p>
          <p className="text-sm text-[#737373] mt-1">{data.reason}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Water Saved"
          value={`${(data.water_saved_liters / 1000).toFixed(1)}K L`}
          sub="this week"
        />
        <StatCard
          label="Cost Saved"
          value={`₹${data.money_saved_inr}`}
          sub="pump electricity"
        />
        <StatCard
          label="Today ET0"
          value={`${data.et0} mm`}
          sub="evapotranspiration"
        />
        <StatCard
          label="Rain Expected"
          value={`${data.rain_expected_mm} mm`}
          sub="today"
        />
      </div>

      {/* 7-day schedule */}
      <div>
        <p className="section-label mb-3">7-Day Schedule</p>
        <IrrigationSchedule schedule={data.schedule} />
      </div>

      {/* Methodology note */}
      <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
        <p className="text-xs text-[#737373] leading-relaxed">
          <span className="font-medium text-[#0A0A0A]">How this works: </span>
          Water deficit = ET0 × crop factor (Cotton 1.2) − daily rainfall.
          If deficit &gt; 0, irrigate. Liters = deficit mm × {" "}
          <span className="font-mono">4,046</span> × field acres.
          Savings = rain-covered water × ₹0.008/L pump cost.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card py-4">
      <p className="section-label">{label}</p>
      <p className="stat-value mt-2">{value}</p>
      <p className="text-xs text-[#A3A3A3] mt-1">{sub}</p>
    </div>
  );
}
