import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khetwise — Community Crop Intelligence for Indian Farmers",
  description:
    "Early disease detection, outbreak warnings, ET0-based irrigation scheduling, and market price intelligence — built for Indian farmers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#0A0A0A] antialiased">
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>

        {/* Impact footer */}
        <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] mt-16">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap gap-6 items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">Khetwise</span>
            <div className="flex gap-6 flex-wrap">
              <ImpactStat label="Loss Prevented" value="₹8,000" />
              <ImpactStat label="Water Saved" value="42,000 L" />
              <ImpactStat label="Extra Income" value="₹18,500" />
            </div>
            <span className="text-xs text-[#A3A3A3]">Gujarat · India</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#737373]">{label}</span>
      <span className="text-xs font-mono font-medium text-[#0A0A0A]">{value}</span>
    </div>
  );
}
