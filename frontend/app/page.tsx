"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Fresh prototype — always check onboarding_complete, not legacy field_id
    const done = localStorage.getItem("onboarding_complete");
    if (done === "true") {
      router.push("/dashboard");
    } else {
      // Clear any stale legacy data so onboarding starts clean
      localStorage.clear();
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg)",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 40 }}>🌾</div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
        Loading Khetwise…
      </p>
    </div>
  );
}
