"""
seed.py — Run once before demo to populate realistic outbreak data around Gujarat.

Usage:
    cd backend
    python seed.py
"""
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

sb = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

# Base: Anand, Gujarat (22.5645, 72.9289)
# Seed 10 realistic disease reports at varying distances and dates
SEED_REPORTS = [
    # Red dots — last 7 days (will trigger alert)
    {
        "disease": "Armyworm",
        "latitude": 22.71,
        "longitude": 72.85,
        "confidence": 0.91,
        "treatment": "Apply chlorpyrifos 2ml/L. Check undersides of leaves at dusk.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
    },
    {
        "disease": "Early Blight",
        "latitude": 22.48,
        "longitude": 73.05,
        "confidence": 0.87,
        "treatment": "Apply copper-based fungicide every 7 days. Remove infected leaves.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
    },
    {
        "disease": "Aphids",
        "latitude": 22.62,
        "longitude": 72.78,
        "confidence": 0.94,
        "treatment": "Spray neem oil solution 5ml/L. Repeat after 10 days.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
    },
    # Yellow dots — 8–14 days ago
    {
        "disease": "Powdery Mildew",
        "latitude": 22.82,
        "longitude": 72.96,
        "confidence": 0.83,
        "treatment": "Apply sulfur-based fungicide. Ensure good air circulation.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
    },
    {
        "disease": "Leaf Curl Virus",
        "latitude": 22.40,
        "longitude": 72.75,
        "confidence": 0.79,
        "treatment": "Remove infected plants. Control whitefly vectors with imidacloprid.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat(),
    },
    {
        "disease": "Bollworm",
        "latitude": 22.55,
        "longitude": 73.20,
        "confidence": 0.88,
        "treatment": "Use pheromone traps. Apply spinosad 45% SC at 0.1ml/L.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=9)).isoformat(),
    },
    # Green dots — older than 14 days (background context)
    {
        "disease": "Root Rot",
        "latitude": 22.95,
        "longitude": 72.60,
        "confidence": 0.76,
        "treatment": "Reduce irrigation frequency. Apply Trichoderma viride to soil.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat(),
    },
    {
        "disease": "Thrips",
        "latitude": 22.30,
        "longitude": 73.10,
        "confidence": 0.81,
        "treatment": "Apply fipronil 5% SC at 1.5ml/L. Install blue sticky traps.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=18)).isoformat(),
    },
    {
        "disease": "Bacterial Blight",
        "latitude": 22.68,
        "longitude": 73.35,
        "confidence": 0.85,
        "treatment": "Apply copper oxychloride 3g/L. Avoid overhead irrigation.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat(),
    },
    {
        "disease": "Whitefly",
        "latitude": 22.44,
        "longitude": 72.65,
        "confidence": 0.89,
        "treatment": "Yellow sticky traps + imidacloprid spray. Inspect weekly.",
        "field_id": None,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=22)).isoformat(),
    },
]


def seed():
    print("Seeding disease_reports table...")
    # Clear existing seed data (optional — comment out to preserve real data)
    # sb.table("disease_reports").delete().is_("field_id", "null").execute()

    for report in SEED_REPORTS:
        res = sb.table("disease_reports").insert(report).execute()
        print(f"  ✓ {report['disease']} @ ({report['latitude']}, {report['longitude']})")

    print(f"\nDone. {len(SEED_REPORTS)} outbreak records seeded.")
    print("Run GET /api/outbreaks?latitude=22.564&longitude=72.928&radius_km=100 to verify.")


if __name__ == "__main__":
    seed()
