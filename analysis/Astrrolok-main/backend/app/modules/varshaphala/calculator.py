from datetime import datetime, timedelta
from typing import Dict, List
from app.modules.ephemeris.calculator import ephemeris
from app.modules.dasha.calculator import VimshottariDasha

class VarshaphalaCalculator:
    """Calculate Varshaphala (Annual Solar Return)"""
    
    TAJIKA_YOGAS = [
        "Ikkaval", "Induvara", "Ishrapha", "Easarpha", "Nakta",
        "Yamaya", "Manau", "Kambula", "Gairi Kambula", "Khallasar",
        "Duhphali Kuttha", "Kuttha", "Tamira", "Dutta Kuttha", "Radda"
    ]
    
    def calculate_varsha_pravesh(self, birth_date: datetime, birth_sun_lon: float, year: int) -> datetime:
        """Calculate Varsha Pravesh (Solar Return) time for a given year"""
        # Start from birthday in target year
        target_date = birth_date.replace(year=year)
        jd = ephemeris.get_julian_day(target_date)
        
        # Find exact moment when Sun returns to birth longitude
        for hours_offset in range(-48, 49):  # Check 2 days before/after
            test_jd = jd + (hours_offset / 24.0)
            sun_pos = ephemeris.get_planet_position(test_jd, "SUN")
            
            # Check if Sun is within 1 degree
            diff = abs(sun_pos["longitude"] - birth_sun_lon)
            if diff > 180:
                diff = 360 - diff
            
            if diff < 1.0:
                # Refine to minutes
                for minutes_offset in range(-60, 61):
                    refined_jd = test_jd + (minutes_offset / 1440.0)
                    sun_pos = ephemeris.get_planet_position(refined_jd, "SUN")
                    diff = abs(sun_pos["longitude"] - birth_sun_lon)
                    if diff > 180:
                        diff = 360 - diff
                    if diff < 0.1:
                        # Convert JD back to datetime
                        return target_date + timedelta(hours=hours_offset, minutes=minutes_offset)
        
        return target_date
    
    def calculate_annual_chart(self, varsha_pravesh_time: datetime, lat: float, lon: float) -> Dict:
        """Calculate annual chart for Varsha Pravesh"""
        jd = ephemeris.get_julian_day(varsha_pravesh_time)
        ayanamsa = ephemeris.get_ayanamsa(jd)
        
        # Get houses
        ascendant, house_cusps = ephemeris.get_houses(jd, lat, lon)
        asc_sidereal = (ascendant - ayanamsa) % 360.0
        
        # Get planets and add rasi/nakshatra
        planets = ephemeris.get_all_planets(jd)
        for planet, pos in planets.items():
            lon = pos["longitude"]
            pos["rasi"] = ephemeris.get_rasi(lon)
            pos["nakshatra"], pos["pada"] = ephemeris.get_nakshatra(lon)
        
        return {
            "julian_day": jd,
            "ascendant": asc_sidereal,
            "house_cusps": [(cusp - ayanamsa) % 360.0 for cusp in house_cusps],
            "planets": planets
        }
    
    def detect_tajika_yogas(self, planets: Dict[str, Dict]) -> List[Dict]:
        """Detect Tajika yogas in annual chart"""
        yogas = []
        
        # Check for Ikkaval yoga (planets in kendra from each other)
        for p1 in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            for p2 in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
                if p1 >= p2:
                    continue
                
                r1 = planets[p1]["rasi"]
                r2 = planets[p2]["rasi"]
                diff = (r1 - r2) % 12
                
                if diff in [0, 3, 6, 9]:
                    yogas.append({
                        "name": "Ikkaval Yoga",
                        "planets": [p1, p2],
                        "description": f"{p1} and {p2} in mutual kendras"
                    })
        
        # Check for Ishrapha (applying aspect)
        # Simplified: check for planets within 15 degrees
        for p1 in ["MOON", "MERCURY", "VENUS"]:
            for p2 in ["SUN", "JUPITER", "SATURN"]:
                lon1 = planets[p1]["longitude"]
                lon2 = planets[p2]["longitude"]
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff
                
                if 0 < diff < 15:
                    yogas.append({
                        "name": "Ishrapha Yoga",
                        "planets": [p1, p2],
                        "description": f"{p1} applying to {p2}"
                    })
        
        return yogas
    
    def calculate_sahams(self, planets: Dict[str, Dict], ascendant: float) -> Dict:
        """Calculate important Arabic Parts (Sahams)"""
        sun_lon = planets["SUN"]["longitude"]
        moon_lon = planets["MOON"]["longitude"]
        
        # Saham-e-Saadat (Part of Fortune)
        pof = (ascendant + moon_lon - sun_lon) % 360.0
        
        # Saham-e-Ghayb (Part of Spirit)
        pos = (ascendant + sun_lon - moon_lon) % 360.0
        
        return {
            "Saham_e_Saadat": pof,
            "Saham_e_Ghayb": pos,
            "Pof_Rasi": int(pof / 30.0) + 1,
            "Pos_Rasi": int(pos / 30.0) + 1
        }
    
    def calculate_mudda_dasha(self, birth_date: datetime, varsha_year: int) -> List[Dict]:
        """Calculate Mudda dasha (annual progression through signs)"""
        # Simple implementation: 1 year divided into 12 months by signs
        dashas = []
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        start_date = birth_date.replace(year=varsha_year)
        
        for i, sign in enumerate(signs):
            end_date = start_date + timedelta(days=30.4375)  # ~1 month
            dashas.append({
                "sign": sign,
                "start_date": start_date,
                "end_date": end_date,
                "months": 1
            })
            start_date = end_date
        
        return dashas

varshaphala_calculator = VarshaphalaCalculator()
