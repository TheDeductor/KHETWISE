from fastapi import APIRouter, Query

router = APIRouter()

# ── Official Kharif 2026-27 MSP (₹/quintal) — Govt of India, DES Notification May 2026
# Source: desagri.gov.in/notification-type/kharif/
# 1 quintal = 100 kg, so divide by 100 for ₹/kg
MSP_PER_QUINTAL: dict[str, float] = {
    "Rice":       2300,   # ₹23.00/kg
    "Jowar":      3371,   # ₹33.71/kg
    "Bajra":      2625,   # ₹26.25/kg
    "Maize":      2090,   # ₹20.90/kg
    "Cotton":     7121,   # ₹71.21/kg (medium staple)
    "Groundnut":  6783,   # ₹67.83/kg
    "Soybean":    4892,   # ₹48.92/kg
    "Sunflower":  7280,   # ₹72.80/kg
    "Wheat":      2425,   # ₹24.25/kg (Rabi 2025-26)
    "Sugarcane":  340,    # ₹3.40/kg (FRP)
    "Tomato":     None,   # Horticulture - no MSP
}

MARKET_DATA: dict[str, dict] = {
    "Cotton": {
        "local_market": "Anand",
        "local_price": 58,
        "best_market": "Ahmedabad",
        "best_price": 63,
        # Seasonal trend: Cotton peaks post-harvest (Oct-Jan), dips in monsoon
        "trend_pattern": [0.88, 0.91, 0.94, 0.97, 1.03, 1.01, 1.00],
    },
    "Tomato": {
        "local_market": "Anand",
        "local_price": 18,
        "best_market": "Ahmedabad APMC",
        "best_price": 24,
        # Volatile: tomato swings wildly, rising trend shown
        "trend_pattern": [0.60, 0.70, 0.78, 0.85, 0.95, 1.10, 1.00],
    },
    "Wheat": {
        "local_market": "Anand",
        "local_price": 22,
        "best_market": "Surat",
        "best_price": 26,
        # Post-harvest dip, recovering
        "trend_pattern": [1.05, 1.03, 1.01, 0.99, 0.97, 0.98, 1.00],
    },
    "Rice": {
        "local_market": "Anand",
        "local_price": 23,
        "best_market": "Ahmedabad",
        "best_price": 27,
        # Steady with slight upward
        "trend_pattern": [0.94, 0.95, 0.96, 0.97, 0.99, 1.00, 1.00],
    },
    "Maize": {
        "local_market": "Anand",
        "local_price": 19,
        "best_market": "Vadodara",
        "best_price": 22,
        "trend_pattern": [0.93, 0.95, 0.96, 0.98, 1.01, 1.00, 1.00],
    },
    "Groundnut": {
        "local_market": "Rajkot",
        "local_price": 55,
        "best_market": "Gondal APMC",
        "best_price": 61,
        "trend_pattern": [0.90, 0.92, 0.95, 0.97, 1.02, 1.01, 1.00],
    },
    "Soybean": {
        "local_market": "Anand",
        "local_price": 41,
        "best_market": "Indore",
        "best_price": 46,
        "trend_pattern": [0.91, 0.93, 0.95, 0.98, 1.02, 1.01, 1.00],
    },
    "Sugarcane": {
        "local_market": "Local Mill",
        "local_price": 3.20,
        "best_market": "Cooperative Mill",
        "best_price": 3.60,
        "trend_pattern": [0.95, 0.96, 0.97, 0.98, 0.99, 1.00, 1.00],
    },
}

# Quintal per acre (realistic estimates)
YIELD_PER_ACRE: dict[str, float] = {
    "Cotton":    4.0,
    "Tomato":   80.0,
    "Wheat":    18.0,
    "Rice":     20.0,
    "Maize":    22.0,
    "Groundnut": 8.0,
    "Soybean":  10.0,
    "Sugarcane": 300.0,
}

DEFAULT_AREA_ACRES = 2.5


