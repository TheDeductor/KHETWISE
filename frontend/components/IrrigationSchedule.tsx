import type { IrrigationDay } from "@/services/api";

const ACTION_CONFIG = {
  Irrigate: { bg: "var(--info-bg)", color: "var(--info)", border: "#BAE6FD", icon: "💧" },
  Skip:     { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success-border)", icon: "✓" },
};

export default function IrrigationSchedule({ schedule }: { schedule: IrrigationDay[] }) {
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 1fr 100px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px",
          gap: 8,
        }}
      >
        {["Day", "Action", "Reason", "ET0 / Rain"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {schedule.map((row, i) => {
        const cfg = ACTION_CONFIG[row.action] ?? ACTION_CONFIG["Skip"];
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 1fr 100px",
              padding: "12px 16px",
              borderBottom: i < schedule.length - 1 ? "1px solid var(--border)" : "none",
              gap: 8,
              alignItems: "center",
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {row.day}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 999,
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                width: "fit-content",
              }}
            >
              <span style={{ fontSize: 11 }}>{cfg.icon}</span>
              {row.action}
            </span>

            <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {row.reason}
            </span>

            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
                fontWeight: 500,
              }}
            >
              {row.et0} / {row.rain_mm}mm
            </span>
          </div>
        );
      })}
    </div>
  );
}
