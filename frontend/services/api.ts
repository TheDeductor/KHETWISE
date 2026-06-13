const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

// ── Field ──────────────────────────────────────────────────────────────────
export interface RegisterFieldPayload {
  crop: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  user_name: string;
}

export async function registerField(payload: RegisterFieldPayload) {
  return apiFetch<{ field_id: string; message: string }>("/api/field/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getField(fieldId: string) {
  return apiFetch<{
    field_id: string;
    crop: string;
    latitude: number;
    longitude: number;
    area_acres: number;
  }>(`/api/field/${fieldId}`);
}

// ── Health ─────────────────────────────────────────────────────────────────
export interface HealthData {
  health_score: number;
  ndvi: number;
  status: string;
  stress_detected: boolean;
  stress_reason: string | null;
}

export async function getHealth(fieldId: string): Promise<HealthData> {
  return apiFetch<HealthData>(`/api/health?field_id=${fieldId}`);
}

export interface NdviPoint { date: string; ndvi: number }

export async function getNdviHistory(fieldId: string): Promise<{ history: NdviPoint[] }> {
  return apiFetch<{ history: NdviPoint[] }>(`/api/ndvi-history?field_id=${fieldId}`);
}

// ── Disease ────────────────────────────────────────────────────────────────
export interface DiseaseResult {
  disease: string;
  confidence: number;
  treatment: string;
  saved: boolean;
}

export async function predictDisease(
  image: File,
  fieldId: string,
  crop: string
): Promise<DiseaseResult> {
  const form = new FormData();
  form.append("image", image);
  form.append("field_id", fieldId);
  form.append("crop", crop);
  return apiFetch<DiseaseResult>("/api/disease/predict", { method: "POST", body: form });
}

// ── Irrigation ─────────────────────────────────────────────────────────────
export interface IrrigationDay {
  day: string;
  action: "Irrigate" | "Skip";
  reason: string;
  et0: number;
  rain_mm: number;
}

export interface IrrigationData {
  recommendation: string;
  reason: string;
  water_saved_liters: number;
  money_saved_inr: number;
  et0: number;
  rain_expected_mm: number;
  schedule: IrrigationDay[];
}

export async function getIrrigation(fieldId: string): Promise<IrrigationData> {
  return apiFetch<IrrigationData>(`/api/irrigation?field_id=${fieldId}`);
}

// ── Market ─────────────────────────────────────────────────────────────────
export interface MarketData {
  crop: string;
  local_market: string;
  local_price: number;
  best_market: string;
  best_price: number;
  profit_increase: number;
  total_extra_income: number;
  recommendation: string;
}

export async function getMarket(crop: string, areaAcres = 2.5): Promise<MarketData> {
  return apiFetch<MarketData>(`/api/market?crop=${crop}&area_acres=${areaAcres}`);
}

// ── Voice ──────────────────────────────────────────────────────────────────
export async function voiceQuery(query: string, language = "en"): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>("/api/voice/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
}

// ── Outbreaks ──────────────────────────────────────────────────────────────
export interface OutbreakPoint {
  disease: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  reported_at: string;
  days_ago: number;
  color: "red" | "yellow" | "green";
}

export interface OutbreaksData {
  outbreaks: OutbreakPoint[];
  alert: boolean;
  alert_message: string | null;
}

export async function getOutbreaks(
  latitude: number,
  longitude: number,
  radiusKm = 100
): Promise<OutbreaksData> {
  return apiFetch<OutbreaksData>(
    `/api/outbreaks?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
  );
}
