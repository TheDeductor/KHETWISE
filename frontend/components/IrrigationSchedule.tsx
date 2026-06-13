import type { IrrigationDay } from "@/services/api";

export default function IrrigationSchedule({ schedule }: { schedule: IrrigationDay[] }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {/* Table header */}
      <div className="grid grid-cols-4 bg-[#FAFAFA] border-b border-[#E5E5E5] px-4 py-2">
        {["Day", "Action", "Reason", "ET0 / Rain"].map((h) => (
          <span key={h} className="text-xs font-medium text-[#737373] uppercase tracking-wide">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {schedule.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-4 px-4 py-3 border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors duration-100"
        >
          <span className="text-sm text-[#0A0A0A] font-medium">{row.day}</span>

          <span
            className={`text-sm font-medium ${
              row.action === "Irrigate" ? "text-[#FF5722]" : "text-[#22C55E]"
            }`}
          >
            {row.action}
          </span>

          <span className="text-sm text-[#737373]">{row.reason}</span>

          <span className="text-sm font-mono text-[#0A0A0A]">
            {row.et0} / {row.rain_mm} mm
          </span>
        </div>
      ))}
    </div>
  );
}
