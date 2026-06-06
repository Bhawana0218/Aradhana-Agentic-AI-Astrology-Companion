import logging
import math
from datetime import datetime

import ephem
import geopy.geocoders
import pytz
from geopy.geocoders import Nominatim
from langchain_core.tools import tool
from timezonefinder import TimezoneFinder

from rag.retriever import load_retriever

logger = logging.getLogger(__name__)

PLANET_NAMES = [
    ("Sun", ephem.Sun),
    ("Moon", ephem.Moon),
    ("Mercury", ephem.Mercury),
    ("Venus", ephem.Venus),
    ("Mars", ephem.Mars),
    ("Jupiter", ephem.Jupiter),
    ("Saturn", ephem.Saturn),
    ("Uranus", ephem.Uranus),
    ("Neptune", ephem.Neptune),
    ("Pluto", ephem.Pluto),
]

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]


def _degree_to_sign(deg: float) -> tuple[str, float]:
    deg = deg % 360
    sign_index = int(deg // 30)
    deg_in_sign = round(deg % 30, 2)
    return SIGN_NAMES[sign_index], deg_in_sign


def _compute_planets(observer: ephem.Observer) -> list[dict]:
    results = []
    for name, cls in PLANET_NAMES:
        body = cls()
        try:
            body.compute(observer)
            ecl = ephem.Ecliptic(body)
            lon_deg = math.degrees(float(ecl.lon))
            sign_name, deg_in_sign = _degree_to_sign(lon_deg)
            results.append({
                "name": name,
                "longitude": round(lon_deg, 2),
                "sign": sign_name,
                "degree": deg_in_sign,
            })
        except Exception as e:
            logger.warning(f"Failed to compute {name}: {e}")
            results.append({
                "name": name,
                "longitude": 0.0,
                "sign": "Unknown",
                "degree": 0.0,
            })
    return results


MEAN_OBLIQUITY = 23.4372  # degrees — mean obliquity of the ecliptic (J2000)


def _compute_houses(jd: float, lat: float, lon: float) -> tuple[list[dict], dict, dict]:
    ramc = (jd - 2451545.0) * 360.98564736629 % 360
    obl = math.radians(MEAN_OBLIQUITY)

    mc_lon = math.degrees(math.atan2(
        math.sin(math.radians(ramc)),
        math.cos(math.radians(ramc)) * math.cos(obl)
    )) % 360
    mc_sign, mc_deg = _degree_to_sign(mc_lon)

    asc_lon = math.degrees(math.atan2(
        -math.sin(math.radians(ramc)),
        math.cos(math.radians(ramc)) * math.sin(obl) + math.tan(math.radians(lat)) * math.cos(obl)
    )) % 360
    asc_sign, asc_deg = _degree_to_sign(asc_lon)

    houses_list = []
    for i in range(12):
        cusp_lon = (asc_lon + i * 30) % 360
        h_sign, h_deg = _degree_to_sign(cusp_lon)
        houses_list.append({
            "house": i + 1,
            "cusp": round(cusp_lon, 2),
            "sign": h_sign,
            "degree": h_deg,
        })

    return (
        houses_list,
        {"sign": asc_sign, "degree": asc_deg, "longitude": round(asc_lon, 2)},
        {"sign": mc_sign, "degree": mc_deg, "longitude": round(mc_lon, 2)},
    )


@tool
def geocode_place(place_name: str) -> dict:
    """Resolve a place name to latitude, longitude, and timezone."""
    geopy.geocoders.options.default_user_agent = "astroagent-1.0"
    geolocator = Nominatim()
    try:
        location = geolocator.geocode(place_name, timeout=5)
        if location is None:
            return {"error": f"Could not find location: {place_name}", "place": place_name}
        tf = TimezoneFinder()
        tz = tf.timezone_at(lat=location.latitude, lng=location.longitude)
        if tz is None:
            tz = "UTC"
        return {
            "place": location.address,
            "lat": round(location.latitude, 6),
            "lon": round(location.longitude, 6),
            "timezone": tz,
        }
    except Exception as e:
        logger.exception("Geocode failed")
        return {"error": str(e), "place": place_name}


@tool
def compute_birth_chart(date: str, time: str, lat: float, lon: float, timezone_str: str) -> dict:
    """Compute the full natal birth chart: planets positions, houses, ascendant, and midheaven."""
    try:
        year, month, day = map(int, date.split("-"))
        hour, minute = map(int, time.split(":"))
        tz = pytz.timezone(timezone_str)
        local_dt = tz.localize(datetime(year, month, day, hour, minute))
        utc_dt = local_dt.astimezone(pytz.UTC)

        observer = ephem.Observer()
        observer.lat = str(lat)
        observer.lon = str(lon)
        observer.date = utc_dt.strftime("%Y/%m/%d %H:%M:%S")

        jd = ephem.julian_date(utc_dt.strftime("%Y/%m/%d %H:%M:%S"))

        planets = _compute_planets(observer)
        houses, ascendant, midheaven = _compute_houses(jd, lat, lon)

        return {
            "planets": planets,
            "houses": houses,
            "ascendant": ascendant,
            "midheaven": midheaven,
        }
    except Exception as e:
        logger.exception("Birth chart computation failed")
        return {"error": str(e)}


MOON_PHASES = [
    ("New Moon", 0, 45),
    ("Waxing Crescent", 45, 90),
    ("First Quarter", 90, 135),
    ("Waxing Gibbous", 135, 180),
    ("Full Moon", 180, 225),
    ("Waning Gibbous", 225, 270),
    ("Last Quarter", 270, 315),
    ("Waning Crescent", 315, 360),
]


def _compute_moon_phase(date_str: str) -> dict:
    year, month, day = map(int, date_str.split("-"))
    obs = ephem.Observer()
    obs.date = f"{year}/{month}/{day} 12:00:00"
    moon = ephem.Moon()
    sun = ephem.Sun()
    moon.compute(obs)
    sun.compute(obs)
    sun_lon = math.degrees(float(ephem.Ecliptic(sun).lon))
    moon_lon = math.degrees(float(ephem.Ecliptic(moon).lon))
    diff = (moon_lon - sun_lon) % 360
    phase_name = "Unknown"
    for name, start, end in MOON_PHASES:
        if start <= diff < end:
            phase_name = name
            break
    illumination = float(moon.moon_phase) * 100
    return {
        "phase": phase_name,
        "illumination_pct": round(illumination, 1),
        "sun_moon_angle": round(diff, 1),
    }


@tool
def get_daily_transits(date: str = "", natal_chart: dict | None = None) -> dict:
    """Get current planetary positions, Moon phase, and aspects to your natal chart. Use this for any question about today's transits, Moon energy, planetary movements, or daily horoscope. Leave date empty for today."""
    try:
        if not date or date.lower() == "today":
            from datetime import datetime as dt
            date = dt.now().strftime("%Y-%m-%d")
        year, month, day = map(int, date.split("-"))

        observer = ephem.Observer()
        observer.lat = "0"
        observer.lon = "0"
        observer.date = f"{year}/{month}/{day} 12:00:00"

        transiting_planets = _compute_planets(observer)
        moon_phase = _compute_moon_phase(date)

        aspects_to_natal = []
        if natal_chart and natal_chart.get("planets"):
            natal_planets = {p["name"]: p["longitude"] for p in natal_chart["planets"]}
            aspect_defs = [
                ("conjunction", 8.0),
                ("opposition", 8.0),
                ("trine", 6.0),
                ("square", 6.0),
                ("sextile", 4.0),
            ]
            target_angles = {
                "conjunction": [0], "opposition": [180],
                "trine": [120], "square": [90], "sextile": [60],
            }
            for tp in transiting_planets:
                for natal_name, natal_lon in natal_planets.items():
                    diff = abs(tp["longitude"] - natal_lon)
                    diff = min(diff, 360 - diff)
                    for aspect_name, orb in aspect_defs:
                        for target in target_angles[aspect_name]:
                            if abs(diff - target) <= orb:
                                aspects_to_natal.append({
                                    "transiting_planet": tp["name"],
                                    "natal_planet": natal_name,
                                    "aspect": aspect_name,
                                    "orb": round(abs(diff - target), 2),
                                    "exact": round(diff, 2),
                                })
            aspects_to_natal.sort(key=lambda x: x["orb"])
            aspects_to_natal = aspects_to_natal[:20]

        return {
            "transiting_planets": transiting_planets,
            "moon_phase": moon_phase,
            "aspects_to_natal": aspects_to_natal,
            "date": date,
        }
    except Exception as e:
        logger.exception("Transits computation failed")
        return {"error": str(e)}


@tool
def knowledge_lookup(query: str) -> list[dict]:
    """Search the astrology knowledge base for relevant information."""
    try:
        retriever = load_retriever()
        if retriever is None:
            return [{"content": "Knowledge base not yet indexed.", "source": "system"}]
        docs = retriever.invoke(query)
        results = []
        seen = set()
        for d in docs:
            key = d.page_content[:80]
            if key not in seen:
                seen.add(key)
                results.append({
                    "content": d.page_content,
                    "source": d.metadata.get("source", "unknown"),
                })
        return results[:4]
    except Exception as e:
        logger.exception("Knowledge lookup failed")
        return [{"content": f"Lookup error: {str(e)}", "source": "system"}]
