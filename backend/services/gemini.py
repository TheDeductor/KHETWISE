"""All Gemini calls in one place — vision + text."""
import os
import json
import io
import re
from pathlib import Path
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env from backend/ or parent khetwise/ — works from any cwd
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
load_dotenv()  # fallback

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Use GEMINI_MODEL env var or default to the updated gemini-2.5-flash
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
_vision_model = genai.GenerativeModel(MODEL_NAME)
_text_model   = genai.GenerativeModel(MODEL_NAME)

def compress_image(file_bytes: bytes) -> bytes:
    """Resize to max 640×640 and re-encode as JPEG ~80 KB."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img.thumbnail((640, 640), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=70, optimize=True)
    return out.getvalue()


def analyze_disease(image_bytes: bytes, crop: str) -> dict:
    """
    Send compressed leaf image to Gemini Vision.
    Returns {"disease": str, "confidence": int, "treatment": str}
    """
    compressed = compress_image(image_bytes)

    prompt = (
        f'You are an expert agronomist. Analyze this {crop} leaf image. '
        f'Identify any disease. Respond ONLY in this JSON format, no other text:\n'
        f'{{"disease": "disease name or Healthy", "confidence": 0-100, '
        f'"treatment": "specific 2-3 step treatment"}}'
    )

    try:
        response = _vision_model.generate_content(
            [
                prompt,
                {"mime_type": "image/jpeg", "data": compressed},
            ],
            generation_config={"response_mime_type": "application/json"}
        )
        raw = response.text.strip()
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str or "exhausted" in err_str:
            return {
                "disease": "Service Busy",
                "confidence": 0,
                "treatment": "Gemini AI is temporarily rate-limited. Please wait a few minutes and try again.",
            }
        return {
            "disease": "Error",
            "confidence": 0,
            "treatment": "Could not connect to AI service. Please try again shortly.",
        }

    # Strip markdown code fences if Gemini wraps in ```json ... ```
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Graceful fallback
        return {
            "disease": "Unknown",
            "confidence": 0,
            "treatment": "Could not parse AI response. Please try again with a clearer image.",
        }


# Fallback answers keyed by language for when Gemini quota is exhausted
_FALLBACK: dict[str, str] = {
    "en": "I'm temporarily unavailable due to high demand. Please try again in a few minutes, or check the Disease, Irrigation, and Market tabs for detailed recommendations.",
    "hi": "अभी बहुत अधिक उपयोग के कारण मैं अनुपलब्ध हूँ। कुछ मिनट बाद पुनः प्रयास करें, या बीमारी, सिंचाई और बाज़ार टैब देखें।",
    "te": "ప్రస్తుతం అధిక వినియోగం కారణంగా నేను అందుబాటులో లేను. కొన్ని నిమిషాల తర్వాత మళ్ళీ ప్రయత్నించండి.",
    "ta": "தற்போது அதிக பயன்பாட்டால் நான் கிடைக்கவில்லை. சில நிமிடங்கள் கழித்து மீண்டும் முயற்சிக்கவும்.",
    "bn": "এখন অনেক বেশি ব্যবহারের কারণে আমি অনুপলব্ধ। কয়েক মিনিট পরে আবার চেষ্টা করুন।",
    "mr": "सध्या जास्त वापरामुळे मी उपलब्ध नाही. काही मिनिटांनंतर पुन्हा प्रयत्न करा.",
}


def ask_voice(query: str, language: str = "en") -> str:
    """
    Answer a farming question in 2-3 sentences.
    Responds in the same language as the query.
    Returns a graceful fallback if Gemini quota is exhausted or any error occurs.
    """
    system = (
        "You are Khetwise, a farming assistant for Indian farmers in Gujarat. "
        "Answer in exactly 2-3 sentences. Be specific with numbers when possible. "
        "Respond in the same language as the question."
    )

    try:
        response = _text_model.generate_content(
            f"{system}\n\nQuestion: {query}"
        )
        return response.text.strip()
    except Exception as e:
        err_str = str(e).lower()
        # Rate limit / quota exhausted (429 ResourceExhausted)
        if "429" in err_str or "quota" in err_str or "resource" in err_str or "exhausted" in err_str:
            return _FALLBACK.get(language, _FALLBACK["en"])
        # Any other Gemini error — return generic fallback
        return _FALLBACK.get(language, _FALLBACK["en"])
