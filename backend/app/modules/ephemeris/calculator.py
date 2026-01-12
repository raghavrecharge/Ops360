import swisseph as swe
import os
from datetime import datetime, timezone
from typing import Dict, List, Tuple
import math
from app.core.config import settings

# Initialize Swiss Ephemeris
if not os.path.exists(settings.EPHEMERIS_PATH):
    os.makedirs(settings.EPHEMERIS_PATH)
swe.set_ephe_path(settings.EPHEMERIS_PATH)

# Ayanamsa mapping
AYANAMSA_MAP = {
    "LAHIRI": swe.SIDM_LAHIRI,
    "RAMAN": swe.SIDM_RAMAN,
    "KP": swe.SIDM_KRISHNAMURTI,
    "YUKTESHWAR": swe.SIDM_YUKTESHWAR
}

# Planet constants
PLANETS = {
    "SUN": swe.SUN,
    "MOON": swe.MOON,
    "MERCURY": swe.MERCURY,
    "VENUS": swe.VENUS,
    "MARS": swe.MARS,
    "JUPITER": swe.JUPITER,
    "SATURN": swe.SATURN,
    "RAHU": swe.MEAN_NODE,
    "KETU": swe.MEAN_NODE,  # Ketu is 180° opposite to Rahu
    "URANUS": swe.URANUS,
    "NEPTUNE": swe.NEPTUNE,
    "PLUTO": swe.PLUTO
}

# Nakshatra data
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

RAHU_KETU_SPEED = -0.0529  # Mean daily motion in degrees

class EphemerisCalculator:
    def __init__(self, ayanamsa: str = "LAHIRI"):
        self.ayanamsa = ayanamsa
        swe.set_sid_mode(AYANAMSA_MAP.get(ayanamsa, swe.SIDM_LAHIRI))
    
    def get_julian_day(self, dt: datetime) -> float:
        """Convert datetime to Julian Day"""
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        utc_dt = dt.astimezone(timezone.utc)
        return swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                         utc_dt.hour + utc_dt.minute/60.0 + utc_dt.second/3600.0)
    
    def get_ayanamsa(self, jd: float) -> float:
        """Get ayanamsa value for given Julian Day"""
        return swe.get_ayanamsa(jd)
    
    def get_planet_position(self, jd: float, planet: str, sidereal: bool = True) -> Dict:
        """Get position of a planet"""
        planet_id = PLANETS.get(planet.upper())
        if planet_id is None:
            raise ValueError(f"Unknown planet: {planet}")
        
        flag = swe.FLG_SIDEREAL if sidereal else swe.FLG_SWIEPH
        
        if planet.upper() == "KETU":
            # Calculate Rahu first, then add 180°
            result = swe.calc_ut(jd, PLANETS["RAHU"], flag)
            longitude = (result[0][0] + 180.0) % 360.0
            speed = -result[0][3]  # Ketu moves in opposite direction
            return {
                "longitude": longitude,
                "latitude": -result[0][1],
                "distance": result[0][2],
                "speed": speed,
                "is_retrograde": speed < 0
            }
        
        result = swe.calc_ut(jd, planet_id, flag)
        
        return {
            "longitude": result[0][0],
            "latitude": result[0][1],
            "distance": result[0][2],
            "speed": result[0][3],
            "is_retrograde": result[0][3] < 0 if planet.upper() not in ["RAHU", "KETU"] else False
        }
    
    def get_all_planets(self, jd: float) -> Dict[str, Dict]:
        """Get positions of all planets"""
        positions = {}
        for planet in ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN", "RAHU", "KETU"]:
            positions[planet] = self.get_planet_position(jd, planet)
        return positions
    
    def get_houses(self, jd: float, lat: float, lon: float) -> Tuple[float, List[float]]:
        """Calculate house cusps and ascendant using Placidus system"""
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')  # Placidus
        ascendant = ascmc[0]
        return ascendant, list(cusps[1:])  # cusps[0] is unused, houses start from cusps[1]
    
    def get_nakshatra(self, longitude: float) -> Tuple[str, int]:
        """Get nakshatra and pada for a given longitude"""
        nakshatra_span = 360.0 / 27.0  # 13°20'
        nakshatra_index = int(longitude / nakshatra_span)
        pada = int((longitude % nakshatra_span) / (nakshatra_span / 4)) + 1
        return NAKSHATRAS[nakshatra_index], pada
    
    def get_rasi(self, longitude: float) -> int:
        """Get rasi (sign) number (1-12) for a given longitude"""
        return int(longitude / 30.0) + 1
    
    def is_combust(self, planet_lon: float, sun_lon: float, planet: str) -> bool:
        """Check if planet is combust"""
        if planet.upper() in ["SUN", "RAHU", "KETU"]:
            return False
        
        # Combustion degrees
        combustion_degrees = {
            "MOON": 12, "MARS": 17, "MERCURY": 14,
            "JUPITER": 11, "VENUS": 10, "SATURN": 15
        }
        
        degrees = combustion_degrees.get(planet.upper(), 15)
        diff = abs(planet_lon - sun_lon)
        if diff > 180:
            diff = 360 - diff
        
        return diff <= degrees
    
    def get_dignity(self, planet: str, rasi: int) -> str:
        """Get dignity of planet in a rasi"""
        dignity_map = {
            "SUN": {"own": [5], "exalted": [1], "debilitated": [7], "friend": [3, 9], "enemy": [6, 12]},
            "MOON": {"own": [4], "exalted": [2], "debilitated": [8], "friend": [5], "enemy": [10]},
            "MARS": {"own": [1, 8], "exalted": [10], "debilitated": [4], "friend": [5, 9, 12], "enemy": [2, 3, 6, 7, 11]},
            "MERCURY": {"own": [3, 6], "exalted": [6], "debilitated": [12], "friend": [2, 5], "enemy": [9]},
            "JUPITER": {"own": [9, 12], "exalted": [4], "debilitated": [10], "friend": [1, 5, 8], "enemy": [3, 6]},
            "VENUS": {"own": [2, 7], "exalted": [12], "debilitated": [6], "friend": [3, 8], "enemy": [5, 9]},
            "SATURN": {"own": [10, 11], "exalted": [7], "debilitated": [1], "friend": [3, 6], "enemy": [1, 4, 5]}
        }
        
        planet_dignity = dignity_map.get(planet.upper(), {})
        
        if rasi in planet_dignity.get("own", []):
            return "Own"
        elif rasi in planet_dignity.get("exalted", []):
            return "Exalted"
        elif rasi in planet_dignity.get("debilitated", []):
            return "Debilitated"
        elif rasi in planet_dignity.get("friend", []):
            return "Friend"
        elif rasi in planet_dignity.get("enemy", []):
            return "Enemy"
        else:
            return "Neutral"

ephemeris = EphemerisCalculator()
