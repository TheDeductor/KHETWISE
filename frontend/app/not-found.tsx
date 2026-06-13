import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <p className="font-mono text-6xl font-medium text-[#E5E5E5]">404</p>
      <p className="text-sm font-medium text-[#0A0A0A]">Page not found</p>
      <Link href="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
