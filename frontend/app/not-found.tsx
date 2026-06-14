import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 16,
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <div style={{ fontSize: 64 }}>🌾</div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 72,
          fontWeight: 700,
          color: "var(--border)",
          lineHeight: 1,
        }}
      >
        404
      </p>
      <div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          Page not found
        </p>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          This field doesn&apos;t exist in our records.
        </p>
      </div>
      <Link href="/dashboard" className="btn-primary" style={{ marginTop: 8 }}>
        Back to Dashboard
      </Link>
    </div>
  );
}
