"""Open-Meteo weather fetcher — no API key required."""
import httpx
from typing import TypedDict


class DayForecast(TypedDict):
    date: str
    et0: float        # mm/day  (ET0 FAO evapotranspiration)
    rain: float       # mm/day  (precipitation sum)


async def get_7day_forecast(latitude: float, longitude: float) -> list[DayForecast]:
    """
    Fetches 7-day daily ET0 + precipitation from Open-Meteo.
    Returns list of 7 DayForecast dicts ordered day 0 … day 6.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "precipitation_sum,et0_fao_evapotranspiration",
        "timezone": "Asia/Kolkata",
        "forecast_days": 7,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    dates = data["daily"]["time"]
    et0s = data["daily"]["et0_fao_evapotranspiration"]
    rains = data["daily"]["precipitation_sum"]

    return [
        DayForecast(date=dates[i], et0=et0s[i] or 0.0, rain=rains[i] or 0.0)
        for i in range(7)
    ]
