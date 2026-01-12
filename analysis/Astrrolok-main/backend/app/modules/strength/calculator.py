from typing import Dict, List
import math

class StrengthCalculator:
    """Calculate Shadbala, Bhavabala, and other planetary strength systems"""
    
    # Planet required strengths (in Rupas)
    REQUIRED_STRENGTHS = {
        "SUN": 390, "MOON": 360, "MARS": 300, "MERCURY": 420,
        "JUPITER": 390, "VENUS": 330, "SATURN": 300
    }
    
    # Exaltation points
    EXALTATION_POINTS = {
        "SUN": 10, "MOON": 33, "MARS": 298, "MERCURY": 165,
        "JUPITER": 95, "VENUS": 357, "SATURN": 200
    }
    
    # Debilitation is 180 degrees opposite
    
    def calculate_sthana_bala(self, planet: str, longitude: float, rasi: int, dignity: str) -> Dict:
        """Calculate Positional Strength (Sthana Bala)"""
        
        # 1. Uccha Bala (Exaltation Strength) - max 60 shashtiamsas
        exalt_point = self.EXALTATION_POINTS.get(planet, 0)
        diff = abs(longitude - exalt_point)
        if diff > 180:
            diff = 360 - diff
        uccha_bala = (180 - diff) / 3.0  # Max 60
        
        # 2. Saptavargaja Bala (7 divisional chart strength) - simplified
        varga_bala = self._calculate_varga_strength(dignity)
        
        # 3. Ojhayugma Bala (Odd/Even sign strength) - max 15
        ojha_bala = 15.0 if rasi % 2 == 1 else 7.5  # Odd sign preference
        
        # 4. Kendradi Bala (Angular/Succedent/Cadent) - max 60
        house_from_asc = rasi  # Simplified
        if house_from_asc in [1, 4, 7, 10]:
            kendra_bala = 60.0
        elif house_from_asc in [2, 5, 8, 11]:
            kendra_bala = 30.0
        else:
            kendra_bala = 15.0
        
        # 5. Drekkana Bala - max 15
        degree_in_rasi = longitude % 30.0
        if degree_in_rasi < 10:
            drek_bala = 15.0 if planet in ["SUN", "MARS", "JUPITER"] else 7.5
        elif degree_in_rasi < 20:
            drek_bala = 15.0 if planet in ["MOON", "VENUS"] else 7.5
        else:
            drek_bala = 15.0 if planet in ["MERCURY", "SATURN"] else 7.5
        
        total = uccha_bala + varga_bala + ojha_bala + kendra_bala + drek_bala
        
        return {
            "uccha_bala": round(uccha_bala, 2),
            "saptavargaja_bala": round(varga_bala, 2),
            "ojhayugma_bala": round(ojha_bala, 2),
            "kendradi_bala": round(kendra_bala, 2),
            "drekkana_bala": round(drek_bala, 2),
            "total": round(total, 2)
        }
    
    def _calculate_varga_strength(self, dignity: str) -> float:
        """Calculate simplified varga strength based on dignity"""
        dignity_scores = {
            "Exalted": 45.0,
            "Own": 30.0,
            "Friend": 22.5,
            "Neutral": 15.0,
            "Enemy": 7.5,
            "Debilitated": 3.75
        }
        return dignity_scores.get(dignity, 15.0)
    
    def calculate_dig_bala(self, planet: str, rasi: int) -> float:
        """Calculate Directional Strength (Dig Bala) - max 60"""
        # Planets are strong in specific directions/houses
        dig_strength_houses = {
            "SUN": 10,    # 10th house (South)
            "MOON": 4,    # 4th house (North)
            "MARS": 10,   # 10th house (South)
            "MERCURY": 1, # 1st house (East)
            "JUPITER": 1, # 1st house (East)
            "VENUS": 4,   # 4th house (North)
            "SATURN": 7   # 7th house (West)
        }
        
        strong_house = dig_strength_houses.get(planet, 1)
        diff = abs(rasi - strong_house)
        if diff > 6:
            diff = 12 - diff
        
        dig_bala = (6 - diff) * 10.0  # Max 60
        return round(max(0, dig_bala), 2)
    
    def calculate_kala_bala(self, planet: str, jd: float) -> Dict:
        """Calculate Temporal Strength (Kala Bala)"""
        # Simplified calculation
        
        # Nathonnatha Bala - day/night strength
        # Sun, Jupiter, Venus strong during day
        # Moon, Mars, Saturn strong during night
        day_planets = ["SUN", "JUPITER", "VENUS"]
        natho_bala = 30.0 if planet in day_planets else 30.0  # Simplified
        
        # Paksha Bala - lunar phase strength
        paksha_bala = 30.0  # Simplified
        
        # Tribhaga Bala - third of day/night
        tribhaga_bala = 20.0  # Simplified
        
        # Varsha/Maasa/Dina/Hora Bala
        lord_bala = 15.0  # Simplified
        
        # Ayana Bala - declination strength
        ayana_bala = 30.0  # Simplified
        
        # Yuddha Bala - war strength (if applicable)
        yuddha_bala = 0.0
        
        total = natho_bala + paksha_bala + tribhaga_bala + lord_bala + ayana_bala + yuddha_bala
        
        return {
            "nathonnatha_bala": round(natho_bala, 2),
            "paksha_bala": round(paksha_bala, 2),
            "tribhaga_bala": round(tribhaga_bala, 2),
            "lord_bala": round(lord_bala, 2),
            "ayana_bala": round(ayana_bala, 2),
            "yuddha_bala": round(yuddha_bala, 2),
            "total": round(total, 2)
        }
    
    def calculate_chesta_bala(self, planet: str, is_retrograde: bool) -> float:
        """Calculate Motional Strength (Chesta Bala) - max 60"""
        # Retrograde planets are stronger
        if planet in ["SUN", "MOON"]:
            return 30.0  # Sun/Moon don't retrograde
        
        if is_retrograde:
            return 60.0
        else:
            return 30.0  # Direct motion
    
    def calculate_naisargika_bala(self, planet: str) -> float:
        """Calculate Natural Strength (Naisargika Bala) - fixed values"""
        natural_strengths = {
            "SUN": 60.0,
            "MOON": 51.43,
            "MARS": 17.14,
            "MERCURY": 25.7,
            "JUPITER": 34.28,
            "VENUS": 42.86,
            "SATURN": 8.57
        }
        return round(natural_strengths.get(planet, 0), 2)
    
    def calculate_drik_bala(self, planet: str, planets: Dict) -> float:
        """Calculate Aspectual Strength (Drik Bala)"""
        # Simplified: based on benefic/malefic aspects
        benefics = ["JUPITER", "VENUS", "MERCURY", "MOON"]
        malefics = ["SUN", "MARS", "SATURN", "RAHU", "KETU"]
        
        planet_rasi = planets[planet]["rasi"]
        aspect_strength = 0.0
        
        for other_planet, pos in planets.items():
            if other_planet == planet:
                continue
            
            other_rasi = pos.get("rasi", 0)
            diff = abs(planet_rasi - other_rasi)
            
            # Check if aspecting (7th, 5th, 9th aspects)
            if diff in [6, 4, 8]:  # 7th, 5th, 9th
                if other_planet in benefics:
                    aspect_strength += 15.0
                elif other_planet in malefics:
                    aspect_strength -= 15.0
        
        return round(max(-60, min(60, aspect_strength)), 2)
    
    def calculate_shadbala(self, planets: Dict, jd: float) -> Dict:
        """Calculate complete Shadbala for all planets"""
        shadbala = {}
        
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            if planet not in planets:
                continue
            
            pos = planets[planet]
            longitude = pos.get("longitude", 0)
            rasi = pos.get("rasi", 1)
            dignity = pos.get("dignity", "Neutral")
            is_retrograde = pos.get("is_retrograde", False)
            
            sthana = self.calculate_sthana_bala(planet, longitude, rasi, dignity)
            dig = self.calculate_dig_bala(planet, rasi)
            kala = self.calculate_kala_bala(planet, jd)
            chesta = self.calculate_chesta_bala(planet, is_retrograde)
            naisargika = self.calculate_naisargika_bala(planet)
            drik = self.calculate_drik_bala(planet, planets)
            
            total_shashtiamsas = sthana["total"] + dig + kala["total"] + chesta + naisargika + drik
            total_rupas = total_shashtiamsas / 60.0
            required = self.REQUIRED_STRENGTHS.get(planet, 300) / 60.0
            
            shadbala[planet] = {
                "sthana_bala": sthana,
                "dig_bala": dig,
                "kala_bala": kala,
                "chesta_bala": chesta,
                "naisargika_bala": naisargika,
                "drik_bala": drik,
                "total_shashtiamsas": round(total_shashtiamsas, 2),
                "total_rupas": round(total_rupas, 2),
                "required_rupas": round(required, 2),
                "strength_ratio": round(total_rupas / required, 2) if required > 0 else 0,
                "is_strong": total_rupas >= required,
                "total": round(total_shashtiamsas, 2)
            }
        
        return shadbala
    
    def calculate_bhavabala(self, house_cusps: List[float]) -> Dict:
        """Calculate House Strength (Bhava Bala)"""
        if not house_cusps or len(house_cusps) < 12:
            house_cusps = [i * 30.0 for i in range(12)]
        
        bhavabala = {}
        
        for i, cusp in enumerate(house_cusps[:12]):
            house_num = i + 1
            
            # Bhavadhipati Bala (Lord's strength)
            lord_bala = 30.0  # Simplified
            
            # Bhava Dig Bala (Directional)
            if house_num in [1, 4, 7, 10]:
                dig_bala = 60.0
            elif house_num in [2, 5, 8, 11]:
                dig_bala = 30.0
            else:
                dig_bala = 15.0
            
            # Bhava Drishti Bala (Aspectual)
            drishti_bala = 20.0  # Simplified
            
            total = lord_bala + dig_bala + drishti_bala
            
            bhavabala[house_num] = {
                "bhavadhipati_bala": round(lord_bala, 2),
                "bhava_dig_bala": round(dig_bala, 2),
                "bhava_drishti_bala": round(drishti_bala, 2),
                "total": round(total, 2)
            }
        
        return bhavabala
    
    def calculate_vargabala(self, divisional_charts: Dict) -> Dict:
        """Calculate Varga Bala from divisional charts"""
        if not divisional_charts:
            return {}
        
        vargabala = {}
        
        # Important vargas and their weights
        important_vargas = {
            1: 3.0,   # D1 Rasi
            2: 1.5,   # D2 Hora
            3: 1.5,   # D3 Drekkana
            9: 3.0,   # D9 Navamsa
            12: 1.5,  # D12 Dwadasamsa
            30: 1.5   # D30 Trimsamsa
        }
        
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            planet_score = 0.0
            varga_details = {}
            
            for varga, weight in important_vargas.items():
                if varga in divisional_charts:
                    varga_chart = divisional_charts[varga]
                    if planet in varga_chart:
                        # Score based on position in varga
                        varga_rasi = varga_chart[planet]
                        # Simplified: own sign, exaltation, friend = high score
                        varga_details[f"D{varga}"] = varga_rasi
                        planet_score += weight * 5.0  # Base score
            
            vargabala[planet] = {
                "varga_positions": varga_details,
                "total_score": round(planet_score, 2)
            }
        
        return vargabala
    
    def calculate_ishtakashta(self, planets: Dict) -> Dict:
        """Calculate Ishta Phala (benefic) and Kashta Phala (malefic) values"""
        results = {}
        
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            if planet not in planets:
                continue
            
            pos = planets[planet]
            longitude = pos.get("longitude", 0)
            dignity = pos.get("dignity", "Neutral")
            
            # Uccha bala component
            exalt_point = self.EXALTATION_POINTS.get(planet, 0)
            diff = abs(longitude - exalt_point)
            if diff > 180:
                diff = 360 - diff
            uccha = (180 - diff) / 3.0
            
            # Chesta bala component
            chesta = 30.0  # Simplified
            
            # Calculate Ishta and Kashta
            ishta = (uccha * chesta) ** 0.5
            kashta = ((60 - uccha) * (60 - chesta)) ** 0.5
            
            results[planet] = {
                "ishta_phala": round(ishta, 2),
                "kashta_phala": round(kashta, 2),
                "net_effect": round(ishta - kashta, 2),
                "is_benefic": ishta > kashta
            }
        
        return results
    
    def calculate_avasthas(self, planets: Dict) -> Dict:
        """Calculate planetary Avasthas (states)"""
        avasthas = {}
        
        # Baladi Avasthas (based on degree in sign)
        baladi_names = ["Bala", "Kumara", "Yuva", "Vriddha", "Mrita"]
        
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            if planet not in planets:
                continue
            
            pos = planets[planet]
            longitude = pos.get("longitude", 0)
            degree_in_rasi = longitude % 30.0
            dignity = pos.get("dignity", "Neutral")
            is_retrograde = pos.get("is_retrograde", False)
            is_combust = pos.get("is_combust", False)
            
            # Baladi Avastha (5 states based on degree)
            baladi_index = int(degree_in_rasi / 6)
            baladi = baladi_names[min(baladi_index, 4)]
            
            # Jagradadi Avastha (3 states: Jagrat, Swapna, Sushupti)
            if dignity in ["Own", "Exalted"]:
                jagradadi = "Jagrat"
            elif dignity in ["Friend", "Neutral"]:
                jagradadi = "Swapna"
            else:
                jagradadi = "Sushupti"
            
            # Deeptadi Avastha
            if dignity == "Exalted":
                deeptadi = "Deepta"
            elif dignity == "Own":
                deeptadi = "Swastha"
            elif is_retrograde:
                deeptadi = "Vakri"
            elif is_combust:
                deeptadi = "Asta"
            elif dignity == "Friend":
                deeptadi = "Mudita"
            elif dignity == "Enemy":
                deeptadi = "Duhkhita"
            else:
                deeptadi = "Shanta"
            
            avasthas[planet] = {
                "baladi": baladi,
                "jagradadi": jagradadi,
                "deeptadi": deeptadi,
                "strength_modifier": self._get_avastha_strength(baladi, jagradadi, deeptadi)
            }
        
        return avasthas
    
    def _get_avastha_strength(self, baladi: str, jagradadi: str, deeptadi: str) -> float:
        """Calculate strength modifier from avasthas"""
        baladi_scores = {"Bala": 0.25, "Kumara": 0.5, "Yuva": 1.0, "Vriddha": 0.5, "Mrita": 0.0}
        jagradadi_scores = {"Jagrat": 1.0, "Swapna": 0.5, "Sushupti": 0.25}
        deeptadi_scores = {
            "Deepta": 1.0, "Swastha": 0.9, "Mudita": 0.75, "Shanta": 0.5,
            "Vakri": 0.6, "Duhkhita": 0.25, "Asta": 0.1
        }
        
        modifier = baladi_scores.get(baladi, 0.5) * jagradadi_scores.get(jagradadi, 0.5) * deeptadi_scores.get(deeptadi, 0.5)
        return round(modifier, 3)

strength_calculator = StrengthCalculator()
