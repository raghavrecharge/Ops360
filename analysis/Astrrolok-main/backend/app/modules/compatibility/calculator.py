from typing import Dict, List, Tuple
import math

class CompatibilityCalculator:
    """Calculate Ashtakoot compatibility and Manglik analysis"""
    
    def calculate_varna(self, male_moon_rasi: int, female_moon_rasi: int) -> Tuple[int, str]:
        """Varna Koot - 1 point"""
        varna_map = {
            1: 3, 2: 2, 3: 1, 4: 0,  # Aries to Cancer
            5: 3, 6: 2, 7: 1, 8: 0,  # Leo to Scorpio
            9: 3, 10: 2, 11: 1, 12: 0  # Sagittarius to Pisces
        }
        
        male_varna = varna_map[male_moon_rasi]
        female_varna = varna_map[female_moon_rasi]
        
        if male_varna >= female_varna:
            return 1, "Compatible"
        return 0, "Incompatible"
    
    def calculate_vashya(self, male_moon_rasi: int, female_moon_rasi: int) -> Tuple[int, str]:
        """Vashya Koot - 2 points"""
        vashya_groups = {
            "chatushpad": [2, 6, 10],  # Quadruped
            "dwipada": [1, 3, 5, 7, 11],  # Biped
            "jalachara": [4, 8, 12],  # Aquatic
            "keeta": [9]  # Insect
        }
        
        male_group = None
        female_group = None
        
        for group, rasis in vashya_groups.items():
            if male_moon_rasi in rasis:
                male_group = group
            if female_moon_rasi in rasis:
                female_group = group
        
        if male_group == female_group:
            return 2, "Same group - Excellent"
        elif (male_group == "chatushpad" and female_group == "dwipada") or \
             (male_group == "dwipada" and female_group == "chatushpad"):
            return 1, "Moderate compatibility"
        return 0, "Incompatible groups"
    
    def calculate_tara(self, male_nakshatra: int, female_nakshatra: int) -> Tuple[int, str]:
        """Tara Koot - 3 points"""
        diff = (female_nakshatra - male_nakshatra) % 27
        tara = (diff % 9) + 1
        
        auspicious_taras = [1, 3, 5, 7]
        if tara in auspicious_taras:
            return 3, f"Tara {tara} - Auspicious"
        elif tara in [2, 4, 6]:
            return 1.5, f"Tara {tara} - Moderate"
        return 0, f"Tara {tara} - Inauspicious"
    
    def calculate_yoni(self, male_nakshatra: int, female_nakshatra: int) -> Tuple[int, str]:
        """Yoni Koot - 4 points"""
        yoni_map = [
            "Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow",
            "Buffalo", "Tiger", "Hare", "Monkey", "Mongoose", "Lion",
            "Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow",
            "Buffalo", "Tiger", "Hare", "Monkey", "Lion"
        ]
        
        male_yoni = yoni_map[male_nakshatra - 1]
        female_yoni = yoni_map[female_nakshatra - 1]
        
        if male_yoni == female_yoni:
            return 4, "Same Yoni - Excellent"
        
        # Friendly yonis
        friendly = [
            ("Horse", "Elephant"), ("Elephant", "Sheep"), ("Serpent", "Rat"),
            ("Dog", "Hare"), ("Cat", "Rat"), ("Cow", "Buffalo")
        ]
        
        if (male_yoni, female_yoni) in friendly or (female_yoni, male_yoni) in friendly:
            return 3, "Friendly Yonis"
        
        # Enemy yonis
        enemies = [
            ("Horse", "Buffalo"), ("Elephant", "Lion"), ("Cat", "Rat"),
            ("Dog", "Monkey"), ("Serpent", "Mongoose")
        ]
        
        if (male_yoni, female_yoni) in enemies or (female_yoni, male_yoni) in enemies:
            return 0, "Enemy Yonis"
        
        return 2, "Neutral Yonis"
    
    def calculate_graha_maitri(self, male_moon_lord: str, female_moon_lord: str) -> Tuple[int, str]:
        """Graha Maitri Koot - 5 points"""
        friendship = {
            "SUN": {"friends": ["MOON", "MARS", "JUPITER"], "enemies": ["VENUS", "SATURN"]},
            "MOON": {"friends": ["SUN", "MERCURY"], "enemies": []},
            "MARS": {"friends": ["SUN", "MOON", "JUPITER"], "enemies": ["MERCURY"]},
            "MERCURY": {"friends": ["SUN", "VENUS"], "enemies": ["MOON"]},
            "JUPITER": {"friends": ["SUN", "MOON", "MARS"], "enemies": ["MERCURY", "VENUS"]},
            "VENUS": {"friends": ["MERCURY", "SATURN"], "enemies": ["SUN", "MOON"]},
            "SATURN": {"friends": ["MERCURY", "VENUS"], "enemies": ["SUN", "MOON", "MARS"]}
        }
        
        if male_moon_lord == female_moon_lord:
            return 5, "Same lord - Excellent"
        
        if female_moon_lord in friendship.get(male_moon_lord, {}).get("friends", []):
            return 4, "Friendly lords"
        
        if female_moon_lord in friendship.get(male_moon_lord, {}).get("enemies", []):
            return 0, "Enemy lords"
        
        return 2.5, "Neutral lords"
    
    def calculate_gana(self, male_nakshatra: int, female_nakshatra: int) -> Tuple[int, str]:
        """Gana Koot - 6 points"""
        # Deva, Manushya, Rakshasa classification
        deva = [1, 5, 7, 8, 13, 15, 17, 22, 27]
        manushya = [2, 4, 6, 11, 12, 20, 21, 25, 26]
        rakshasa = [3, 9, 10, 14, 16, 18, 19, 23, 24]
        
        male_gana = "Deva" if male_nakshatra in deva else "Manushya" if male_nakshatra in manushya else "Rakshasa"
        female_gana = "Deva" if female_nakshatra in deva else "Manushya" if female_nakshatra in manushya else "Rakshasa"
        
        if male_gana == female_gana:
            return 6, "Same Gana - Excellent"
        
        if (male_gana == "Deva" and female_gana == "Manushya") or \
           (male_gana == "Manushya" and female_gana == "Deva"):
            return 5, "Compatible Ganas"
        
        if (male_gana == "Manushya" and female_gana == "Rakshasa") or \
           (male_gana == "Rakshasa" and female_gana == "Manushya"):
            return 1, "Challenging Ganas"
        
        return 0, "Incompatible Ganas"
    
    def calculate_bhakoot(self, male_moon_rasi: int, female_moon_rasi: int) -> Tuple[int, str]:
        """Bhakoot Koot - 7 points"""
        diff = (female_moon_rasi - male_moon_rasi) % 12
        
        inauspicious = [2, 5, 6, 8, 12]
        
        if diff in inauspicious:
            return 0, f"Inauspicious position (2-12 or 6-8)"
        
        return 7, "Auspicious Bhakoot"
    
    def calculate_nadi(self, male_nakshatra: int, female_nakshatra: int) -> Tuple[int, str]:
        """Nadi Koot - 8 points (most important)"""
        # Aadi, Madhya, Antya classification
        aadi = [1, 4, 7, 10, 13, 16, 19, 22, 25]
        madhya = [2, 5, 8, 11, 14, 17, 20, 23, 26]
        antya = [3, 6, 9, 12, 15, 18, 21, 24, 27]
        
        male_nadi = "Aadi" if male_nakshatra in aadi else "Madhya" if male_nakshatra in madhya else "Antya"
        female_nadi = "Aadi" if female_nakshatra in aadi else "Madhya" if female_nakshatra in madhya else "Antya"
        
        if male_nadi != female_nadi:
            return 8, "Different Nadi - Excellent"
        
        return 0, "Same Nadi - Inauspicious (Nadi Dosha)"
    
    def calculate_ashtakoot(self, male_chart: Dict, female_chart: Dict) -> Dict:
        """Calculate complete Ashtakoot compatibility"""
        male_moon = male_chart["planets"]["MOON"]
        female_moon = female_chart["planets"]["MOON"]
        
        male_moon_rasi = male_moon["rasi"]
        female_moon_rasi = female_moon["rasi"]
        
        # Convert nakshatra name to number
        nakshatra_names = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
            "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
            "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
            "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ]
        
        male_nakshatra = nakshatra_names.index(male_moon["nakshatra"]) + 1
        female_nakshatra = nakshatra_names.index(female_moon["nakshatra"]) + 1
        
        scores = {}
        scores["varna"] = self.calculate_varna(male_moon_rasi, female_moon_rasi)
        scores["vashya"] = self.calculate_vashya(male_moon_rasi, female_moon_rasi)
        scores["tara"] = self.calculate_tara(male_nakshatra, female_nakshatra)
        scores["yoni"] = self.calculate_yoni(male_nakshatra, female_nakshatra)
        scores["graha_maitri"] = self.calculate_graha_maitri("MOON", "MOON")  # Simplified
        scores["gana"] = self.calculate_gana(male_nakshatra, female_nakshatra)
        scores["bhakoot"] = self.calculate_bhakoot(male_moon_rasi, female_moon_rasi)
        scores["nadi"] = self.calculate_nadi(male_nakshatra, female_nakshatra)
        
        total_score = sum(s[0] for s in scores.values())
        max_score = 36
        
        return {
            "scores": scores,
            "total": total_score,
            "max": max_score,
            "percentage": (total_score / max_score) * 100,
            "compatibility": "Excellent" if total_score >= 25 else "Good" if total_score >= 18 else "Average" if total_score >= 12 else "Poor"
        }
    
    def check_manglik(self, chart: Dict) -> Dict:
        """Check Manglik dosha"""
        mars = chart["planets"]["MARS"]
        mars_rasi = mars["rasi"]
        asc_rasi = int(chart["ascendant"] / 30.0) + 1
        
        # Mars in 1st, 4th, 7th, 8th, 12th from ascendant causes Manglik
        mars_house = ((mars_rasi - asc_rasi) % 12) + 1
        
        manglik_houses = [1, 4, 7, 8, 12]
        is_manglik = mars_house in manglik_houses
        
        # Check cancellations
        cancellations = []
        
        if mars.get("dignity") in ["Own", "Exalted"]:
            cancellations.append("Mars in own/exalted sign")
        
        jupiter = chart["planets"]["JUPITER"]
        jupiter_rasi = jupiter["rasi"]
        
        # Jupiter aspecting Mars or 7th house
        mars_jupiter_diff = abs(mars_rasi - jupiter_rasi)
        if mars_jupiter_diff in [4, 8]:  # 5th or 9th aspect
            cancellations.append("Jupiter aspects Mars")
        
        return {
            "is_manglik": is_manglik,
            "mars_house": mars_house,
            "severity": "High" if mars_house in [7, 8] else "Moderate" if is_manglik else "None",
            "cancellations": cancellations,
            "cancelled": len(cancellations) > 0
        }

compatibility_calculator = CompatibilityCalculator()
