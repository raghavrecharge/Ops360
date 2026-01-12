from typing import Dict, List
import yaml
import os

YOGA_RULES_PATH = "/app/backend/app/modules/yoga/rules.yaml"

class YogaDetector:
    """Detect yogas using rule engine"""
    
    def __init__(self):
        self.rules = self.load_rules()
    
    def load_rules(self) -> List[Dict]:
        """Load yoga rules from YAML file"""
        if os.path.exists(YOGA_RULES_PATH):
            with open(YOGA_RULES_PATH, 'r') as f:
                return yaml.safe_load(f) or []
        return self.get_default_rules()
    
    def get_default_rules(self) -> List[Dict]:
        """Default yoga rules"""
        return [
            {
                "name": "Gaja Kesari Yoga",
                "type": "Raja",
                "description": "Jupiter in kendra from Moon",
                "conditions": [
                    {"type": "kendra_from", "planet1": "JUPITER", "planet2": "MOON"}
                ],
                "strength": 8
            },
            {
                "name": "Hamsa Yoga",
                "type": "Pancha Mahapurusha",
                "description": "Jupiter in kendra in own/exalted sign",
                "conditions": [
                    {"type": "in_kendra", "planet": "JUPITER"},
                    {"type": "dignity", "planet": "JUPITER", "values": ["Own", "Exalted"]}
                ],
                "strength": 9
            },
            {
                "name": "Ruchaka Yoga",
                "type": "Pancha Mahapurusha",
                "description": "Mars in kendra in own/exalted sign",
                "conditions": [
                    {"type": "in_kendra", "planet": "MARS"},
                    {"type": "dignity", "planet": "MARS", "values": ["Own", "Exalted"]}
                ],
                "strength": 9
            },
            {
                "name": "Bhadra Yoga",
                "type": "Pancha Mahapurusha",
                "description": "Mercury in kendra in own/exalted sign",
                "conditions": [
                    {"type": "in_kendra", "planet": "MERCURY"},
                    {"type": "dignity", "planet": "MERCURY", "values": ["Own", "Exalted"]}
                ],
                "strength": 9
            },
            {
                "name": "Malavya Yoga",
                "type": "Pancha Mahapurusha",
                "description": "Venus in kendra in own/exalted sign",
                "conditions": [
                    {"type": "in_kendra", "planet": "VENUS"},
                    {"type": "dignity", "planet": "VENUS", "values": ["Own", "Exalted"]}
                ],
                "strength": 9
            },
            {
                "name": "Sasa Yoga",
                "type": "Pancha Mahapurusha",
                "description": "Saturn in kendra in own/exalted sign",
                "conditions": [
                    {"type": "in_kendra", "planet": "SATURN"},
                    {"type": "dignity", "planet": "SATURN", "values": ["Own", "Exalted"]}
                ],
                "strength": 9
            },
            {
                "name": "Neecha Bhanga Raja Yoga",
                "type": "Raja",
                "description": "Debilitated planet with cancellation",
                "conditions": [
                    {"type": "debilitated_planet_exists"}
                ],
                "strength": 7
            },
            {
                "name": "Vipreet Raja Yoga - Harsha",
                "type": "Vipreet Raja",
                "description": "6th lord in 6th/8th/12th house",
                "conditions": [
                    {"type": "lord_in_dusthana", "house": 6}
                ],
                "strength": 6
            },
            {
                "name": "Vipreet Raja Yoga - Sarala",
                "type": "Vipreet Raja",
                "description": "8th lord in 6th/8th/12th house",
                "conditions": [
                    {"type": "lord_in_dusthana", "house": 8}
                ],
                "strength": 6
            },
            {
                "name": "Vipreet Raja Yoga - Vimala",
                "type": "Vipreet Raja",
                "description": "12th lord in 6th/8th/12th house",
                "conditions": [
                    {"type": "lord_in_dusthana", "house": 12}
                ],
                "strength": 6
            },
            {
                "name": "Dhana Yoga - 2nd & 11th",
                "type": "Dhana",
                "description": "2nd and 11th lords conjunct or mutual aspect",
                "conditions": [
                    {"type": "lords_connected", "houses": [2, 11]}
                ],
                "strength": 7
            },
            {
                "name": "Dhana Yoga - 5th & 9th",
                "type": "Dhana",
                "description": "5th and 9th lords conjunct or mutual aspect",
                "conditions": [
                    {"type": "lords_connected", "houses": [5, 9]}
                ],
                "strength": 8
            },
            {
                "name": "Budhaditya Yoga",
                "type": "Auspicious",
                "description": "Sun and Mercury conjunct",
                "conditions": [
                    {"type": "conjunction", "planets": ["SUN", "MERCURY"]}
                ],
                "strength": 6
            },
            {
                "name": "Lakshmi Yoga",
                "type": "Dhana",
                "description": "9th lord in kendra, strong Venus",
                "conditions": [
                    {"type": "house_lord_in_kendra", "house": 9}
                ],
                "strength": 8
            },
            {
                "name": "Adhi Yoga",
                "type": "Raja",
                "description": "Benefics in 6th, 7th, 8th from Moon",
                "conditions": [
                    {"type": "benefics_from_moon", "houses": [6, 7, 8]}
                ],
                "strength": 7
            },
            {
                "name": "Vasumathi Yoga",
                "type": "Dhana",
                "description": "Benefics in upachaya houses from Moon",
                "conditions": [
                    {"type": "benefics_in_upachaya"}
                ],
                "strength": 6
            },
            {
                "name": "Amala Yoga",
                "type": "Auspicious",
                "description": "Benefic in 10th from Ascendant or Moon",
                "conditions": [
                    {"type": "benefic_in_10th"}
                ],
                "strength": 7
            },
            {
                "name": "Parvata Yoga",
                "type": "Raja",
                "description": "Benefics in kendras, no malefics in kendras",
                "conditions": [
                    {"type": "benefics_in_kendras"}
                ],
                "strength": 7
            },
            {
                "name": "Kahala Yoga",
                "type": "Raja",
                "description": "4th and 9th lords in mutual kendras",
                "conditions": [
                    {"type": "lords_in_mutual_kendras", "houses": [4, 9]}
                ],
                "strength": 7
            },
            {
                "name": "Chamara Yoga",
                "type": "Raja",
                "description": "Two benefics in ascendant or exalted",
                "conditions": [
                    {"type": "exalted_planets_count", "min": 2}
                ],
                "strength": 8
            }
        ]
    
    def check_kendra_from(self, planet1_rasi: int, planet2_rasi: int) -> bool:
        """Check if planet1 is in kendra (1,4,7,10) from planet2"""
        diff = (planet1_rasi - planet2_rasi) % 12
        return diff in [0, 3, 6, 9]
    
    def check_in_kendra(self, planet_rasi: int, asc_rasi: int) -> bool:
        """Check if planet is in kendra from ascendant"""
        diff = (planet_rasi - asc_rasi) % 12
        return diff in [0, 3, 6, 9]
    
    def detect_yogas(self, planets: Dict[str, Dict], ascendant: float) -> List[Dict]:
        """Detect all yogas in chart"""
        detected_yogas = []
        asc_rasi = int(ascendant / 30.0) + 1
        
        for rule in self.rules:
            if self.check_rule(rule, planets, asc_rasi):
                detected_yogas.append({
                    "name": rule["name"],
                    "type": rule["type"],
                    "description": rule["description"],
                    "strength": rule["strength"],
                    "forming_planets": self.get_forming_planets(rule, planets),
                    "rule_reference": rule["name"]
                })
        
        return detected_yogas
    
    def check_rule(self, rule: Dict, planets: Dict[str, Dict], asc_rasi: int) -> bool:
        """Check if a rule's conditions are satisfied"""
        for condition in rule["conditions"]:
            cond_type = condition["type"]
            
            if cond_type == "kendra_from":
                p1 = planets.get(condition["planet1"], {}).get("rasi")
                p2 = planets.get(condition["planet2"], {}).get("rasi")
                if not p1 or not p2:
                    return False
                if not self.check_kendra_from(p1, p2):
                    return False
            
            elif cond_type == "in_kendra":
                planet = planets.get(condition["planet"], {})
                if not planet:
                    return False
                if not self.check_in_kendra(planet["rasi"], asc_rasi):
                    return False
            
            elif cond_type == "dignity":
                planet = planets.get(condition["planet"], {})
                if not planet:
                    return False
                if planet.get("dignity") not in condition["values"]:
                    return False
            
            elif cond_type == "debilitated_planet_exists":
                has_debilitated = any(p.get("dignity") == "Debilitated" for p in planets.values())
                if not has_debilitated:
                    return False
            
            elif cond_type == "conjunction":
                planets_list = condition["planets"]
                if len(planets_list) < 2:
                    return False
                rasi_list = [planets.get(p, {}).get("rasi") for p in planets_list]
                if None in rasi_list:
                    return False
                if len(set(rasi_list)) != 1:  # All must be in same rasi
                    return False
            
            elif cond_type == "benefic_in_10th":
                benefics = ["JUPITER", "VENUS", "MERCURY", "MOON"]
                tenth_house = (asc_rasi + 9) % 12 + 1
                has_benefic = any(planets.get(b, {}).get("rasi") == tenth_house for b in benefics)
                if not has_benefic:
                    return False
            
            elif cond_type == "exalted_planets_count":
                exalted_count = sum(1 for p in planets.values() if p.get("dignity") == "Exalted")
                if exalted_count < condition.get("min", 1):
                    return False
        
        return True
    
    def get_forming_planets(self, rule: Dict, planets: Dict[str, Dict]) -> List[str]:
        """Get list of planets involved in forming the yoga"""
        forming = []
        for condition in rule["conditions"]:
            if "planet" in condition:
                forming.append(condition["planet"])
            elif "planet1" in condition and "planet2" in condition:
                forming.extend([condition["planet1"], condition["planet2"]])
            elif "planets" in condition:
                forming.extend(condition["planets"])
        return list(set(forming))

yoga_detector = YogaDetector()
