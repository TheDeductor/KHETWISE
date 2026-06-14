"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getGlossaryEntry, type GlossaryEntry } from "@/lib/glossary";

// ── Category badge colors ─────────────────────────────────────────────────────

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  satellite:  { bg: "#EFF6FF", text: "#1D4ED8" },
  agronomy:   { bg: "#F0FDF4", text: "#15803D" },
  market:     { bg: "#FEF9C3", text: "#92400E" },
  irrigation: { bg: "#F0F9FF", text: "#0369A1" },
  disease:    { bg: "#FEF2F2", text: "#B91C1C" },
};

// ── Modal — rendered via portal at body ───────────────────────────────────────

function GlossaryModal({ entry, onClose }: { entry: GlossaryEntry; onClose: () => void }) {
  const catStyle = CAT_COLORS[entry.category] ?? { bg: "#F1F5F9", text: "#475569" };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 99998,
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "fadeIn 150ms ease",
        }}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Glossary: ${entry.term}`}
        style={{
          position: "fixed", zIndex: 99999,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--bg)",
          borderRadius: "var(--radius-lg)",
          border: "1.5px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          padding: 28,
          animation: "glossarySlideUp 220ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span style={{
              display: "inline-block", marginBottom: 8,
              padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: catStyle.bg, color: catStyle.text, textTransform: "capitalize",
            }}>
              {entry.category}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, margin: 0 }}>
              {entry.term}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              border: "1.5px solid var(--border)", background: "var(--surface)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "var(--text-muted)", lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Short summary box */}
        <div style={{
          padding: "11px 15px", borderRadius: "var(--radius-sm)",
          background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
            {entry.short}
          </p>
        </div>

        {/* Full explanation */}
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 22 }}>
          {entry.long}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {entry.link && (
            <a
              href={entry.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 16px", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 600,
                background: "var(--accent)", color: "#fff", textDecoration: "none",
                boxShadow: "var(--shadow-accent)",
              }}
            >
              📖 Learn More ↗
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              flex: entry.link ? "0 0 auto" : 1,
              padding: "10px 22px", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 600,
              background: "var(--surface)", border: "1.5px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Popover — rendered via portal, positioned by measured anchor rect ─────────

function GlossaryPopover({
  entry,
  anchorRect,
  onLearnMore,
  onClose,
}: {
  entry: GlossaryEntry;
  anchorRect: DOMRect;
  onLearnMore: () => void;
  onClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement>(null);
  const catStyle = CAT_COLORS[entry.category] ?? { bg: "#F1F5F9", text: "#475569" };

  // Compute position: prefer below, flip to above if near bottom of viewport
  const MARGIN = 10;
  const POP_HEIGHT = 160; // approximate
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top = spaceBelow > POP_HEIGHT + MARGIN
    ? anchorRect.bottom + window.scrollY + 8
    : anchorRect.top + window.scrollY - POP_HEIGHT - 8;

  // Keep horizontally within viewport
  const raw = anchorRect.left + window.scrollX;
  const maxLeft = window.innerWidth - 294 - MARGIN;
  const left = Math.max(MARGIN, Math.min(raw, maxLeft));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose();
    };
    // Delay so the opening click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={popRef}
      style={{
        position: "absolute",
        top,
        left,
        zIndex: 99997,
        width: 284,
        background: "var(--bg)",
        borderRadius: "var(--radius)",
        border: "1.5px solid var(--border)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        padding: "14px 16px",
        animation: "fadeIn 120ms ease",
      }}
    >
      {/* Term + category */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
        <span style={{
          padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
          background: catStyle.bg, color: catStyle.text, textTransform: "capitalize", flexShrink: 0,
        }}>
          {entry.category}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          {entry.term}
        </span>
      </div>

      {/* Short explanation */}
      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 13 }}>
        {entry.short}
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onLearnMore}
          style={{
            flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer",
          }}
        >
          Learn More
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: "var(--surface)", border: "1.5px solid var(--border)",
            color: "var(--text-muted)", cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GlossaryTooltip({
  term,
  children,
  label,
}: {
  term: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const entry = getGlossaryEntry(term);
  const [showPopover, setShowPopover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // Only render portals client-side
  useEffect(() => { setMounted(true); }, []);

  const openPopover = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (triggerRef.current) {
      setAnchorRect(triggerRef.current.getBoundingClientRect());
      setShowPopover(true);
      setShowModal(false);
    }
  }, []);

  const openModal = useCallback(() => {
    setShowPopover(false);
    setShowModal(true);
  }, []);

  const closeAll = useCallback(() => {
    setShowPopover(false);
    setShowModal(false);
  }, []);

  // No glossary entry → render plain
  if (!entry) return <>{children ?? label ?? term}</>;

  return (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        {children ?? label ?? term}
        <button
          ref={triggerRef}
          onClick={openPopover}
          aria-label={`What is ${term}?`}
          title={`What is ${term}?`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 15, height: 15, borderRadius: "50%",
            background: "var(--accent-light)",
            border: "1.5px solid var(--accent)",
            color: "var(--accent-hover)",
            fontSize: 9, fontWeight: 800,
            cursor: "pointer",
            lineHeight: 1,
            flexShrink: 0,
            transition: "all 120ms ease",
            verticalAlign: "middle",
            marginLeft: 3,
            padding: 0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "var(--accent)";
            el.style.color = "#fff";
            el.style.transform = "scale(1.15)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "var(--accent-light)";
            el.style.color = "var(--accent-hover)";
            el.style.transform = "scale(1)";
          }}
        >
          ?
        </button>
      </span>

      {mounted && showPopover && anchorRect && (
        <GlossaryPopover
          entry={entry}
          anchorRect={anchorRect}
          onLearnMore={openModal}
          onClose={closeAll}
        />
      )}

      {mounted && showModal && entry && (
        <GlossaryModal entry={entry} onClose={closeAll} />
      )}
    </>
  );
}
