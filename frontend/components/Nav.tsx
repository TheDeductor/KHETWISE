"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, t } from "@/lib/i18n";

// ── Icons (inline SVGs — no extra deps) ──────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function LeafIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function DropletIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function TrendingIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function MapPinIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" fill={active ? "white" : "none"} />
    </svg>
  );
}

function KhetwiseLogo() {
  return (
    <div className="flex items-center gap-2">
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: "linear-gradient(135deg, #D97706, #B45309)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        boxShadow: "0 2px 6px rgba(217,119,6,0.35)",
        flexShrink: 0,
      }}>
        🌾
      </div>
      <span style={{
        fontSize: 17,
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.3px",
      }}>
        Khetwise
      </span>
    </div>
  );
}

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/dashboard",  labelKey: "nav_home",       labelFullKey: "nav_dashboard",  icon: HomeIcon     },
  { href: "/disease",    labelKey: "nav_disease",    labelFullKey: "nav_disease",    icon: LeafIcon     },
  { href: "/irrigation", labelKey: "nav_water",      labelFullKey: "nav_irrigation", icon: DropletIcon  },
  { href: "/market",     labelKey: "nav_market",     labelFullKey: "nav_market",     icon: TrendingIcon },
  { href: "/outbreaks",  labelKey: "nav_outbreaks",  labelFullKey: "nav_outbreaks",  icon: MapPinIcon   },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Nav() {
  const pathname = usePathname();
  const lang = useLanguage();

  // Don't show nav on onboarding
  if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <>
      {/* ── Desktop top nav ──────────────────────────────────────────────────── */}
      <nav
        className="hidden md:flex w-full sticky top-0 z-50"
        style={{
          background: "rgba(255,251,245,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          height: "var(--nav-h)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <KhetwiseLogo />
          </Link>

          {/* Center links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, labelFullKey }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--accent-hover)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-light)" : "transparent",
                    textDecoration: "none",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  {t(lang, labelFullKey)}
                </Link>
              );
            })}
          </div>

          {/* Right: Field settings link */}
          <Link
            href="/field"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              border: "1.5px solid var(--border)",
              background: "var(--bg)",
              textDecoration: "none",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ fontSize: 12 }}>⚙</span>
            {t(lang, "nav_my_farm")}
          </Link>
        </div>
      </nav>

      {/* ── Mobile top bar (logo only) ───────────────────────────────────────── */}
      <nav
        className="flex md:hidden w-full sticky top-0 z-50"
        style={{
          background: "rgba(255,251,245,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          height: 52,
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <KhetwiseLogo />
        </Link>
        <Link
          href="/field"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "1.5px solid var(--border)",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          ⚙
        </Link>
      </nav>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────────── */}
      <nav className="bottom-nav md:hidden">
        {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon active={isActive} />
              <span>{t(lang, labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
