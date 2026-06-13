from fastapi import APIRouter, Query

router = APIRouter()

# Static NDVI history — last reading has a deliberate stress drop (0.74 → 0.58 = 21.6% drop)
NDVI_HISTORY = [
    {"date": "Jun 7",  "ndvi": 0.74},
    {"date": "Jun 9",  "ndvi": 0.72},
    {"date": "Jun 11", "ndvi": 0.65},
    {"date": "Jun 13", "ndvi": 0.58},
]


def _compute_health(history: list[dict]) -> dict:
    prev = history[-2]["ndvi"]
    curr = history[-1]["ndvi"]
    drop_pct = (prev - curr) / prev * 100

    stress_detected = drop_pct > 15
    health_score = min(100, int(curr * 100 + 10))
    status = "Stressed" if stress_detected else ("Healthy" if curr >= 0.65 else "At Risk")
    stress_reason = (
        f"NDVI dropped {drop_pct:.0f}% in 6 days" if stress_detected else None
    )

    return {
        "health_score": health_score,
        "ndvi": curr,
        "status": status,
        "stress_detected": stress_detected,
        "stress_reason": stress_reason,
    }


@router.get("/health")
async def get_health(field_id: str = Query(...)):
    return _compute_health(NDVI_HISTORY)


@router.get("/ndvi-history")
async def get_ndvi_history(field_id: str = Query(...)):
    return {"history": NDVI_HISTORY}