@router.get("/market")
async def get_market(crop: str = Query(...), area_acres: float = Query(DEFAULT_AREA_ACRES)):
    data = MARKET_DATA.get(crop)
    if not data:
        crop = "Cotton"
        data = MARKET_DATA["Cotton"]

    local_price = data["local_price"]
    best_price  = data["best_price"]

    profit_per_kg   = best_price - local_price
    yield_quintals  = YIELD_PER_ACRE.get(crop, 4) * area_acres
    yield_kg        = yield_quintals * 100  # 1 quintal = 100 kg
    total_extra_income = profit_per_kg * yield_kg

    # ── Realistic per-crop seasonal price trend ──────────────────────────────
    pattern      = data.get("trend_pattern", [0.94, 0.95, 0.97, 0.99, 1.01, 1.00, 1.00])
    price_trend  = [round(local_price * p, 2) for p in pattern]

    # ── Best-time-to-sell logic ──────────────────────────────────────────────
    last_3       = price_trend[-3:]
    rising       = last_3[-1] > last_3[0]
    peaked       = price_trend[-2] > price_trend[-1]

    if peaked:
        best_time_to_sell = "⚡ Sell Now — Price Peaked"
        badge_color       = "green"
    elif rising:
        best_time_to_sell = "⏳ Wait 2–3 Days — Price Rising"
        badge_color       = "yellow"
    else:
        best_time_to_sell = "✅ Stable — Sell Anytime"
        badge_color       = "green"

    # ── MSP comparison ───────────────────────────────────────────────────────
    msp_per_quintal = MSP_PER_QUINTAL.get(crop)
    msp_per_kg      = round(msp_per_quintal / 100, 2) if msp_per_quintal else None

    if msp_per_kg:
        msp_diff_pct = round(((local_price - msp_per_kg) / msp_per_kg) * 100, 1)
        if local_price < msp_per_kg:
            msp_status  = "below"
            msp_message = (
                f"⚠️ Current price ₹{local_price}/kg is ₹{round(msp_per_kg - local_price, 2)} "
                f"BELOW government MSP (₹{msp_per_kg}/kg). "
                f"You are legally entitled to sell at MSP. Contact your nearest APMC or government procurement center."
            )
        elif msp_diff_pct > 20:
            msp_status  = "great"
            msp_message = (
                f"🎉 Excellent! Current price is {msp_diff_pct}% ABOVE MSP. "
                f"Great time to sell — you're earning well above the government floor."
            )
        else:
            msp_status  = "above"
            msp_message = (
                f"✅ Current price is {msp_diff_pct}% above government MSP (₹{msp_per_kg}/kg). "
                f"MSP is your safety floor — market is paying you fairly."
            )
    else:
        msp_per_kg  = None
        msp_diff_pct = None
        msp_status  = "none"
        msp_message = "No MSP set by government for this crop (horticulture crops are market-linked)."

    # ── Distance & transport ─────────────────────────────────────────────────
    mandi_distance_km    = 45.0
    transport_rate       = 0.05  # ₹/km/kg
    transport_cost_inr   = mandi_distance_km * yield_kg * transport_rate
    net_extra_income     = total_extra_income - transport_cost_inr

    recommendation = (
        f"Sell in {data['best_market']}. "
        f"Extra ₹{profit_per_kg}/kg on {area_acres} acres = "
        f"₹{total_extra_income:,.0f} additional income "
        f"(net after transport: ₹{net_extra_income:,.0f})."
    )

    return {
        "crop":                crop,
        "local_market":        data["local_market"],
        "local_price":         local_price,
        "best_market":         data["best_market"],
        "best_price":          best_price,
        "profit_increase":     profit_per_kg,
        "total_extra_income":  round(total_extra_income),
        "recommendation":      recommendation,
        # Market Intelligence
        "price_trend":         price_trend,
        "best_time_to_sell":   best_time_to_sell,
        "sell_badge_color":    badge_color,
        # MSP
        "msp_per_kg":          msp_per_kg,
        "msp_per_quintal":     msp_per_quintal,
        "msp_diff_pct":        msp_diff_pct,
        "msp_status":          msp_status,
        "msp_message":         msp_message,
        # Transport
        "mandi_distance_km":   mandi_distance_km,
        "transport_cost_inr":  round(transport_cost_inr),
        "net_extra_income":    round(net_extra_income),
    }
