from typing import Dict, List
import hashlib
import json
from datetime import datetime
from app.modules.ephemeris.calculator import ephemeris

class DivisionalChartCalculator:
    """Calculate all divisional charts D1-D60"""
    
    DIVISIONS = {
        1: "Rasi", 2: "Hora", 3: "Drekkana", 4: "Chaturthamsa", 5: "Panchamsa",
        6: "Shashthamsa", 7: "Saptamsa", 8: "Ashtamsa", 9: "Navamsa", 10: "Dasamsa",
        11: "Ekadasamsa", 12: "Dwadasamsa", 16: "Shodasamsa", 20: "Vimsamsa",
        24: "Chaturvimsamsa", 27: "Saptavimsamsa", 30: "Trimsamsa", 40: "Khavedamsa",
        45: "Akshavedamsa", 60: "Shashtiamsa"
    }
    
    def calculate_divisional_position(self, longitude: float, division: int) -> int:
        """Calculate divisional chart position for a planet"""
        # Get rasi and degree within rasi
        rasi = int(longitude / 30.0)
        degree_in_rasi = longitude % 30.0
        
        # Calculate division within rasi
        division_size = 30.0 / division
        division_index = int(degree_in_rasi / division_size)
        
        # Calculate resulting rasi based on odd/even sign
        if division in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 20, 24, 27, 30, 40, 45, 60]:
            if division == 2:  # Hora
                if rasi % 2 == 0:  # Even sign
                    result_rasi = 4 if division_index == 0 else 5
                else:  # Odd sign
                    result_rasi = 5 if division_index == 0 else 4
            elif division == 3:  # Drekkana
                result_rasi = (rasi + (division_index * 4)) % 12
            elif division == 9:  # Navamsa - most important
                result_rasi = ((rasi % 3) * 3 + rasi // 3 + division_index) % 12
            else:  # Generic calculation for other divisions
                if rasi % 2 == 0:  # Even sign
                    result_rasi = (rasi + division_index) % 12
                else:  # Odd sign
                    result_rasi = (rasi + division_index) % 12
        else:
            result_rasi = (rasi + division_index) % 12
        
        return result_rasi + 1  # Return 1-based rasi number
    
    def calculate_all_divisions(self, planetary_positions: Dict[str, Dict]) -> Dict[int, Dict[str, int]]:
        """Calculate all divisional charts for all planets"""
        divisions = {}
        
        for div_num in self.DIVISIONS.keys():
            div_chart = {}
            for planet, pos in planetary_positions.items():
                div_chart[planet] = self.calculate_divisional_position(pos["longitude"], div_num)
            divisions[div_num] = div_chart
        
        return divisions

class ChartCalculator:
    """Main chart calculation engine"""
    
    def __init__(self):
        self.div_calculator = DivisionalChartCalculator()
    
    def generate_chart_hash(self, dt: datetime, lat: float, lon: float, ayanamsa: str) -> str:
        """Generate deterministic hash for chart caching"""
        data = f"{dt.isoformat()}_{lat}_{lon}_{ayanamsa}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def calculate_natal_chart(self, dt: datetime, lat: float, lon: float, ayanamsa: str = "LAHIRI") -> Dict:
        """Calculate complete natal chart"""
        # Get Julian Day
        jd = ephemeris.get_julian_day(dt)
        
        # Get ayanamsa value
        ayanamsa_value = ephemeris.get_ayanamsa(jd)
        
        # Calculate houses and ascendant
        ascendant, house_cusps = ephemeris.get_houses(jd, lat, lon)
        
        # Apply ayanamsa to ascendant
        asc_sidereal = (ascendant - ayanamsa_value) % 360.0
        
        # Get all planetary positions
        planets = ephemeris.get_all_planets(jd)
        
        # Enhance planet data with additional info
        sun_lon = planets["SUN"]["longitude"]
        for planet, pos in planets.items():
            lon = pos["longitude"]
            pos["nakshatra"], pos["pada"] = ephemeris.get_nakshatra(lon)
            pos["rasi"] = ephemeris.get_rasi(lon)
            pos["degree_in_rasi"] = lon % 30.0
            pos["is_combust"] = ephemeris.is_combust(lon, sun_lon, planet)
            pos["dignity"] = ephemeris.get_dignity(planet, pos["rasi"])
        
        # Calculate MC (10th house cusp)
        mc = (house_cusps[9] - ayanamsa_value) % 360.0
        
        # Calculate divisional charts
        divisional_charts = self.div_calculator.calculate_all_divisions(planets)
        
        return {
            "julian_day": jd,
            "ayanamsa_value": ayanamsa_value,
            "ascendant": asc_sidereal,
            "mc": mc,
            "house_cusps": [(cusp - ayanamsa_value) % 360.0 for cusp in house_cusps],
            "planets": planets,
            "divisional_charts": divisional_charts,
            "chart_hash": self.generate_chart_hash(dt, lat, lon, ayanamsa)
        }

chart_calculator = ChartCalculator()
