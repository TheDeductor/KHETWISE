from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.gemini import analyze_disease
from db.supabase_client import get_supabase

router = APIRouter()


@router.post("/disease/predict")
async def predict_disease(
    image: UploadFile = File(...),
    field_id: str = Form(...),
    crop: str = Form(...),
):
    # Read and validate file
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10 MB hard cap before compression
        raise HTTPException(status_code=400, detail="Image too large (max 10 MB)")

    # Call Gemini Vision
    result = analyze_disease(image_bytes, crop)

    # Fetch field coordinates for the outbreak record
    saved = False
    try:
        sb = get_supabase()
        field_res = sb.table("fields").select("latitude,longitude").eq("id", field_id).execute()

        if field_res.data:
            lat = field_res.data[0]["latitude"]
            lon = field_res.data[0]["longitude"]
        else:
            lat, lon = 22.564, 72.928  # Anand default

        if result.get("disease", "Healthy") != "Healthy":
            sb.table("disease_reports").insert(
                {
                    "field_id": field_id,
                    "disease": result["disease"],
                    "confidence": result["confidence"] / 100,
                    "treatment": result["treatment"],
                    "latitude": lat,
                    "longitude": lon,
                }
            ).execute()
            saved = True
    except Exception:
        # Don't fail the request if Supabase write fails
        pass

    return {
        "disease": result.get("disease", "Unknown"),
        "confidence": result.get("confidence", 0),
        "treatment": result.get("treatment", ""),
        "saved": saved,
    }
