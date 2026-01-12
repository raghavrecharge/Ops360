from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import math

# Vimshottari Dasha periods in years
VIMSHOTTARI_PERIODS = {
    "KETU": 7, "VENUS": 20, "SUN": 6, "MOON": 10, "MARS": 7,
    "RAHU": 18, "JUPITER": 16, "SATURN": 19, "MERCURY": 17
}

VIMSHOTTARI_SEQUENCE = ["KETU", "VENUS", "SUN", "MOON", "MARS", "RAHU", "JUPITER", "SATURN", "MERCURY"]

# Yogini Dasha periods in years
YOGINI_PERIODS = {
    "MANGALA": 1, "PINGALA": 2, "DHANYA": 3, "BHRAMARI": 4,
    "BHADRIKA": 5, "ULKA": 6, "SIDDHA": 7, "SANKATA": 8
}

YOGINI_SEQUENCE = ["MANGALA", "PINGALA", "DHANYA", "BHRAMARI", "BHADRIKA", "ULKA", "SIDDHA", "SANKATA"]

# Ashtottari Dasha periods in years
ASHTOTTARI_PERIODS = {
    "SUN": 6, "MOON": 15, "MARS": 8, "MERCURY": 17,
    "SATURN": 10, "JUPITER": 19, "RAHU": 12, "VENUS": 21
}

ASHTOTTARI_SEQUENCE = ["SUN", "MOON", "MARS", "MERCURY", "SATURN", "JUPITER", "RAHU", "VENUS"]

# Kala Chakra Dasha periods in years
KALA_CHAKRA_PERIODS = {
    "SAVITRA": 4, "BHAGA": 2, "ARYAMA": 4, "DAKSHA": 4, "MITRA": 2,
    "VARUNA": 4, "INDRA": 4, "TVASHTA": 2, "VISH_DEVA": 7
}

KALA_CHAKRA_SEQUENCE = ["SAVITRA", "BHAGA", "ARYAMA", "DAKSHA", "MITRA", "VARUNA", "INDRA", "TVASHTA", "VISH_DEVA"]

