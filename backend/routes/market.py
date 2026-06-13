from fastapi import APIRouter, Query

router = APIRouter()

MARKET_DATA: dict[str, dict] = {
    "Cotton": {
        "local_market": "Anand",
        "local_price": 58,
        "best_market": "Ahmedabad",
        "best_price": 63,
    },
    "Tomato": {
        "local_market": "Anand",
        "local_price": 38,
        "best_market": "Ahmedabad",
        "best_price": 42,
    },
    "Wheat": {
        "local_market": "Anand",
        "local_price": 22,
        "best_market": "Surat",
        "best_price": 26,
    },
    "Rice": {
        "local_market": "Anand",
        "local_price": 32,
        "best_market": "Ahmedabad",
        "best_price": 36,
    },
    "Maize": {
        "local_market": "Anand",
        "local_price": 19,
        "best_market": "Vadodara",
        "best_price": 22,
    },
}

# Quintal per acre
YIELD_PER_ACRE: dict[str, float] = {
    "Cotton": 4,
    "Tomato": 80,
    "Wheat": 18,
    "Rice": 25,
    "Maize": 22,
}

DEFAULT_AREA_ACRES = 2.5


@router.get("/market")
async def get_market(crop: str = Query(...), area_acres: float = Query(DEFAULT_AREA_ACRES)):
    data = MARKET_DATA.get(crop)
    if not data:
        # Return first entry as fallback
        crop = "Cotton"
        data = MARKET_DATA["Cotton"]

    profit_per_kg = data["best_price"] - data["local_price"]
    yield_quintals = YIELD_PER_ACRE.get(crop, 4) * area_acres
    yield_kg = yield_quintals * 100  # 1 quintal = 100 kg
    total_extra_income = profit_per_kg * yield_kg

    recommendation = (
        f"Sell in {data['best_market']}. "
        f"Extra ₹{profit_per_kg}/kg on {area_acres} acres = "
        f"₹{total_extra_income:,.0f} additional income."
    )

    return {
        "crop": crop,
        "local_market": data["local_market"],
        "local_price": data["local_price"],
        "best_market": data["best_market"],
        "best_price": data["best_price"],
        "profit_increase": profit_per_kg,
        "total_extra_income": round(total_extra_income),
        "recommendation": recommendation,
    }
