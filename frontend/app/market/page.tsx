"use client";

import { useEffect, useState } from "react";
import { getMarket, type MarketData } from "@/services/api";
import { mockMarket } from "@/services/mock";

export const dynamic = "force-dynamic";

const CROPS = ["Cotton", "Tomato", "Wheat", "Rice", "Maize"];

export default function MarketPage() {
  const [selectedCrop, setSelectedCrop] = useState("Cotton");
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const areaAcres =
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("field_area") || "2.5")
      : 2.5;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMarket(selectedCrop, areaAcres);
        setData(res);
      } catch {
        setData({ ...mockMarket, crop: selectedCrop });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCrop, areaAcres]);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Market Intelligence</h1>
        <p className="page-subtitle">Find where to sell for maximum profit</p>
      </div>

      {/* Crop selector */}
      <div>
        <p className="section-label mb-2">Select Crop</p>
        <div className="flex gap-2 flex-wrap">
          {CROPS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors duration-150 ${
                selectedCrop === c
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-white text-[#737373] border-[#E5E5E5] hover:border-[#D4D4D4] hover:text-[#0A0A0A]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[#A3A3A3]">Loading prices…</p>
      )}

      {data && !loading && (
        <>
          {/* Two price cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Local */}
            <div className="card">
              <p className="section-label mb-3">Local Market</p>
              <p className="text-sm font-medium text-[#0A0A0A] mb-3">{data.local_market}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-medium text-[#0A0A0A]">
                  ₹{data.local_price}
                </span>
                <span className="text-sm text-[#A3A3A3]">/kg</span>
              </div>
            </div>

            {/* Best market — highlighted */}
            <div className="card border-[#FF5722] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF5722] text-white text-[10px] font-medium px-2 py-0.5 rounded-bl-lg">
                Best Price
              </div>
              <p className="section-label mb-3">Best Market</p>
              <p className="text-sm font-medium text-[#0A0A0A] mb-3">{data.best_market}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-medium text-[#FF5722]">
                  ₹{data.best_price}
                </span>
                <span className="text-sm text-[#A3A3A3]">/kg</span>
              </div>
            </div>
          </div>

          {/* Profit callout */}
          <div className="card bg-[#FAFAFA]">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Extra Income</p>
              <span className="badge badge-healthy">+₹{data.profit_increase}/kg</span>
            </div>
            <p className="stat-value text-[#FF5722]">
              ₹{data.total_extra_income.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#737373] mt-2 leading-relaxed">
              {data.recommendation}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-[#A3A3A3]">
            Prices are indicative. Call your APMC mandi before transporting.
            Updated daily.
          </p>
        </>
      )}
    </div>
  );
}
