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

_vision_model = genai.GenerativeModel("models/gemini-2.5-flash")
_text_model   = genai.GenerativeModel("models/gemini-2.5-flash")


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

    response = _vision_model.generate_content(
        [
            prompt,
            {"mime_type": "image/jpeg", "data": compressed},
        ]
    )

    raw = response.text.strip()
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


def ask_voice(query: str, language: str = "en") -> str:
    """
    Answer a farming question in 2-3 sentences.
    Responds in the same language as the query.
    """
    system = (
        "You are Khetwise, a farming assistant for Indian farmers in Gujarat. "
        "Answer in exactly 2-3 sentences. Be specific with numbers when possible. "
        "Respond in the same language as the question."
    )

    response = _text_model.generate_content(
        f"{system}\n\nQuestion: {query}"
    )
    return response.text.strip()
