import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khetwise — Smart Farming for Indian Farmers",
  description:
    "Crop disease detection, smart irrigation, market prices & outbreak alerts — built for Indian farmers.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFFBF5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text-primary)",
        }}
      >
        <Nav />

        {/* Main content — padded for bottom nav on mobile */}
        <main
          className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8"
          style={{ paddingBottom: "calc(var(--bottom-nav-h) + 16px)" }}
        >
          {children}
        </main>

      </body>
    </html>
  );
}

