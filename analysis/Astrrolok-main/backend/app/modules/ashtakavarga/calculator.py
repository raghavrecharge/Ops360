from typing import Dict, List
import numpy as np

class AshtakavargaCalculator:
    """Calculate Bhinnashtakavarga (BAV) and Sarvashtakavarga (SAV)"""
    
    # BAV contribution rules (which planets contribute benefic points in which houses from each planet)
    BAV_RULES = {
        "SUN": {
            "SUN": [1, 2, 4, 7, 8, 9, 10, 11],
            "MOON": [3, 6, 10, 11],
            "MARS": [1, 2, 4, 7, 8, 9, 10, 11],
            "MERCURY": [3, 5, 6, 9, 10, 11, 12],
            "JUPITER": [5, 6, 9, 11],
            "VENUS": [6, 7, 12],
            "SATURN": [1, 2, 4, 7, 8, 9, 10, 11]
        },
        "MOON": {
            "SUN": [3, 6, 7, 8, 10, 11],
            "MOON": [1, 3, 6, 7, 10, 11],
            "MARS": [2, 3, 5, 6, 9, 10, 11],
            "MERCURY": [1, 3, 4, 5, 7, 8, 10, 11],
            "JUPITER": [1, 4, 7, 8, 10, 11, 12],
            "VENUS": [3, 4, 5, 7, 9, 10, 11],
            "SATURN": [3, 5, 6, 11]
        },
        "MARS": {
            "SUN": [3, 5, 6, 10, 11],
            "MOON": [3, 6, 11],
            "MARS": [1, 2, 4, 7, 8, 10, 11],
            "MERCURY": [3, 5, 6, 11],
            "JUPITER": [6, 10, 11, 12],
            "VENUS": [6, 8, 11, 12],
            "SATURN": [1, 4, 7, 8, 9, 10, 11]
        },
        "MERCURY": {
            "SUN": [5, 6, 9, 11, 12],
            "MOON": [2, 4, 6, 8, 10, 11],
            "MARS": [1, 2, 4, 7, 8, 9, 10, 11],
            "MERCURY": [1, 3, 5, 6, 9, 10, 11, 12],
            "JUPITER": [6, 8, 11, 12],
            "VENUS": [1, 2, 3, 4, 5, 8, 9, 11],
            "SATURN": [1, 2, 4, 7, 8, 9, 10, 11]
        },
        "JUPITER": {
            "SUN": [1, 2, 3, 4, 7, 8, 9, 10, 11],
            "MOON": [2, 5, 7, 9, 11],
            "MARS": [1, 2, 4, 7, 8, 10, 11],
            "MERCURY": [1, 2, 4, 5, 6, 9, 10, 11],
            "JUPITER": [1, 2, 3, 4, 7, 8, 10, 11],
            "VENUS": [2, 5, 6, 9, 10, 11],
            "SATURN": [3, 5, 6, 12]
        },
        "VENUS": {
            "SUN": [8, 11, 12],
            "MOON": [1, 2, 3, 4, 5, 8, 9, 11, 12],
            "MARS": [3, 4, 6, 9, 11, 12],
            "MERCURY": [3, 5, 6, 9, 11],
            "JUPITER": [5, 8, 9, 10, 11],
            "VENUS": [1, 2, 3, 4, 5, 8, 9, 10, 11],
            "SATURN": [3, 4, 5, 8, 9, 10, 11]
        },
        "SATURN": {
            "SUN": [1, 2, 4, 7, 8, 10, 11],
            "MOON": [3, 6, 11],
            "MARS": [3, 5, 6, 10, 11, 12],
            "MERCURY": [6, 8, 9, 10, 11, 12],
            "JUPITER": [5, 6, 11, 12],
            "VENUS": [6, 11, 12],
            "SATURN": [3, 5, 6, 11]
        }
    }
    
    def calculate_bav(self, planet: str, planetary_positions: Dict[str, Dict]) -> List[int]:
        """Calculate Bhinnashtakavarga for a planet"""
        if planet not in self.BAV_RULES:
            return [0] * 12
        
        planet_rasi = planetary_positions[planet]["rasi"]
        bav_values = [0] * 12
        
        # Get contribution rules for this planet
        rules = self.BAV_RULES[planet]
        
        # Calculate contributions from each contributing planet
        for contrib_planet, houses in rules.items():
            if contrib_planet not in planetary_positions:
                continue
            
            contrib_rasi = planetary_positions[contrib_planet]["rasi"]
            
            # Mark benefic houses from contributing planet
            for house_offset in houses:
                target_rasi = ((contrib_rasi - 1 + house_offset - 1) % 12) + 1
                bav_values[target_rasi - 1] += 1
        
        return bav_values
    
    def calculate_sav(self, all_bavs: Dict[str, List[int]]) -> List[int]:
        """Calculate Sarvashtakavarga (sum of all BAVs)"""
        sav = [0] * 12
        
        for planet, bav in all_bavs.items():
            if planet not in ["RAHU", "KETU"]:
                for i in range(12):
                    sav[i] += bav[i]
        
        return sav
    
    def calculate_reductions(self, sav: List[int]) -> Dict:
        """Calculate various reduction techniques"""
        # Trikona Shodhana - remove values in trines
        trikona_reduced = sav.copy()
        for i in range(12):
            trine1 = (i + 4) % 12
            trine2 = (i + 8) % 12
            if trikona_reduced[i] > 0 and trikona_reduced[trine1] > 0:
                reduction = min(trikona_reduced[i], trikona_reduced[trine1])
                trikona_reduced[i] -= reduction
                trikona_reduced[trine1] -= reduction
        
        # Ekadhipatya Shodhana - signs owned by same planet
        ekadhipatya_reduced = sav.copy()
        dual_lordship = [(0, 7), (1, 6), (3, 10), (4, 9), (5, 11)]  # Mars, Venus, Moon/Sun, Jupiter, Saturn
        for lord1, lord2 in dual_lordship:
            if ekadhipatya_reduced[lord1] > 0 and ekadhipatya_reduced[lord2] > 0:
                reduction = min(ekadhipatya_reduced[lord1], ekadhipatya_reduced[lord2])
                ekadhipatya_reduced[lord1] -= reduction
                ekadhipatya_reduced[lord2] -= reduction
        
        return {
            "original": sav,
            "trikona_shodhana": trikona_reduced,
            "ekadhipatya_shodhana": ekadhipatya_reduced
        }
    
    def calculate_all(self, planetary_positions: Dict[str, Dict]) -> Dict:
        """Calculate complete Ashtakavarga"""
        bavs = {}
        
        # Calculate BAV for each planet
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            bavs[planet] = self.calculate_bav(planet, planetary_positions)
        
        # Calculate SAV
        sav = self.calculate_sav(bavs)
        
        # Calculate reductions
        reductions = self.calculate_reductions(sav)
        
        return {
            "bav": bavs,
            "sav": sav,
            "reductions": reductions,
            "summary": {
                "total_points": sum(sav),
                "max_rasi": sav.index(max(sav)) + 1,
                "min_rasi": sav.index(min(sav)) + 1,
                "average": sum(sav) / 12.0
            }
        }

ashtakavarga_calculator = AshtakavargaCalculator()
