import math
from fastapi import APIRouter, Query
from db.supabase_client import get_supabase

router = APIRouter()

ALERT_RADIUS_KM = 50.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in km between two lat/lon points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _dot_color(days_ago: int) -> str:
    if days_ago <= 7:
        return "red"
    if days_ago <= 14:
        return "yellow"
    return "green"


@router.get("/outbreaks")
async def get_outbreaks(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(100.0),
):
    sb = get_supabase()

    # All reports from last 30 days
    res = (
        sb.table("disease_reports")
        .select("disease, latitude, longitude, created_at, confidence")
        .gte("created_at", "now() - interval '30 days'")
        .execute()
    )

    outbreaks = []
    alert = False
    alert_message = None
    closest_alert: dict | None = None

    for row in res.data:
        dist = haversine_km(latitude, longitude, row["latitude"], row["longitude"])

        if dist > radius_km:
            continue

        # Days since report
        from datetime import datetime, timezone
        reported_at_str = row["created_at"].replace("Z", "+00:00")
        reported_at = datetime.fromisoformat(reported_at_str)
        now = datetime.now(timezone.utc)
        days_ago = (now - reported_at).days

        entry = {
            "disease": row["disease"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "distance_km": round(dist, 1),
            "reported_at": reported_at.strftime("%Y-%m-%d"),
            "days_ago": days_ago,
            "color": _dot_color(days_ago),
        }
        outbreaks.append(entry)

        if dist <= ALERT_RADIUS_KM:
            alert = True
            if closest_alert is None or dist < closest_alert["distance_km"]:
                closest_alert = entry

    if alert and closest_alert:
        alert_message = (
            f"{closest_alert['disease']} outbreak reported "
            f"{closest_alert['distance_km']} km from your field "
            f"{closest_alert['days_ago']} days ago. "
            f"Inspect your crop immediately."
        )

    # Sort by distance ascending
    outbreaks.sort(key=lambda x: x["distance_km"])

    return {
        "outbreaks": outbreaks,
        "alert": alert,
        "alert_message": alert_message,
    }
