// ── Onboarding data shape ──────────────────────────────────────────────────────

export interface OnboardingData {
  // Step 1
  language: string;          // "en" | "hi" | "te" | "ta" | "bn" | "mr"

  // Step 2
  user_name: string;
  farmer_type: string;       // "Smallholder" | "Commercial" | "Cooperative"
  experience_years: number;
  phone: string;             // optional

  // Step 3
  latitude: number;
  longitude: number;
  location_label: string;    // human-readable: "Anand, Gujarat"
  state: string;
  district: string;

  // Step 4
  area_acres: number;
  soil_type: string;
  water_source: string;
  num_plots: number;

  // Step 5
  crops: string[];           // multi-select
  primary_crop: string;
  sowing_date: string;       // ISO date string
  growth_stage: string;
  current_issue: string;
}

const KEY = "kw_onboarding";
const COMPLETE_KEY = "onboarding_complete";
const FIELD_KEY = "field_id";

// ── Persist step data (partial save — user can go back) ───────────────────────

export function saveOnboardingStep(partial: Partial<OnboardingData>): void {
  if (typeof window === "undefined") return;
  const existing = getOnboardingData();
  const merged = { ...existing, ...partial };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

// ── Read all saved onboarding data ─────────────────────────────────────────────

export function getOnboardingData(): Partial<OnboardingData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ── Commit final data to all localStorage keys used by app ────────────────────

export function commitOnboarding(data: OnboardingData, fieldId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY,               JSON.stringify(data));
  localStorage.setItem(COMPLETE_KEY,      "true");
  localStorage.setItem(FIELD_KEY,         fieldId);
  localStorage.setItem("user_name",       data.user_name);
  localStorage.setItem("field_crop",      data.primary_crop);
  localStorage.setItem("field_area",      String(data.area_acres));
  localStorage.setItem("field_lat",       String(data.latitude));
  localStorage.setItem("field_lon",       String(data.longitude));
  localStorage.setItem("kw_language",     data.language);
  localStorage.setItem("soil_type",       data.soil_type);
  localStorage.setItem("water_source",    data.water_source);
  localStorage.setItem("location_label",  data.location_label);
}

// ── Reset everything ──────────────────────────────────────────────────────────

export function clearOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.clear();
}

// ── Check if complete ─────────────────────────────────────────────────────────

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COMPLETE_KEY) === "true";
}
