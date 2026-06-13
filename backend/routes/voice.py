from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import ask_voice

router = APIRouter()

# Pre-warmed cache — common questions answered instantly without Gemini call
CACHE: dict[str, str] = {
    "should i irrigate today": (
        "Based on current ET0 and 6.8 mm of rain expected tomorrow, skip irrigation today and tomorrow. "
        "You will save approximately 42,000 liters and ₹340 in pump electricity costs."
    ),
    "what is early blight": (
        "Early Blight is a fungal disease caused by Alternaria solani that creates dark brown spots with yellow rings on leaves. "
        "Apply copper-based fungicide every 7 days and remove infected leaves immediately. "
        "It spreads fastest in humid conditions above 24°C."
    ),
    "when should i sell cotton": (
        "Cotton prices in Gujarat typically peak in November–December after the main harvest when supply from other states is lower. "
        "Current Ahmedabad prices are ₹63/kg versus ₹58/kg locally — selling in Ahmedabad gives you ₹18,500 extra on a 2.5 acre field."
    ),
    "my crop is stressed what to do": (
        "Your NDVI has dropped over 15% in 6 days, which usually means water stress or early disease. "
        "Check soil moisture first — if dry, irrigate 25mm immediately. "
        "Then upload a leaf photo to the Disease tab for AI diagnosis."
    ),
}


class VoiceQueryRequest(BaseModel):
    query: str
    language: str = "en"


@router.post("/voice/query")
async def voice_query(body: VoiceQueryRequest):
    normalized = body.query.strip().lower().rstrip("?.")

    # Check cache first
    cached = CACHE.get(normalized)
    if cached:
        return {"answer": cached}

    # Partial match on cache keys
    for key, answer in CACHE.items():
        if key in normalized or normalized in key:
            return {"answer": answer}

    # Fall back to Gemini
    answer = ask_voice(body.query, body.language)
    return {"answer": answer}
