"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingStep, commitOnboarding, type OnboardingData } from "@/lib/onboarding-store";
import { CROPS, CROP_CATEGORIES, searchCrops, type Crop } from "@/lib/crops-data";
import { registerField } from "@/services/api";
import { t } from "@/lib/i18n";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const LANGUAGES = [
  { code: "en", script: "A",    name: "English",  nativeName: "English"  },
  { code: "hi", script: "अ",   name: "Hindi",    nativeName: "हिन्दी"   },
  { code: "te", script: "అ",   name: "Telugu",   nativeName: "తెలుగు"   },
  { code: "ta", script: "அ",   name: "Tamil",    nativeName: "தமிழ்"    },
  { code: "bn", script: "অ",   name: "Bengali",  nativeName: "বাংলা"    },
  { code: "mr", script: "अ",   name: "Marathi",  nativeName: "मराठी"    },
];

const FARMER_TYPES = [
  { value: "Smallholder",  labelKey: "smallholder",  descKey: "smallholder_desc", emoji: "👨‍🌾" },
  { value: "Commercial",   labelKey: "commercial",   descKey: "commercial_desc",  emoji: "🏭" },
  { value: "Cooperative",  labelKey: "cooperative",  descKey: "coop_desc",        emoji: "🤝" },
];

const SOIL_TYPES = [
  { value: "Black Cotton", labelKey: "soil_black",    emoji: "⬛" },
  { value: "Red",          labelKey: "soil_red",      emoji: "🟥" },
  { value: "Loamy",        labelKey: "soil_loam",     emoji: "🟫" },
  { value: "Sandy",        labelKey: "soil_sand",     emoji: "🟡" },
  { value: "Alluvial",     labelKey: "soil_alluvial", emoji: "💧" },
  { value: "Laterite",     labelKey: "soil_laterite", emoji: "🟤" },
];

const WATER_SOURCES = [
  { value: "Borewell",       labelKey: "water_bore",  emoji: "⚙️" },
  { value: "Canal",          labelKey: "water_canal", emoji: "🌊" },
  { value: "Rainwater",      labelKey: "water_rain",  emoji: "🌧" },
  { value: "Drip Irrigation",labelKey: "water_drip",  emoji: "💧" },
  { value: "Tank / Pond",    labelKey: "water_tank",  emoji: "🏞" },
  { value: "River / Stream", labelKey: "water_river", emoji: "🏞" },
];

