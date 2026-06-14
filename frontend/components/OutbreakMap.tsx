"use client";

import { useEffect, useRef } from "react";
import type { OutbreakPoint } from "@/services/api";

// Color map: recency → Leaflet circle color
const COLOR_MAP = {
  red:    "#DC2626",
  yellow: "#D97706",
  green:  "#15803D",
} as const;

interface Props {
  outbreaks: OutbreakPoint[];
  centerLat?: number;
  centerLon?: number;
}

export default function OutbreakMap({
  outbreaks,
  centerLat = 22.564,
  centerLon = 72.928,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapInstanceRef.current) return; // already initialised

    // Dynamically import Leaflet to avoid SSR crash
    import("leaflet").then((L) => {
      // Fix default marker icon path broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLon],
        zoom: 9,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Farmer's field marker (home pin)
      L.circleMarker([centerLat, centerLon], {
        radius: 9,
        color: "#D97706",
        fillColor: "#D97706",
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(map)
        .bindPopup("<b>🌾 Your Field</b>");

      // Outbreak markers
      outbreaks.forEach((o) => {
        const fill = COLOR_MAP[o.color] ?? COLOR_MAP.green;
        L.circleMarker([o.latitude, o.longitude], {
          radius: 10,
          color: fill,
          fillColor: fill,
          fillOpacity: 0.75,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:13px;">
              <b>${o.disease}</b><br/>
              ${o.distance_km} km away<br/>
              <span style="color:#737373">${o.reported_at}</span>
            </div>`
          );
      });

      mapInstanceRef.current = map;
    });

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Leaflet CSS via link tag — injected once */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: 420,
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      />
    </>
  );
}
