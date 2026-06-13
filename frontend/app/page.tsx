"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasField = localStorage.getItem("field_id");
    if (hasField) {
      router.push("/dashboard");
    } else {
      router.push("/field");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-sm text-[#A3A3A3]">Loading Khetwise...</p>
    </div>
  );
}
