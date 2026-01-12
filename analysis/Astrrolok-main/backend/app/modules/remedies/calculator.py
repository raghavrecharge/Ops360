from typing import Dict, List
from datetime import datetime

class RemediesCalculator:
    """Calculate astrological remedies based on chart analysis"""
    
    # Planetary gemstones
    GEMSTONES = {
        "SUN": {"primary": "Ruby", "secondary": "Red Spinel", "metal": "Gold", "finger": "Ring"},
        "MOON": {"primary": "Pearl", "secondary": "Moonstone", "metal": "Silver", "finger": "Little"},
        "MARS": {"primary": "Red Coral", "secondary": "Carnelian", "metal": "Copper", "finger": "Ring"},
        "MERCURY": {"primary": "Emerald", "secondary": "Green Tourmaline", "metal": "Bronze", "finger": "Little"},
        "JUPITER": {"primary": "Yellow Sapphire", "secondary": "Yellow Topaz", "metal": "Gold", "finger": "Index"},
        "VENUS": {"primary": "Diamond", "secondary": "White Sapphire", "metal": "Silver", "finger": "Middle"},
        "SATURN": {"primary": "Blue Sapphire", "secondary": "Amethyst", "metal": "Iron", "finger": "Middle"},
        "RAHU": {"primary": "Hessonite", "secondary": "Orange Zircon", "metal": "Mixed", "finger": "Middle"},
        "KETU": {"primary": "Cat's Eye", "secondary": "Chrysoberyl", "metal": "Mixed", "finger": "Little"}
    }
    
    # Planetary mantras
    MANTRAS = {
        "SUN": {
            "beej": "Om Hraam Hreem Hraum Sah Suryaya Namah",
            "vedic": "Om Aakrishnen Rajasa Vartamano Nivesayann Amritam Martyam Cha",
            "count": 7000,
            "day": "Sunday"
        },
        "MOON": {
            "beej": "Om Shraam Shreem Shraum Sah Chandraya Namah",
            "vedic": "Om Imam Deva Asaptishthaye Suryam Vishve Krinvantu",
            "count": 11000,
            "day": "Monday"
        },
        "MARS": {
            "beej": "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
            "vedic": "Om Agnir Murdhaa Divah Kakut Patih Prithivyaa Ayam",
            "count": 10000,
            "day": "Tuesday"
        },
        "MERCURY": {
            "beej": "Om Braam Breem Braum Sah Budhaya Namah",
            "vedic": "Om Udbudhyaswaagne Prati Jaagrihi Twamishta",
            "count": 9000,
            "day": "Wednesday"
        },
        "JUPITER": {
            "beej": "Om Graam Greem Graum Sah Gurave Namah",
            "vedic": "Om Brihaspateh Atiyad Aryo Arhadyumad Vibhati",
            "count": 19000,
            "day": "Thursday"
        },
        "VENUS": {
            "beej": "Om Draam Dreem Draum Sah Shukraya Namah",
            "vedic": "Om Annaatparisruto Rasam Brahmana Vyapibat",
            "count": 16000,
            "day": "Friday"
        },
        "SATURN": {
            "beej": "Om Praam Preem Praum Sah Shanaye Namah",
            "vedic": "Om Shanno Devirabhishtaya Aapo Bhavantu Pitaye",
            "count": 23000,
            "day": "Saturday"
        },
        "RAHU": {
            "beej": "Om Bhraam Bhreem Bhraum Sah Rahave Namah",
            "vedic": "Om Ardha Kayam Mahaveryam Chandraditya Vimardanam",
            "count": 18000,
            "day": "Saturday"
        },
        "KETU": {
            "beej": "Om Straam Streem Straum Sah Ketave Namah",
            "vedic": "Om Ketum Krinvann Aketa Ve Pesho Maryaa Apesha Se",
            "count": 17000,
            "day": "Tuesday"
        }
    }
    
    # Charity recommendations
    CHARITIES = {
        "SUN": ["Donate wheat", "Help father figures", "Donate copper", "Give to temples"],
        "MOON": {"items": ["Rice", "White cloth", "Silver", "Milk"], "beneficiary": "Women and elderly"},
        "MARS": {"items": ["Red lentils", "Copper", "Red cloth"], "beneficiary": "Brothers, soldiers"},
        "MERCURY": {"items": ["Green moong", "Green cloth", "Books"], "beneficiary": "Students, writers"},
        "JUPITER": {"items": ["Turmeric", "Yellow cloth", "Gold"], "beneficiary": "Teachers, priests"},
        "VENUS": {"items": ["White rice", "Silk cloth", "Perfumes"], "beneficiary": "Women, artists"},
        "SATURN": {"items": ["Black sesame", "Iron", "Oil"], "beneficiary": "Servants, elderly, disabled"},
        "RAHU": {"items": ["Blue cloth", "Coconut", "Electrical items"], "beneficiary": "Outcasts, foreigners"},
        "KETU": {"items": ["Blankets", "Multi-colored items"], "beneficiary": "Dogs, spiritual people"}
    }
    
    # Fasting days
    FASTING = {
        "SUN": {"day": "Sunday", "food_to_avoid": "Salt", "food_allowed": "Fruits, milk"},
        "MOON": {"day": "Monday", "food_to_avoid": "Salt, grains", "food_allowed": "Fruits, milk"},
        "MARS": {"day": "Tuesday", "food_to_avoid": "Salt, red items", "food_allowed": "Sweet items"},
        "MERCURY": {"day": "Wednesday", "food_to_avoid": "Green vegetables", "food_allowed": "Milk products"},
        "JUPITER": {"day": "Thursday", "food_to_avoid": "Salt", "food_allowed": "Yellow foods, fruits"},
        "VENUS": {"day": "Friday", "food_to_avoid": "Sour items", "food_allowed": "Sweet items"},
        "SATURN": {"day": "Saturday", "food_to_avoid": "Salt, oil", "food_allowed": "Simple food"},
        "RAHU": {"day": "Saturday", "food_to_avoid": "Non-veg", "food_allowed": "Simple vegetarian"},
        "KETU": {"day": "Tuesday", "food_to_avoid": "Spicy food", "food_allowed": "Bland food"}
    }
    
    # Rudraksha recommendations
    RUDRAKSHA = {
        "SUN": {"mukhi": 1, "alternate": 12, "benefit": "Leadership, confidence"},
        "MOON": {"mukhi": 2, "alternate": 11, "benefit": "Emotional balance, peace"},
        "MARS": {"mukhi": 3, "alternate": None, "benefit": "Courage, energy"},
        "MERCURY": {"mukhi": 4, "alternate": 10, "benefit": "Intelligence, communication"},
        "JUPITER": {"mukhi": 5, "alternate": None, "benefit": "Wisdom, prosperity"},
        "VENUS": {"mukhi": 6, "alternate": 13, "benefit": "Love, creativity"},
        "SATURN": {"mukhi": 7, "alternate": 14, "benefit": "Stability, discipline"},
        "RAHU": {"mukhi": 8, "alternate": None, "benefit": "Protection, overcoming obstacles"},
        "KETU": {"mukhi": 9, "alternate": None, "benefit": "Spiritual growth, liberation"}
    }
    
    def get_weak_planets(self, shadbala: Dict, threshold: float = 1.0) -> List[str]:
        """Identify weak planets from Shadbala"""
        weak = []
        for planet, data in shadbala.items():
            if data.get("strength_ratio", 0) < threshold:
                weak.append(planet)
        return weak
    
    def get_afflicted_planets(self, planets: Dict, yogas: List[Dict] = None) -> List[str]:
        """Identify afflicted planets"""
        afflicted = []
        
        for planet, pos in planets.items():
            if planet in ["RAHU", "KETU"]:
                continue
            
            dignity = pos.get("dignity", "Neutral")
            is_combust = pos.get("is_combust", False)
            is_retrograde = pos.get("is_retrograde", False)
            
            # Check for affliction
            if dignity == "Debilitated":
                afflicted.append(planet)
            elif is_combust and planet != "SUN":
                afflicted.append(planet)
        
        return list(set(afflicted))
    
    def generate_gemstone_remedy(self, planet: str, is_weak: bool = True) -> Dict:
        """Generate gemstone remedy for a planet"""
        gem_data = self.GEMSTONES.get(planet, {})
        
        return {
            "remedy_type": "Gemstone",
            "planet": planet,
            "primary_gem": gem_data.get("primary", "Unknown"),
            "secondary_gem": gem_data.get("secondary", "Unknown"),
            "metal": gem_data.get("metal", "Gold"),
            "finger": gem_data.get("finger", "Ring"),
            "weight": "3-5 carats minimum",
            "day_to_wear": self.MANTRAS.get(planet, {}).get("day", "Sunday"),
            "caution": "Consult an astrologer before wearing",
            "implementation_steps": [
                f"Get the {gem_data.get('primary')} tested for authenticity",
                f"Set in {gem_data.get('metal')} metal",
                f"Wear on {gem_data.get('finger')} finger of right hand",
                f"Energize on a {self.MANTRAS.get(planet, {}).get('day', 'Sunday')} during {planet} hora"
            ]
        }
    
    def generate_mantra_remedy(self, planet: str) -> Dict:
        """Generate mantra remedy for a planet"""
        mantra_data = self.MANTRAS.get(planet, {})
        
        return {
            "remedy_type": "Mantra",
            "planet": planet,
            "beej_mantra": mantra_data.get("beej", ""),
            "vedic_mantra": mantra_data.get("vedic", ""),
            "minimum_count": mantra_data.get("count", 10000),
            "best_day": mantra_data.get("day", "Sunday"),
            "duration": "40 days continuous",
            "implementation_steps": [
                "Wake up during Brahma Muhurta (1.5 hours before sunrise)",
                "Take bath and wear clean clothes",
                f"Face East and chant the {planet} mantra",
                f"Complete at least 108 repetitions daily",
                f"Best results when done on {mantra_data.get('day', 'Sunday')}"
            ]
        }
    
    def generate_charity_remedy(self, planet: str) -> Dict:
        """Generate charity remedy for a planet"""
        charity_data = self.CHARITIES.get(planet, {})
        
        if isinstance(charity_data, list):
            items = charity_data
            beneficiary = "Needy people"
        else:
            items = charity_data.get("items", [])
            beneficiary = charity_data.get("beneficiary", "Needy people")
        
        mantra_data = self.MANTRAS.get(planet, {})
        
        return {
            "remedy_type": "Charity",
            "planet": planet,
            "items_to_donate": items,
            "beneficiary": beneficiary,
            "best_day": mantra_data.get("day", "Sunday"),
            "frequency": "Weekly or monthly",
            "implementation_steps": [
                f"Perform charity on {mantra_data.get('day', 'Sunday')}",
                f"Donate: {', '.join(items) if isinstance(items, list) else items}",
                f"Give to: {beneficiary}",
                "Do with pure intentions without expecting returns"
            ]
        }
    
    def generate_fasting_remedy(self, planet: str) -> Dict:
        """Generate fasting remedy for a planet"""
        fast_data = self.FASTING.get(planet, {})
        
        return {
            "remedy_type": "Fasting",
            "planet": planet,
            "fasting_day": fast_data.get("day", "Sunday"),
            "food_to_avoid": fast_data.get("food_to_avoid", "Salt"),
            "food_allowed": fast_data.get("food_allowed", "Fruits"),
            "duration": "Sunrise to sunset or full day",
            "implementation_steps": [
                f"Observe fast on {fast_data.get('day', 'Sunday')}",
                f"Avoid: {fast_data.get('food_to_avoid', 'Salt')}",
                f"You may consume: {fast_data.get('food_allowed', 'Fruits')}",
                "Break fast after sunset with simple food",
                "Continue for 40 days or specific number of weeks"
            ]
        }
    
    def generate_rudraksha_remedy(self, planet: str) -> Dict:
        """Generate Rudraksha remedy for a planet"""
        rudra_data = self.RUDRAKSHA.get(planet, {})
        
        return {
            "remedy_type": "Rudraksha",
            "planet": planet,
            "primary_mukhi": rudra_data.get("mukhi", 5),
            "alternate_mukhi": rudra_data.get("alternate"),
            "benefit": rudra_data.get("benefit", "General well-being"),
            "implementation_steps": [
                f"Obtain authentic {rudra_data.get('mukhi', 5)} Mukhi Rudraksha",
                "Get it energized by a priest or do self-energization",
                f"Wear on {self.MANTRAS.get(planet, {}).get('day', 'Sunday')}",
                "Can be worn as pendant or bracelet",
                "Remove during sleep and impure activities"
            ]
        }
    
    def generate_all_remedies(self, planets: Dict, shadbala: Dict = None, yogas: List[Dict] = None) -> Dict:
        """Generate comprehensive remedies based on chart analysis"""
        # Identify problem areas
        weak_planets = self.get_weak_planets(shadbala) if shadbala else []
        afflicted_planets = self.get_afflicted_planets(planets, yogas)
        
        # Combine and prioritize
        problem_planets = list(set(weak_planets + afflicted_planets))
        
        remedies = {
            "weak_planets": weak_planets,
            "afflicted_planets": afflicted_planets,
            "priority_planets": problem_planets[:3],  # Top 3 priorities
            "remedies_by_planet": {},
            "general_recommendations": []
        }
        
        # Generate remedies for each problem planet
        for planet in problem_planets:
            planet_remedies = {
                "gemstone": self.generate_gemstone_remedy(planet),
                "mantra": self.generate_mantra_remedy(planet),
                "charity": self.generate_charity_remedy(planet),
                "fasting": self.generate_fasting_remedy(planet),
                "rudraksha": self.generate_rudraksha_remedy(planet)
            }
            remedies["remedies_by_planet"][planet] = planet_remedies
        
        # General recommendations
        remedies["general_recommendations"] = [
            "Consult a qualified astrologer before implementing major remedies",
            "Gemstones should be worn only after proper consultation",
            "Mantras should be learned from a guru for proper pronunciation",
            "Charity should be done with pure intentions",
            "Combine multiple remedies for better results"
        ]
        
        return remedies
    
    def generate_quick_remedies(self, planet: str) -> List[Dict]:
        """Generate quick and easy remedies for a specific planet"""
        remedies = []
        
        # Add mantra
        mantra_data = self.MANTRAS.get(planet, {})
        remedies.append({
            "type": "Daily Mantra",
            "description": f"Chant '{mantra_data.get('beej', '')}' 108 times daily",
            "effort": "Low",
            "time": "15-20 minutes daily"
        })
        
        # Add charity
        charity_data = self.CHARITIES.get(planet, {})
        items = charity_data if isinstance(charity_data, list) else charity_data.get("items", [])
        remedies.append({
            "type": "Weekly Charity",
            "description": f"Donate {items[0] if items else 'appropriate items'} on {mantra_data.get('day', 'Sunday')}",
            "effort": "Low",
            "time": "Once a week"
        })
        
        # Add fasting
        fast_data = self.FASTING.get(planet, {})
        remedies.append({
            "type": "Fasting",
            "description": f"Fast on {fast_data.get('day', 'Sunday')}s, avoid {fast_data.get('food_to_avoid', 'salt')}",
            "effort": "Medium",
            "time": "Weekly"
        })
        
        return remedies

remedies_calculator = RemediesCalculator()
