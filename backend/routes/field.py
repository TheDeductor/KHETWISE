from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.supabase_client import get_supabase

router = APIRouter()


class FieldRegisterRequest(BaseModel):
    # Core (original)
    crop: str
    latitude: float
    longitude: float
    area_acres: float
    user_name: str
    # Extended (onboarding Phase 2)
    soil_type: Optional[str] = None
    water_source: Optional[str] = None
    farmer_type: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    num_plots: Optional[int] = None
    language: Optional[str] = "en"
    location_label: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    all_crops: Optional[str] = None      # comma-separated list
    growth_stage: Optional[str] = None
    sowing_date: Optional[str] = None
    current_issue: Optional[str] = None


@router.post("/field/register")
async def register_field(body: FieldRegisterRequest):
    sb = get_supabase()

    # Insert user (demo-grade: no auth)
    user_res = (
        sb.table("users")
        .insert({
            "name": body.user_name,
            **({"phone": body.phone} if body.phone else {}),
        })
        .execute()
    )
    user_id = user_res.data[0]["id"]

    # Build fields payload — only include non-None extras so schema stays flexible
    field_payload: dict = {
        "user_id":    user_id,
        "crop":       body.crop,
        "latitude":   body.latitude,
        "longitude":  body.longitude,
        "area_acres": body.area_acres,
    }
    extras = {
        "soil_type":        body.soil_type,
        "water_source":     body.water_source,
        "farmer_type":      body.farmer_type,
        "experience_years": body.experience_years,
        "num_plots":        body.num_plots,
        "language":         body.language,
        "location_label":   body.location_label,
        "state":            body.state,
        "district":         body.district,
        "all_crops":        body.all_crops,
        "growth_stage":     body.growth_stage,
        "sowing_date":      body.sowing_date,
        "current_issue":    body.current_issue,
    }
    for k, v in extras.items():
        if v is not None:
            field_payload[k] = v

    try:
        field_res = sb.table("fields").insert(field_payload).execute()
        field_id = field_res.data[0]["id"]
    except Exception:
        # If DB schema doesn't have new columns yet, fall back to core insert
        core_payload = {k: field_payload[k] for k in ["user_id", "crop", "latitude", "longitude", "area_acres"]}
        field_res = sb.table("fields").insert(core_payload).execute()
        field_id = field_res.data[0]["id"]

    return {"field_id": field_id, "message": "Field registered successfully"}


@router.get("/field/{field_id}")
async def get_field(field_id: str):
    sb = get_supabase()
    res = sb.table("fields").select("*").eq("id", field_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Field not found")
    f = res.data[0]
    return {
        "field_id":      f["id"],
        "crop":          f["crop"],
        "latitude":      f["latitude"],
        "longitude":     f["longitude"],
        "area_acres":    f["area_acres"],
        "soil_type":     f.get("soil_type"),
        "water_source":  f.get("water_source"),
        "farmer_type":   f.get("farmer_type"),
        "location_label":f.get("location_label"),
    }
