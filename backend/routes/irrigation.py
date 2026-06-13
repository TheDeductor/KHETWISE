from fastapi import APIRouter, Query, HTTPException
from services.weather import get_7day_forecast
from db.supabase_client import get_supabase

router = APIRouter()

CROP_FACTOR: dict[str, float] = {
    "Cotton": 1.2,
    "Tomato": 1.1,
    "Wheat": 0.9,
    "Rice": 1.3,
    "Maize": 1.0,
}

# Pump electricity cost per liter (₹)
COST_PER_LITER = 0.008

# mm → liters per acre conversion
MM_PER_ACRE_LITERS = 4046.86


def _day_label(i: int) -> str:
    if i == 0:
        return "Today"
    if i == 1:
        return "Tomorrow"
    return f"Day {i + 1}"


@router.get("/irrigation")
async def get_irrigation(field_id: str = Query(...)):
    # Fetch field info
    sb = get_supabase()
    field_res = sb.table("fields").select("*").eq("id", field_id).execute()

    if not field_res.data:
        raise HTTPException(status_code=404, detail="Field not found")

    field = field_res.data[0]
    lat: float = field["latitude"]
    lon: float = field["longitude"]
    area_acres: float = field["area_acres"]
    crop: str = field["crop"]

    crop_factor = CROP_FACTOR.get(crop, 1.0)

    forecast = await get_7day_forecast(lat, lon)

    schedule = []
    total_water_saved_liters = 0.0
    total_deficit_liters = 0.0

    for i, day in enumerate(forecast):
        et0 = day["et0"]
        rain = day["rain"]

        water_needed_mm = et0 * crop_factor
        deficit_mm = max(0.0, water_needed_mm - rain)

        if deficit_mm > 0:
            action = "Irrigate"
            reason = (
                "No rain, high ET0" if rain < 1
                else f"ET0 exceeds rainfall by {deficit_mm:.1f} mm"
            )
            total_deficit_liters += deficit_mm * area_acres * MM_PER_ACRE_LITERS
        else:
            action = "Skip"
            saved_mm = min(rain, water_needed_mm)
            reason = (
                "Rain expected" if rain > 1
                else "Soil moisture sufficient"
            )
            total_water_saved_liters += saved_mm * area_acres * MM_PER_ACRE_LITERS

        schedule.append(
            {
                "day": _day_label(i),
                "action": action,
                "reason": reason,
                "et0": round(et0, 1),
                "rain_mm": round(rain, 1),
            }
        )

    # Today's logic drives the headline recommendation
    today = schedule[0]
    if today["action"] == "Skip":
        recommendation = "Do not irrigate today"
        reason_headline = today["reason"]
    else:
        recommendation = "Irrigate today"
        reason_headline = today["reason"]

    money_saved = round(total_water_saved_liters * COST_PER_LITER)

    return {
        "recommendation": recommendation,
        "reason": reason_headline,
        "water_saved_liters": round(total_water_saved_liters),
        "money_saved_inr": money_saved,
        "et0": round(forecast[0]["et0"], 1),
        "rain_expected_mm": round(forecast[0]["rain"], 1),
        "schedule": schedule,
    }