const GROWTH_STAGES = [
  { value: "Seedling", labelKey: "stage_1" },
  { value: "Vegetative", labelKey: "stage_2" },
  { value: "Flowering", labelKey: "stage_3" },
  { value: "Fruiting / Grain fill", labelKey: "stage_4" },
  { value: "Maturity / Harvest", labelKey: "stage_5" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function PillBtn({
  selected,
  onClick,
  children,
  fullWidth = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 16px",
        borderRadius: 999,
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        background: selected ? "var(--accent)" : "var(--bg)",
        color: selected ? "#fff" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 160ms ease",
        fontFamily: "var(--font-sans)",
        boxShadow: selected ? "var(--shadow-accent)" : "none",
        width: fullWidth ? "100%" : undefined,
        justifyContent: fullWidth ? "flex-start" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function StepLabel({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: done ? "var(--accent)" : active ? "var(--accent)" : "var(--border)",
        color: done || active ? "#fff" : "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
        transition: "all 200ms ease",
      }}>
        {done ? "✓" : num}
      </div>
      <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </div>
  );
}

// ── STT helper ────────────────────────────────────────────────────────────────

interface SpeechRecognitionInstance extends EventTarget {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void; stop(): void;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
}

function useMic(lang: string, onResult: (t: string) => void) {
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  const bcp47: Record<string, string> = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", bn: "bn-IN", mr: "mr-IN" };

  const toggle = useCallback(() => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec: SpeechRecognitionInstance = new SR();
    rec.lang = bcp47[lang] ?? "en-IN";
    rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e) => { onResult(e.results[0][0].transcript); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, lang]);

  return { listening, toggle };
}

// ── Nominatim location search ─────────────────────────────────────────────────

interface NominatimResult {
  display_name: string;
  lat: string; lon: string;
  address?: { state?: string; county?: string; city?: string; town?: string; village?: string };
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", India")}&format=json&addressdetails=1&limit=5&countrycodes=in`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  return res.json();
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [farmerType, setFarmerType] = useState("Smallholder");
  const [expYears, setExpYears] = useState(3);
  const [phone, setPhone] = useState("");

  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [locResults, setLocResults] = useState<NominatimResult[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [areaAcres, setAreaAcres] = useState(2.5);
  const [soilType, setSoilType] = useState("Black Cotton");
  const [waterSource, setWaterSource] = useState("Borewell");
  const [numPlots, setNumPlots] = useState(1);

  const [cropFilter, setCropFilter] = useState("");
  const [cropCategory, setCropCategory] = useState<string>("All");
  const [selectedCrops, setSelectedCrops] = useState<string[]>(["Cotton"]);
  const [primaryCrop, setPrimaryCrop] = useState("Cotton");
  const [sowingDate, setSowingDate] = useState("");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [currentIssue, setCurrentIssue] = useState("");

  // ── STT for name ──────────────────────────────────────────────────────────
  const { listening: micListening, toggle: toggleMic } = useMic(lang, (txt) => setName(txt));

  // ── Location: GPS ─────────────────────────────────────────────────────────
  function detectGPS() {
    if (!navigator.geolocation) { setGpsError("Geolocation not supported in this browser."); return; }
    setGpsLoading(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude); setLon(longitude);
        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          const addr = data.address ?? {};
          const district_ = addr.county ?? addr.city ?? addr.town ?? addr.village ?? "";
          const state_ = addr.state ?? "";
          setDistrict(district_); setState(state_);
          setLocationLabel(`${district_}${state_ ? ", " + state_ : ""}`);
        } catch {
          setLocationLabel(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError("Location permission denied. Please search manually below.");
        else setGpsError("Could not detect location. Please search manually.");
      },
      { timeout: 10000 }
    );
  }

  // ── Location: Nominatim search ────────────────────────────────────────────
  async function handleLocSearch(q: string) {
    setLocSearchQuery(q);
    if (q.length < 2) { setLocResults([]); return; }
    setLocLoading(true);
    try {
      const results = await nominatimSearch(q);
      setLocResults(results.slice(0, 5));
    } catch { setLocResults([]); }
    setLocLoading(false);
  }

  function selectLocResult(r: NominatimResult) {
    const addr = r.address ?? {};
    const district_ = addr.county ?? addr.city ?? addr.town ?? addr.village ?? "";
    const state_ = addr.state ?? "";
    setLat(parseFloat(r.lat)); setLon(parseFloat(r.lon));
    setDistrict(district_); setState(state_);
    setLocationLabel(`${district_}${state_ ? ", " + state_ : ""}`);
    setLocSearchQuery(r.display_name.split(",").slice(0, 2).join(","));
    setLocResults([]);
  }

  // ── Crop toggle ───────────────────────────────────────────────────────────
  function toggleCrop(cropName: string) {
    setSelectedCrops((prev) => {
      if (prev.includes(cropName)) {
        const next = prev.filter((c) => c !== cropName);
        if (primaryCrop === cropName && next.length > 0) setPrimaryCrop(next[0]);
        return next;
      }
      const next = [...prev, cropName];
      if (prev.length === 0) setPrimaryCrop(cropName);
      return next;
    });
  }

  // ── Validation per step ───────────────────────────────────────────────────
  function canProceed(): boolean {
    if (step === 1) return true; // language selection, always ok
    if (step === 2) return name.trim().length >= 2;
    if (step === 3) return lat !== null && lon !== null;
    if (step === 4) return areaAcres > 0;
    if (step === 5) return selectedCrops.length > 0;
    return true;
  }

  // ── Save + advance ────────────────────────────────────────────────────────
  function advance() {
    // partial save on every step forward
    saveOnboardingStep({
      language: lang, user_name: name, farmer_type: farmerType, experience_years: expYears, phone,
      latitude: lat ?? 22.564, longitude: lon ?? 72.928, location_label: locationLabel, state, district,
      area_acres: areaAcres, soil_type: soilType, water_source: waterSource, num_plots: numPlots,
      crops: selectedCrops, primary_crop: primaryCrop, sowing_date: sowingDate,
      growth_stage: growthStage, current_issue: currentIssue,
    });
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  }

  // ── Final submit ──────────────────────────────────────────────────────────
  async function handleFinish() {
    setSubmitting(true); setSubmitError(null);
    const finalLat = lat ?? 22.564; const finalLon = lon ?? 72.928;
    try {
      const res = await registerField({
        user_name: name, crop: primaryCrop,
        latitude: finalLat, longitude: finalLon, area_acres: areaAcres,
        soil_type: soilType, water_source: waterSource,
        farmer_type: farmerType, experience_years: expYears,
        phone: phone || undefined,
        num_plots: numPlots, language: lang,
        location_label: locationLabel || undefined,
        state: state || undefined, district: district || undefined,
        all_crops: selectedCrops.join(","),
        growth_stage: growthStage,
        sowing_date: sowingDate || undefined,
        current_issue: currentIssue || undefined,
      });
      const data: OnboardingData = {
        language: lang, user_name: name, farmer_type: farmerType, experience_years: expYears, phone,
        latitude: finalLat, longitude: finalLon, location_label: locationLabel, state, district,
        area_acres: areaAcres, soil_type: soilType, water_source: waterSource, num_plots: numPlots,
        crops: selectedCrops, primary_crop: primaryCrop, sowing_date: sowingDate,
        growth_stage: growthStage, current_issue: currentIssue,
      };
      commitOnboarding(data, res.field_id);
      setStep(6); // success screen
    } catch {
      // offline/demo mode: commit without field_id
      const data: OnboardingData = {
        language: lang, user_name: name, farmer_type: farmerType, experience_years: expYears, phone,
        latitude: finalLat, longitude: finalLon, location_label: locationLabel, state, district,
        area_acres: areaAcres, soil_type: soilType, water_source: waterSource, num_plots: numPlots,
        crops: selectedCrops, primary_crop: primaryCrop, sowing_date: sowingDate,
        growth_stage: growthStage, current_issue: currentIssue,
      };
      commitOnboarding(data, `demo-${Date.now()}`);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Filtered crops ────────────────────────────────────────────────────────
  const filteredCrops: Crop[] = searchCrops(cropFilter).filter(
    (c) => cropCategory === "All" || c.category === cropCategory
  );

  // ────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      {step > 1 && step <= TOTAL_STEPS && (
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(255,251,245,0.95)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
        }}>
          <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Progress bar */}
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }} />
            </div>
            {/* Step dots */}
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", overflowX: "auto" }}>
              {["stepNav1", "stepNav2", "stepNav3", "stepNav4", "stepNav5"].map((key, i) => (
                <StepLabel key={key} num={i + 1} label={t(lang, key)} active={step === i + 1} done={step > i + 1} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 100px" }}>
        <div style={{ width: "100%", maxWidth: 540 }}>

          {/* ════════════════════════════════════════════════════════════════════
              STEP 1 — Language & Welcome
          ════════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ textAlign: "center", paddingTop: 20 }}>
              {/* Hero */}
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: "linear-gradient(135deg, #D97706, #B45309)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 38, margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgba(217,119,6,0.35)",
              }}>
                🌾
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.4px" }}>
                {t(lang, "welcome")}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.5 }}>
                {t(lang, "tagline")}
              </p>

              {/* Language picker */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 14 }}>
                Choose your language · भाषा चुनें
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => { setLang(l.code); localStorage.setItem("kw_language", l.code); window.dispatchEvent(new Event("kw_lang_changed")); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "12px 8px", borderRadius: 12,
                      border: `2px solid ${lang === l.code ? "var(--accent)" : "var(--border)"}`,
                      background: lang === l.code ? "var(--accent)" : "var(--bg)",
                      cursor: "pointer", transition: "all 160ms ease",
                      boxShadow: lang === l.code ? "var(--shadow-accent)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 22, color: lang === l.code ? "#fff" : "var(--text-primary)", lineHeight: 1 }}>
                      {l.script}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: lang === l.code ? "rgba(255,255,255,0.9)" : "var(--text-secondary)", letterSpacing: "0.02em" }}>
                      {l.nativeName}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={advance}
                className="btn-primary"
                style={{ width: "100%", fontSize: 16, padding: "14px 24px", borderRadius: 12 }}
              >
                {t(lang, "start")} →
              </button>

              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
                {t(lang, "free_forever")}
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 2 — Personal Info
          ════════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="onboarding-step">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                {t(lang, "step2title")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                {t(lang, "step_x_of_y", { x: "2", y: String(TOTAL_STEPS) })}
              </p>

              {/* Name with mic */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "your_name")}
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder={t(lang, "name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleMic}
                    title={micListening ? "Stop" : "Speak your name"}
                    style={{
                      width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                      border: `1.5px solid ${micListening ? "var(--danger)" : "var(--border)"}`,
                      background: micListening ? "var(--danger-bg)" : "var(--bg)",
                      color: micListening ? "var(--danger)" : "var(--text-secondary)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, transition: "all 150ms ease",
                    }}
                  >
                    🎤
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "phone_number")} <span style={{ fontWeight: 400, textTransform: "none" }}>{t(lang, "optional_sms")}</span>
                </label>
                <input
                  className="input"
                  placeholder={t(lang, "phone_placeholder")}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Farmer type */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                  {t(lang, "farmer_type")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FARMER_TYPES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFarmerType(f.value)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 12,
                        border: `2px solid ${farmerType === f.value ? "var(--accent)" : "var(--border)"}`,
                        background: farmerType === f.value ? "var(--accent-light)" : "var(--bg)",
                        cursor: "pointer", transition: "all 160ms ease",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{f.emoji}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: farmerType === f.value ? "var(--accent-hover)" : "var(--text-primary)", marginBottom: 1 }}>
                          {t(lang, f.labelKey)}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t(lang, f.descKey)}</p>
                      </div>
                      {farmerType === f.value && (
                        <span style={{ marginLeft: "auto", fontSize: 16, color: "var(--accent)" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "years_exp")} <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{expYears} {t(lang, "yrs")}</span>
                </label>
                <input
                  type="range" min={0} max={50} step={1}
                  value={expYears}
                  onChange={(e) => setExpYears(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", height: 4, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  <span>0 {t(lang, "yrs")}</span><span>25 {t(lang, "yrs")}</span><span>50 {t(lang, "yrs")}</span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 3 — Location
          ════════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="onboarding-step">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                {t(lang, "step3title")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                {t(lang, "step_x_of_y", { x: "3", y: String(TOTAL_STEPS) })} · {t(lang, "loc_subtitle")}
              </p>

              {/* GPS button */}
              <button
                type="button"
                onClick={detectGPS}
                disabled={gpsLoading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  width: "100%", padding: "14px 20px", borderRadius: 12,
                  border: "2px dashed var(--accent)",
                  background: lat !== null ? "var(--accent-light)" : "var(--surface)",
                  color: "var(--accent-hover)", fontSize: 14, fontWeight: 700,
                  cursor: gpsLoading ? "default" : "pointer",
                  fontFamily: "var(--font-sans)", marginBottom: 16, transition: "all 150ms ease",
                }}
              >
                <span style={{ fontSize: 18 }}>{lat !== null ? "📍" : gpsLoading ? "⏳" : "🛰"}</span>
                {gpsLoading ? t(lang, "detecting") : lat !== null ? `${t(lang, "detected")}: ${locationLabel}` : t(lang, "detect")}
              </button>

              {gpsError && (
                <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 14, padding: "8px 12px", background: "var(--danger-bg)", borderRadius: 8, border: "1px solid var(--danger-border)" }}>
                  {gpsError}
                </p>
              )}

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{t(lang, "or")}</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              {/* Search box */}
              <div style={{ position: "relative", marginBottom: 8 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  placeholder={t(lang, "search_placeholder")}
                  value={locSearchQuery}
                  onChange={(e) => handleLocSearch(e.target.value)}
                />
                {locLoading && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)" }}>
                    {t(lang, "searching")}
                  </span>
                )}
              </div>

              {/* Results */}
              {locResults.length > 0 && (
                <div style={{
                  border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
                  boxShadow: "var(--shadow-md)", background: "var(--bg)", marginBottom: 16,
                }}>
                  {locResults.map((r, i) => {
                    const shortName = r.display_name.split(",").slice(0, 3).join(", ");
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectLocResult(r)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", padding: "11px 14px", textAlign: "left",
                          background: "transparent", border: "none",
                          borderBottom: i < locResults.length - 1 ? "1px solid var(--border)" : "none",
                          cursor: "pointer", transition: "background 150ms ease",
                          fontFamily: "var(--font-sans)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>📍</span>
                        <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>{shortName}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected location display */}
              {lat !== null && (
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "var(--success-bg)", border: "1px solid var(--success-border)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--success)", marginBottom: 2 }}>{locationLabel || t(lang, "loc_selected")}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {lat.toFixed(4)}, {lon?.toFixed(4)}
                    </p>
                  </div>
                </div>
              )}

              {/* Manual fallback */}
              {lat === null && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                  {t(lang, "loc_default")}
                </p>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 4 — Farm Details
          ════════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="onboarding-step">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                {t(lang, "step4title")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                {t(lang, "step_x_of_y", { x: "4", y: String(TOTAL_STEPS) })}
              </p>

              {/* Area */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "area_label")} <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{areaAcres} {t(lang, "acres")}</span>
                </label>
                <input
                  type="range" min={0.5} max={100} step={0.5}
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", height: 4, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  <span>0.5 {t(lang, "ac")}</span><span>50 {t(lang, "ac")}</span><span>100 {t(lang, "ac")}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  ≈ {(areaAcres * 0.405).toFixed(2)} {t(lang, "hectares")} · {(areaAcres * 4046.86).toFixed(0)} m²
                </p>
              </div>

              {/* Number of plots */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "num_plots")}
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, "6+"].map((n) => (
                    <PillBtn
                      key={n}
                      selected={numPlots === Number(n) || (n === "6+" && numPlots >= 6)}
                      onClick={() => setNumPlots(n === "6+" ? 6 : Number(n))}
                    >
                      {n}
                    </PillBtn>
                  ))}
                </div>
              </div>

              {/* Soil type */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                  {t(lang, "soil_type")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SOIL_TYPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSoilType(s.value)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                        borderRadius: 10,
                        border: `2px solid ${soilType === s.value ? "var(--accent)" : "var(--border)"}`,
                        background: soilType === s.value ? "var(--accent-light)" : "var(--bg)",
                        cursor: "pointer", transition: "all 150ms ease",
                        fontFamily: "var(--font-sans)", textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{s.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: soilType === s.value ? 700 : 500, color: soilType === s.value ? "var(--accent-hover)" : "var(--text-primary)" }}>
                        {t(lang, s.labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Water source */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                  {t(lang, "water_source")}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {WATER_SOURCES.map((w) => (
                    <PillBtn
                      key={w.value}
                      selected={waterSource === w.value}
                      onClick={() => setWaterSource(w.value)}
                    >
                      <span style={{ fontSize: 14 }}>{w.emoji}</span>
                      {t(lang, w.labelKey)}
                    </PillBtn>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 5 — Crops
          ════════════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className="onboarding-step">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                {t(lang, "step5title")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                {t(lang, "step_x_of_y", { x: "5", y: String(TOTAL_STEPS) })} · {t(lang, "crop_subtitle")}
              </p>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  placeholder={t(lang, "search_crops")}
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                />
              </div>

              {/* Category filter */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {["All", ...CROP_CATEGORIES].map((cat) => (
                  <PillBtn
                    key={cat}
                    selected={cropCategory === cat}
                    onClick={() => setCropCategory(cat)}
                  >
                    {t(lang, cat.toLowerCase())}
                  </PillBtn>
                ))}
              </div>

              {/* Crop grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, maxHeight: 280, overflowY: "auto", paddingRight: 4, marginBottom: 20 }}>
                {filteredCrops.map((crop) => {
                  const sel = selectedCrops.includes(crop.name);
                  return (
                    <button
                      key={crop.name}
                      type="button"
                      onClick={() => toggleCrop(crop.name)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                        padding: "10px 8px", borderRadius: 12,
                        border: `2px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                        background: sel ? "var(--accent-light)" : "var(--bg)",
                        cursor: "pointer", transition: "all 150ms ease",
                        position: "relative",
                      }}
                    >
                      {sel && (
                        <span style={{
                          position: "absolute", top: 5, right: 5, width: 16, height: 16,
                          borderRadius: "50%", background: "var(--accent)", color: "#fff",
                          fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✓</span>
                      )}
                      <span style={{ fontSize: 22 }}>{crop.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sel ? "var(--accent-hover)" : "var(--text-primary)", textAlign: "center", lineHeight: 1.2 }}>
                        {crop.name}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 500 }}>{crop.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected summary */}
              {selectedCrops.length > 0 && (
                <div style={{ padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                    {t(lang, "selected")} ({selectedCrops.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedCrops.map((c) => (
                      <span
                        key={c}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 12, fontWeight: 600, padding: "3px 8px",
                          borderRadius: 999, background: "var(--accent)", color: "#fff",
                        }}
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => toggleCrop(c)}
                          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary crop */}
              {selectedCrops.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                    {t(lang, "primary_crop")}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedCrops.map((c) => (
                      <PillBtn key={c} selected={primaryCrop === c} onClick={() => setPrimaryCrop(c)}>
                        {CROPS.find((cr) => cr.name === c)?.emoji ?? "🌱"} {c}
                      </PillBtn>
                    ))}
                  </div>
                </div>
              )}

              {/* Sowing date */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "sowing_date")} {primaryCrop || t(lang, "primary_crop")} <span style={{ fontWeight: 400, textTransform: "none" }}>{t(lang, "optional")}</span>
                </label>
                <input
                  type="date"
                  className="input"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Growth stage */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 10 }}>
                  {t(lang, "growth_stage")}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {GROWTH_STAGES.map((g) => (
                    <PillBtn key={g.value} selected={growthStage === g.value} onClick={() => setGrowthStage(g.value)}>
                      {t(lang, g.labelKey)}
                    </PillBtn>
                  ))}
                </div>
              </div>

              {/* Current issue */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  {t(lang, "current_problem")} <span style={{ fontWeight: 400, textTransform: "none" }}>{t(lang, "optional")}</span>
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder={t(lang, "problem_placeholder")}
                  value={currentIssue}
                  onChange={(e) => setCurrentIssue(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              {/* Error */}
              {submitError && (
                <div style={{ padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 10, marginTop: 14 }}>
                  <p style={{ fontSize: 13, color: "var(--danger)" }}>{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 6 — Success
          ════════════════════════════════════════════════════════════════════ */}
          {step === 6 && (
            <div className="animate-bounce-in" style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "linear-gradient(135deg, #D97706, #15803D)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, margin: "0 auto 24px",
                boxShadow: "0 8px 28px rgba(217,119,6,0.35)",
              }}>
                🌾
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.4px" }}>
                {t(lang, "welcome_name", { name: name || "Farmer" })}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
                {t(lang, "profile_setup", { crop: primaryCrop, location: locationLabel || "your area" })}
              </p>

              {/* Summary card */}
              <div style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px", marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 12 }}>
                  {t(lang, "farm_summary")}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <SummaryRow emoji="📍" label={t(lang, "sum_location")} value={locationLabel || "Anand, Gujarat"} />
                  <SummaryRow emoji="🌱" label={t(lang, "sum_primary")} value={primaryCrop} />
                  <SummaryRow emoji="📐" label={t(lang, "sum_area")} value={`${areaAcres} ${t(lang, "acres")}`} />
                  <SummaryRow emoji="⬛" label={t(lang, "sum_soil")} value={t(lang, SOIL_TYPES.find(s => s.value === soilType)?.labelKey || soilType)} />
                  <SummaryRow emoji="💧" label={t(lang, "sum_water")} value={t(lang, WATER_SOURCES.find(w => w.value === waterSource)?.labelKey || waterSource)} />
                  <SummaryRow emoji="🌾" label={t(lang, "sum_all_crops")} value={selectedCrops.join(", ")} />
                </div>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary"
                style={{ width: "100%", fontSize: 16, padding: "14px 24px", borderRadius: 12 }}
              >
                {t(lang, "finish")} 🚜
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom nav bar ────────────────────────────────────────────────────── */}
      {step > 1 && step <= TOTAL_STEPS && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(255,251,245,0.97)", backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border)",
          padding: "14px 20px",
          paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
          display: "flex", gap: 10, zIndex: 100,
        }}>
          <div style={{ maxWidth: 540, width: "100%", margin: "0 auto", display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary"
              style={{ flex: "0 0 80px" }}
            >
              ← {t(lang, "back")}
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={advance}
                className="btn-primary"
                disabled={!canProceed()}
                style={{ flex: 1 }}
              >
                {t(lang, "next")} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="btn-primary"
                disabled={submitting || !canProceed()}
                style={{ flex: 1 }}
              >
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin-slow 0.8s linear infinite" }} />
                    {t(lang, "saving")}
                  </span>
                ) : (
                  `${t(lang, "finish")} 🚜`
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary row helper ─────────────────────────────────────────────────────────

function SummaryRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", flexShrink: 0, minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{value}</span>
    </div>
  );
}
