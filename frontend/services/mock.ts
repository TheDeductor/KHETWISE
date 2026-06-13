import type {
  HealthData,
  NdviPoint,
  DiseaseResult,
  IrrigationData,
  MarketData,
  OutbreaksData,
} from "./api";

export const mockHealth: HealthData = {
  health_score: 68,
  ndvi: 0.58,
  status: "Stressed",
  stress_detected: true,
  stress_reason: "NDVI dropped 22% in 6 days",
};

export const mockNdviHistory: { history: NdviPoint[] } = {
  history: [
    { date: "Jun 7",  ndvi: 0.74 },
    { date: "Jun 9",  ndvi: 0.72 },
    { date: "Jun 11", ndvi: 0.65 },
    { date: "Jun 13", ndvi: 0.58 },
  ],
};

export const mockDiseaseResult: DiseaseResult = {
  disease: "Early Blight",
  confidence: 94,
  treatment:
    "Apply copper-based fungicide every 7 days. Remove infected leaves immediately. Ensure good air drainage between plants.",
  saved: true,
};

export const mockIrrigation: IrrigationData = {
  recommendation: "Do not irrigate today",
  reason: "Incoming rain covers full crop water requirement",
  water_saved_liters: 42483,
  money_saved_inr: 340,
  et0: 4.2,
  rain_expected_mm: 6.8,
  schedule: [
    { day: "Today",    action: "Skip",     reason: "Rain expected",          et0: 4.2, rain_mm: 6.8 },
    { day: "Tomorrow", action: "Skip",     reason: "Rain expected",          et0: 4.0, rain_mm: 4.2 },
    { day: "Day 3",    action: "Irrigate", reason: "No rain, high ET0",      et0: 5.1, rain_mm: 0.0 },
    { day: "Day 4",    action: "Skip",     reason: "Soil moisture sufficient",et0: 3.8, rain_mm: 0.0 },
    { day: "Day 5",    action: "Irrigate", reason: "ET0 exceeds rainfall",   et0: 4.9, rain_mm: 1.2 },
    { day: "Day 6",    action: "Skip",     reason: "Light rain expected",    et0: 3.2, rain_mm: 3.5 },
    { day: "Day 7",    action: "Irrigate", reason: "Dry conditions",         et0: 5.3, rain_mm: 0.0 },
  ],
};

export const mockMarket: MarketData = {
  crop: "Cotton",
  local_market: "Anand",
  local_price: 58,
  best_market: "Ahmedabad",
  best_price: 63,
  profit_increase: 5,
  total_extra_income: 18500,
  recommendation:
    "Sell in Ahmedabad. Extra ₹5/kg on 2.5 acres = ₹18,500 additional income.",
};

export const mockOutbreaks: OutbreaksData = {
  outbreaks: [
    {
      disease: "Armyworm",
      latitude: 22.71,
      longitude: 72.85,
      distance_km: 23,
      reported_at: "2025-06-10",
      days_ago: 3,
      color: "red",
    },
    {
      disease: "Early Blight",
      latitude: 22.48,
      longitude: 73.05,
      distance_km: 18,
      reported_at: "2025-06-08",
      days_ago: 5,
      color: "red",
    },
    {
      disease: "Powdery Mildew",
      latitude: 22.82,
      longitude: 72.96,
      distance_km: 40,
      reported_at: "2025-06-01",
      days_ago: 12,
      color: "yellow",
    },
  ],
  alert: true,
  alert_message:
    "Armyworm outbreak reported 23 km from your field 3 days ago. Inspect your crop immediately.",
};
