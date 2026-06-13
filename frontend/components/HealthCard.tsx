import type { HealthData } from "@/services/api";

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  Healthy:  { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#22C55E]" },
  Stressed: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", dot: "bg-[#F97316]" },
  "At Risk":{ bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#EF4444]" },
};

export default function HealthCard({
  data,
  crop,
  areaAcres,
}: {
  data: HealthData;
  crop?: string;
  areaAcres?: number;
}) {
  const badge = STATUS_BADGE[data.status] ?? STATUS_BADGE["At Risk"];

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-medium text-[#0A0A0A]">Crop Health</span>
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {data.status}
        </span>
      </div>

      {/* Score */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[72px] leading-none font-medium text-[#0A0A0A]">
            {data.health_score}
          </span>
          <span className="text-xl text-[#A3A3A3] font-mono"> / 100</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5E5] mb-4" />

      {/* Data rows */}
      <div className="space-y-2">
        <DataRow label="NDVI" value={data.ndvi.toFixed(2)} />
        {crop && (
          <DataRow
            label="Field"
            value={`${crop}${areaAcres ? ` · ${areaAcres} ac` : ""}`}
          />
        )}
        {data.stress_reason && (
          <DataRow label="Stress" value={data.stress_reason} valueClass="text-[#EF4444]" />
        )}
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
  valueClass = "text-[#0A0A0A] font-mono",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#737373] uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
