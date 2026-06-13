import Link from "next/link";

export default function StressAlert({
  reason,
  show,
}: {
  reason: string | null;
  show: boolean;
}) {
  if (!show || !reason) return null;

  return (
    <div className="flex items-start gap-3 bg-[#FFF3F0] border-l-[3px] border-[#FF5722] rounded-r-lg px-4 py-3">
      {/* Icon */}
      <span className="text-[#FF5722] text-base mt-0.5 shrink-0">⚠</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0A0A0A]">Crop stress detected</p>
        <p className="text-sm text-[#737373] mt-0.5">{reason}</p>
        <Link
          href="/disease"
          className="inline-block mt-2 text-sm text-[#FF5722] font-medium hover:text-[#E64A19] transition-colors duration-150"
        >
          Upload leaf image →
        </Link>
      </div>
    </div>
  );
}
