from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.supabase_client import get_supabase

router = APIRouter()


class FieldRegisterRequest(BaseModel):
    crop: str
    latitude: float
    longitude: float
    area_acres: float
    user_name: str


@router.post("/field/register")
async def register_field(body: FieldRegisterRequest):
    sb = get_supabase()

    # Upsert user by name (demo-grade: no auth yet)
    user_res = (
        sb.table("users")
        .insert({"name": body.user_name})
        .execute()
    )
    user_id = user_res.data[0]["id"]

    field_res = (
        sb.table("fields")
        .insert(
            {
                "user_id": user_id,
                "crop": body.crop,
                "latitude": body.latitude,
                "longitude": body.longitude,
                "area_acres": body.area_acres,
            }
        )
        .execute()
    )
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
        "field_id": f["id"],
        "crop": f["crop"],
        "latitude": f["latitude"],
        "longitude": f["longitude"],
        "area_acres": f["area_acres"],
    }