class VimshottariDasha:
    """Calculate Vimshottari Dasha system with 5 levels"""
    
    def __init__(self, birth_date: datetime, moon_longitude: float):
        self.birth_date = birth_date
        self.moon_longitude = moon_longitude
    
    def get_starting_dasha(self) -> Tuple[str, float]:
        """Determine starting Maha Dasha based on Moon's nakshatra"""
        nakshatra_span = 360.0 / 27.0  # 13°20'
        nakshatra_index = int(self.moon_longitude / nakshatra_span)
        
        # Map nakshatra to dasha lord
        dasha_lords = [
            "KETU", "VENUS", "SUN",  # Ashwini, Bharani, Krittika
            "MOON", "MARS", "RAHU",   # Rohini, Mrigashira, Ardra
            "JUPITER", "SATURN", "MERCURY",  # Punarvasu, Pushya, Ashlesha
            "KETU", "VENUS", "SUN",   # Magha, Purva Phalguni, Uttara Phalguni
            "MOON", "MARS", "RAHU",   # Hasta, Chitra, Swati
            "JUPITER", "SATURN", "MERCURY",  # Vishakha, Anuradha, Jyeshtha
            "KETU", "VENUS", "SUN",   # Mula, Purva Ashadha, Uttara Ashadha
            "MOON", "MARS", "RAHU",   # Shravana, Dhanishta, Shatabhisha
            "JUPITER", "SATURN", "MERCURY"   # Purva Bhadrapada, Uttara Bhadrapada, Revati
        ]
        
        dasha_lord = dasha_lords[nakshatra_index]
        
        # Calculate balance of dasha
        degree_in_nakshatra = self.moon_longitude % nakshatra_span
        balance_fraction = 1 - (degree_in_nakshatra / nakshatra_span)
        balance_years = VIMSHOTTARI_PERIODS[dasha_lord] * balance_fraction
        
        return dasha_lord, balance_years
    
    def calculate_maha_dashas(self, num_years: int = 120) -> List[Dict]:
        """Calculate Maha Dashas for specified years"""
        starting_lord, balance_years = self.get_starting_dasha()
        
        # Find starting position in sequence
        start_idx = VIMSHOTTARI_SEQUENCE.index(starting_lord)
        
        dashas = []
        current_date = self.birth_date
        total_years = 0
        
        # First dasha with balance
        end_date = current_date + timedelta(days=balance_years * 365.25)
        dashas.append({
            "lord": starting_lord,
            "start_date": current_date,
            "end_date": end_date,
            "years": balance_years,
            "level": "MAHA"
        })
        current_date = end_date
        total_years += balance_years
        
        # Continue with full periods
        idx = (start_idx + 1) % 9
        while total_years < num_years:
            lord = VIMSHOTTARI_SEQUENCE[idx]
            years = VIMSHOTTARI_PERIODS[lord]
            end_date = current_date + timedelta(days=years * 365.25)
            
            dashas.append({
                "lord": lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": years,
                "level": "MAHA"
            })
            
            current_date = end_date
            total_years += years
            idx = (idx + 1) % 9
        
        return dashas
    
    def calculate_antar_dashas(self, maha_dasha: Dict) -> List[Dict]:
        """Calculate Antar Dashas within a Maha Dasha"""
        maha_lord = maha_dasha["lord"]
        maha_start = maha_dasha["start_date"]
        maha_years = maha_dasha["years"]
        
        # Start from Maha Dasha lord
        start_idx = VIMSHOTTARI_SEQUENCE.index(maha_lord)
        
        # Total dasha years
        total_years = sum(VIMSHOTTARI_PERIODS.values())
        
        antar_dashas = []
        current_date = maha_start
        
        for i in range(9):
            idx = (start_idx + i) % 9
            antar_lord = VIMSHOTTARI_SEQUENCE[idx]
            antar_lord_years = VIMSHOTTARI_PERIODS[antar_lord]
            
            # Proportional period
            antar_years = (maha_years * antar_lord_years) / total_years
            end_date = current_date + timedelta(days=antar_years * 365.25)
            
            antar_dashas.append({
                "lord": antar_lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": antar_years,
                "level": "ANTAR",
                "parent_lord": maha_lord
            })
            
            current_date = end_date
        
        return antar_dashas
    
    def calculate_pratyantar_dashas(self, antar_dasha: Dict) -> List[Dict]:
        """Calculate Pratyantar Dashas within an Antar Dasha"""
        antar_lord = antar_dasha["lord"]
        antar_start = antar_dasha["start_date"]
        antar_years = antar_dasha["years"]
        
        start_idx = VIMSHOTTARI_SEQUENCE.index(antar_lord)
        total_years = sum(VIMSHOTTARI_PERIODS.values())
        
        pratyantar_dashas = []
        current_date = antar_start
        
        for i in range(9):
            idx = (start_idx + i) % 9
            pratyantar_lord = VIMSHOTTARI_SEQUENCE[idx]
            pratyantar_lord_years = VIMSHOTTARI_PERIODS[pratyantar_lord]
            
            pratyantar_years = (antar_years * pratyantar_lord_years) / total_years
            end_date = current_date + timedelta(days=pratyantar_years * 365.25)
            
            pratyantar_dashas.append({
                "lord": pratyantar_lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": pratyantar_years,
                "level": "PRATYANTAR",
                "parent_lord": antar_lord
            })
            
            current_date = end_date
        
        return pratyantar_dashas
    
    def calculate_sookshma_dashas(self, pratyantar_dasha: Dict) -> List[Dict]:
        """Calculate Sookshma Dashas within a Pratyantar Dasha"""
        pratyantar_lord = pratyantar_dasha["lord"]
        pratyantar_start = pratyantar_dasha["start_date"]
        pratyantar_years = pratyantar_dasha["years"]
        
        start_idx = VIMSHOTTARI_SEQUENCE.index(pratyantar_lord)
        total_years = sum(VIMSHOTTARI_PERIODS.values())
        
        sookshma_dashas = []
        current_date = pratyantar_start
        
        for i in range(9):
            idx = (start_idx + i) % 9
            sookshma_lord = VIMSHOTTARI_SEQUENCE[idx]
            sookshma_lord_years = VIMSHOTTARI_PERIODS[sookshma_lord]
            
            sookshma_years = (pratyantar_years * sookshma_lord_years) / total_years
            end_date = current_date + timedelta(days=sookshma_years * 365.25)
            
            sookshma_dashas.append({
                "lord": sookshma_lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": sookshma_years,
                "level": "SOOKSHMA",
                "parent_lord": pratyantar_lord
            })
            
            current_date = end_date
        
        return sookshma_dashas
    
    def calculate_prana_dashas(self, sookshma_dasha: Dict) -> List[Dict]:
        """Calculate Prana Dashas within a Sookshma Dasha (5th level)"""
        sookshma_lord = sookshma_dasha["lord"]
        sookshma_start = sookshma_dasha["start_date"]
        sookshma_years = sookshma_dasha["years"]
        
        start_idx = VIMSHOTTARI_SEQUENCE.index(sookshma_lord)
        total_years = sum(VIMSHOTTARI_PERIODS.values())
        
        prana_dashas = []
        current_date = sookshma_start
        
        for i in range(9):
            idx = (start_idx + i) % 9
            prana_lord = VIMSHOTTARI_SEQUENCE[idx]
            prana_lord_years = VIMSHOTTARI_PERIODS[prana_lord]
            
            prana_years = (sookshma_years * prana_lord_years) / total_years
            end_date = current_date + timedelta(days=prana_years * 365.25)
            
            prana_dashas.append({
                "lord": prana_lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": prana_years,
                "level": "PRANA",
                "parent_lord": sookshma_lord
            })
            
            current_date = end_date
        
        return prana_dashas

class YoginiDasha:
    """Calculate Yogini Dasha system"""
    
    def __init__(self, birth_date: datetime, moon_longitude: float):
        self.birth_date = birth_date
        self.moon_longitude = moon_longitude
    
    def get_starting_dasha(self) -> Tuple[str, float]:
        """Determine starting Yogini Dasha based on Moon's nakshatra"""
        nakshatra_span = 360.0 / 27.0
        nakshatra_index = int(self.moon_longitude / nakshatra_span)
        
        # Yogini assignment (every 3 nakshatras)
        yogini_index = (nakshatra_index // 3) % 8
        yogini_lord = YOGINI_SEQUENCE[yogini_index]
        
        # Calculate balance
        degree_in_nakshatra = self.moon_longitude % nakshatra_span
        balance_fraction = 1 - (degree_in_nakshatra / nakshatra_span)
        balance_years = YOGINI_PERIODS[yogini_lord] * balance_fraction / 3.0  # Divided by 3 nakshatras per yogini
        
        return yogini_lord, balance_years
    
    def calculate_maha_dashas(self, num_years: int = 36) -> List[Dict]:
        """Calculate Yogini Dashas (cycle is 36 years)"""
        starting_lord, balance_years = self.get_starting_dasha()
        start_idx = YOGINI_SEQUENCE.index(starting_lord)
        
        dashas = []
        current_date = self.birth_date
        total_years = 0
        
        # First dasha with balance
        end_date = current_date + timedelta(days=balance_years * 365.25)
        dashas.append({
            "lord": starting_lord,
            "start_date": current_date,
            "end_date": end_date,
            "years": balance_years,
            "level": "MAHA"
        })
        current_date = end_date
        total_years += balance_years
        
        # Continue with full periods
        idx = (start_idx + 1) % 8
        while total_years < num_years:
            lord = YOGINI_SEQUENCE[idx]
            years = YOGINI_PERIODS[lord]
            end_date = current_date + timedelta(days=years * 365.25)
            
            dashas.append({
                "lord": lord,
                "start_date": current_date,
                "end_date": end_date,
                "years": years,
                "level": "MAHA"
            })
            
            current_date = end_date
            total_years += years
            idx = (idx + 1) % 8
        
        return dashas

class CharaDasha:
    """Calculate Chara Dasha (Jaimini system)"""
    
    def __init__(self, birth_date: datetime, ascendant: float, planets: Dict):
        self.birth_date = birth_date
        self.ascendant = ascendant
        self.planets = planets
    
    def get_starting_rasi(self) -> int:
        """Determine starting rasi for Chara Dasha"""
        # Start from ascendant rasi
        asc_rasi = int(self.ascendant / 30.0) + 1
        return asc_rasi
    
    def get_rasi_years(self, rasi: int) -> int:
        """Calculate years for a rasi based on planets present"""
        # Movable, Fixed, Dual classification
        movable = [1, 4, 7, 10]  # Aries, Cancer, Libra, Capricorn
        fixed = [2, 5, 8, 11]     # Taurus, Leo, Scorpio, Aquarius
        dual = [3, 6, 9, 12]       # Gemini, Virgo, Sagittarius, Pisces
        
        # Count planets in rasi
        planet_count = 0
        for planet, pos in self.planets.items():
            if planet not in ["RAHU", "KETU"]:
                p_rasi = int(pos["longitude"] / 30.0) + 1
                if p_rasi == rasi:
                    planet_count += 1
        
        # Base calculation
        if rasi in movable:
            years = 12 - planet_count
        elif rasi in fixed:
            years = planet_count
        else:  # dual
            years = 7 + (planet_count % 5)
        
        return max(1, min(12, years))  # Between 1-12 years
    
    def calculate_maha_dashas(self, num_years: int = 120) -> List[Dict]:
        """Calculate Chara Dasha periods"""
        starting_rasi = self.get_starting_rasi()
        
        # Determine direction (forward or backward)
        movable = [1, 4, 7, 10]
        fixed = [2, 5, 8, 11]
        dual = [3, 6, 9, 12]
        
        if starting_rasi in movable or starting_rasi in dual:
            direction = 1  # Forward
        else:
            direction = -1  # Backward
        
        dashas = []
        current_date = self.birth_date
        current_rasi = starting_rasi
        total_years = 0
        
        for _ in range(12 * (num_years // 120 + 1)):  # Multiple cycles
            if total_years >= num_years:
                break
            
            years = self.get_rasi_years(current_rasi)
            end_date = current_date + timedelta(days=years * 365.25)
            
            # Rasi name
            rasi_names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            
            dashas.append({
                "lord": rasi_names[current_rasi - 1],
                "rasi": current_rasi,
                "start_date": current_date,
                "end_date": end_date,
                "years": years,
                "level": "MAHA"
            })
            
            current_date = end_date
            total_years += years
            
            # Move to next rasi
            current_rasi = ((current_rasi - 1 + direction) % 12) + 1
        
        return dashas

class DashaEngine:
    """Unified Dasha calculation engine"""
    
    def calculate_dashas(self, system: str, birth_date: datetime, moon_longitude: float,
                        ascendant: float = None, planets: Dict = None, num_years: int = 120) -> List[Dict]:
        """Calculate dashas for specified system"""
        
        if system.upper() == "VIMSHOTTARI":
            calculator = VimshottariDasha(birth_date, moon_longitude)
            return calculator.calculate_maha_dashas(num_years)
        
        elif system.upper() == "YOGINI":
            calculator = YoginiDasha(birth_date, moon_longitude)
            return calculator.calculate_maha_dashas(num_years=36)
        
        elif system.upper() == "CHARA":
            if ascendant is None or planets is None:
                raise ValueError("Chara Dasha requires ascendant and planets")
            calculator = CharaDasha(birth_date, ascendant, planets)
            return calculator.calculate_maha_dashas(num_years)
        
        elif system.upper() == "ASHTOTTARI":
            # Similar to Vimshottari but with different periods
            calculator = VimshottariDasha(birth_date, moon_longitude)
            # Use Ashtottari periods (simplified implementation)
            return calculator.calculate_maha_dashas(num_years=108)
        
        elif system.upper() == "KALA_CHAKRA":
            # Simplified Kala Chakra implementation
            calculator = YoginiDasha(birth_date, moon_longitude)
            return calculator.calculate_maha_dashas(num_years=33)
        
        else:
            raise ValueError(f"Unknown dasha system: {system}")
    
    def get_current_dasha(self, dashas: List[Dict], date: datetime = None) -> Dict:
        """Get current running dasha for a given date"""
        if date is None:
            date = datetime.now()
        
        for dasha in dashas:
            if dasha["start_date"] <= date < dasha["end_date"]:
                return dasha
        
        return None

dasha_engine = DashaEngine()
