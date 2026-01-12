from typing import Dict, List, Tuple
from datetime import datetime, date, time, timedelta
import hashlib
import json

class Align27Calculator:
    """
    Deterministic calculator for Align27 features:
    - Day scores (Cosmic Traffic Light)
    - Moments (Golden/Productive/Silence windows)
    - Rituals recommendations
    """
    
    # Planetary hora order (Sunday starts with Sun)
    HORA_ORDER = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]
    
    # Weekday lords
    WEEKDAY_LORDS = {
        0: "MOON",    # Monday
        1: "MARS",    # Tuesday
        2: "MERCURY", # Wednesday
        3: "JUPITER", # Thursday
        4: "VENUS",   # Friday
        5: "SATURN",  # Saturday
        6: "SUN"      # Sunday
    }
    
    # Benefic/malefic classification
    BENEFICS = ["JUPITER", "VENUS", "MERCURY", "MOON"]
    MALEFICS = ["SUN", "MARS", "SATURN", "RAHU", "KETU"]
    
    # Transit impact weights
    TRANSIT_WEIGHTS = {
        "JUPITER": 3.0,
        "SATURN": 2.5,
        "MARS": 1.5,
        "VENUS": 1.0,
        "MERCURY": 0.8,
        "SUN": 0.7,
        "MOON": 0.5
    }
    
    def calculate_day_score(self, 
                           target_date: date,
                           natal_moon_rasi: int,
                           natal_asc_rasi: int,
                           transiting_planets: Dict,
                           current_dasha: Dict) -> Dict:
        """
        Calculate daily score (0-100) and traffic light color.
        Deterministic based on:
        - Transit positions relative to natal Moon/Asc
        - Current dasha lord strength
        - Day lord compatibility
        - Hora favorability
        """
        score = 50.0  # Base score
        reasons = []
        key_transits = []
        
        # 1. Weekday lord compatibility (max ±10)
        weekday = target_date.weekday()
        day_lord = self.WEEKDAY_LORDS[weekday]
        day_lord_score = self._score_day_lord(day_lord, natal_moon_rasi, natal_asc_rasi)
        score += day_lord_score
        if day_lord_score > 0:
            reasons.append(f"{day_lord} day favorable for your chart")
        elif day_lord_score < 0:
            reasons.append(f"{day_lord} day requires caution")
        
        # 2. Transit effects (max ±25)
        for planet, pos in transiting_planets.items():
            if planet in ["RAHU", "KETU"]:
                continue
            
            transit_rasi = pos.get("rasi", 1)
            effect = self._calculate_transit_effect(
                planet, transit_rasi, natal_moon_rasi, natal_asc_rasi
            )
            
            weight = self.TRANSIT_WEIGHTS.get(planet, 0.5)
            weighted_effect = effect * weight
            score += weighted_effect
            
            if abs(weighted_effect) >= 2:
                transit_type = "benefic" if weighted_effect > 0 else "challenging"
                key_transits.append({
                    "planet": planet,
                    "rasi": transit_rasi,
                    "effect": transit_type,
                    "impact": round(weighted_effect, 1)
                })
                if weighted_effect > 0:
                    reasons.append(f"{planet} transit supporting your chart")
                else:
                    reasons.append(f"{planet} transit creating obstacles")
        
        # 3. Dasha lord influence (max ±15)
        dasha_score = self._score_dasha_influence(current_dasha, natal_asc_rasi)
        score += dasha_score
        if current_dasha:
            if dasha_score > 0:
                reasons.append(f"{current_dasha.get('lord', 'Current')} dasha period favorable")
            elif dasha_score < 0:
                reasons.append(f"{current_dasha.get('lord', 'Current')} dasha period challenging")
        
        # 4. Tithi/Lunar phase influence (max ±5)
        moon_phase_score = self._calculate_moon_phase_score(target_date)
        score += moon_phase_score
        
        # Clamp score to 0-100
        score = max(0, min(100, score))
        
        # Determine traffic light color
        if score >= 65:
            color = "GREEN"
        elif score >= 40:
            color = "AMBER"
        else:
            color = "RED"
        
        return {
            "score": round(score, 1),
            "color": color,
            "reasons": reasons[:5],  # Top 5 reasons
            "key_transits": key_transits,
            "dasha_overlay": current_dasha
        }
    
    def _score_day_lord(self, day_lord: str, moon_rasi: int, asc_rasi: int) -> float:
        """Score the day lord based on natal chart"""
        # Check natural friendship with Moon sign lord
        moon_lord = self._get_rasi_lord(moon_rasi)
        asc_lord = self._get_rasi_lord(asc_rasi)
        
        score = 0.0
        
        # Day lord same as Moon/Asc lord = favorable
        if day_lord == moon_lord:
            score += 5.0
        if day_lord == asc_lord:
            score += 5.0
        
        # Benefic day lord = bonus
        if day_lord in self.BENEFICS:
            score += 2.0
        elif day_lord in self.MALEFICS:
            score -= 2.0
        
        return min(10, max(-10, score))
    
    def _calculate_transit_effect(self, planet: str, transit_rasi: int, 
                                   moon_rasi: int, asc_rasi: int) -> float:
        """Calculate transit effect based on house from Moon/Asc"""
        # House from Moon
        house_from_moon = ((transit_rasi - moon_rasi) % 12) + 1
        
        # Benefic houses: 1, 2, 4, 5, 7, 9, 10, 11
        benefic_houses = [1, 2, 4, 5, 7, 9, 10, 11]
        # Challenging houses: 3, 6, 8, 12
        challenging_houses = [6, 8, 12]
        
        effect = 0.0
        
        if house_from_moon in benefic_houses:
            effect += 3.0 if planet in self.BENEFICS else 1.5
        elif house_from_moon in challenging_houses:
            effect -= 3.0 if planet in self.MALEFICS else 1.5
        
        # Special case: Jupiter in 2, 5, 7, 9, 11 from Moon
        if planet == "JUPITER" and house_from_moon in [2, 5, 7, 9, 11]:
            effect += 2.0
        
        # Special case: Saturn in 3, 6, 11 from Moon (favorable)
        if planet == "SATURN" and house_from_moon in [3, 6, 11]:
            effect += 1.5
        
        return effect
    
    def _score_dasha_influence(self, dasha: Dict, asc_rasi: int) -> float:
        """Score current dasha period influence"""
        if not dasha:
            return 0.0
        
        lord = dasha.get("lord", "")
        
        # Benefic dasha lords
        if lord in ["JUPITER", "VENUS"]:
            return 10.0
        elif lord in ["MERCURY", "MOON"]:
            return 5.0
        elif lord in ["SUN"]:
            return 2.0
        elif lord in ["MARS", "SATURN"]:
            return -5.0
        elif lord in ["RAHU", "KETU"]:
            return -8.0
        
        return 0.0
    
    def _calculate_moon_phase_score(self, target_date: date) -> float:
        """Calculate score based on lunar phase (simplified)"""
        # Use a deterministic calculation based on date
        day_of_month = target_date.day
        
        # Approximate tithi (1-15 Shukla, 16-30 Krishna)
        tithi = (day_of_month % 30) + 1
        
        # Favorable tithis: 2, 3, 5, 7, 10, 11, 13 (Shukla Paksha)
        favorable_tithis = [2, 3, 5, 7, 10, 11, 13]
        # Unfavorable: 4, 8, 9, 14, 30 (Amavasya), 15 (Purnima has mixed results)
        unfavorable_tithis = [4, 8, 9, 14, 30]
        
        if tithi in favorable_tithis or (tithi + 15) % 30 in favorable_tithis:
            return 3.0
        elif tithi in unfavorable_tithis or (tithi + 15) % 30 in unfavorable_tithis:
            return -3.0
        
        return 0.0
    
    def _get_rasi_lord(self, rasi: int) -> str:
        """Get the lord of a rasi"""
        lords = {
            1: "MARS", 2: "VENUS", 3: "MERCURY", 4: "MOON",
            5: "SUN", 6: "MERCURY", 7: "VENUS", 8: "MARS",
            9: "JUPITER", 10: "SATURN", 11: "SATURN", 12: "JUPITER"
        }
        return lords.get(rasi, "SUN")
    
    def generate_moments(self,
                        target_date: date,
                        natal_moon_rasi: int,
                        natal_asc_rasi: int,
                        transiting_planets: Dict,
                        sunrise: time = time(6, 0),
                        sunset: time = time(18, 0)) -> List[Dict]:
        """
        Generate non-overlapping time windows for GOLDEN, PRODUCTIVE, SILENCE.
        Based on planetary horas and transit positions.
        """
        moments = []
        dt_start = datetime.combine(target_date, sunrise)
        dt_end = datetime.combine(target_date, sunset)
        
        # Calculate hora duration (day divided by 12)
        day_duration = (dt_end - dt_start).total_seconds()
        hora_duration = day_duration / 12
        
        # Get weekday to determine starting hora
        weekday = target_date.weekday()
        # Sunday=6 starts with Sun hora, etc.
        day_lord_index = [6, 0, 1, 2, 3, 4, 5][weekday]  # Map weekday to lord index
        
        # Generate hora windows
        hora_windows = []
        for i in range(12):
            hora_lord_index = (day_lord_index + i) % 7
            hora_lord = self.HORA_ORDER[hora_lord_index]
            
            hora_start = dt_start + timedelta(seconds=i * hora_duration)
            hora_end = hora_start + timedelta(seconds=hora_duration)
            
            hora_windows.append({
                "lord": hora_lord,
                "start": hora_start,
                "end": hora_end,
                "score": self._score_hora(hora_lord, natal_moon_rasi, natal_asc_rasi)
            })
        
        # Sort by score to identify best windows
        sorted_horas = sorted(hora_windows, key=lambda x: x["score"], reverse=True)
        
        # Assign moment types based on hora quality
        used_times = set()
        
        # GOLDEN: Best hora window
        golden_hora = sorted_horas[0]
        moments.append({
            "type": "GOLDEN",
            "start": golden_hora["start"],
            "end": golden_hora["end"],
            "reason": f"{golden_hora['lord']} hora - most auspicious for important activities",
            "confidence": min(1.0, 0.5 + golden_hora["score"] / 20),
            "planetary_basis": {"hora_lord": golden_hora["lord"]}
        })
        used_times.add(golden_hora["start"])
        
        # PRODUCTIVE: Second and third best horas
        for hora in sorted_horas[1:4]:
            if hora["start"] not in used_times and hora["score"] > 0:
                moments.append({
                    "type": "PRODUCTIVE",
                    "start": hora["start"],
                    "end": hora["end"],
                    "reason": f"{hora['lord']} hora - good for focused work",
                    "confidence": min(1.0, 0.4 + hora["score"] / 25),
                    "planetary_basis": {"hora_lord": hora["lord"]}
                })
                used_times.add(hora["start"])
                if len([m for m in moments if m["type"] == "PRODUCTIVE"]) >= 2:
                    break
        
        # SILENCE: Worst hora windows (for rest/meditation)
        for hora in sorted_horas[-3:]:
            if hora["start"] not in used_times:
                moments.append({
                    "type": "SILENCE",
                    "start": hora["start"],
                    "end": hora["end"],
                    "reason": f"{hora['lord']} hora - best for rest, meditation, introspection",
                    "confidence": 0.7,
                    "planetary_basis": {"hora_lord": hora["lord"]}
                })
                used_times.add(hora["start"])
                if len([m for m in moments if m["type"] == "SILENCE"]) >= 1:
                    break
        
        # Sort moments by start time
        moments.sort(key=lambda x: x["start"])
        
        return moments
    
    def _score_hora(self, hora_lord: str, moon_rasi: int, asc_rasi: int) -> float:
        """Score a hora based on natal chart"""
        score = 0.0
        
        moon_lord = self._get_rasi_lord(moon_rasi)
        asc_lord = self._get_rasi_lord(asc_rasi)
        
        # Hora lord same as natal lord = very favorable
        if hora_lord == moon_lord:
            score += 8.0
        if hora_lord == asc_lord:
            score += 8.0
        
        # Natural benefics
        if hora_lord in ["JUPITER", "VENUS"]:
            score += 5.0
        elif hora_lord in ["MERCURY", "MOON"]:
            score += 3.0
        elif hora_lord == "SUN":
            score += 1.0
        elif hora_lord in ["MARS", "SATURN"]:
            score -= 2.0
        
        return score
    
    def generate_rituals(self,
                        target_date: date,
                        day_score: Dict,
                        natal_moon_rasi: int,
                        current_dasha: Dict) -> List[Dict]:
        """Generate ritual recommendations based on day and chart"""
        rituals = []
        weekday = target_date.weekday()
        day_lord = self.WEEKDAY_LORDS[weekday]
        
        # Base rituals for the day lord
        day_rituals = self._get_day_lord_rituals(day_lord)
        for ritual in day_rituals:
            rituals.append({
                **ritual,
                "why": f"Recommended on {day_lord} day for planetary harmony"
            })
        
        # Dasha-specific rituals
        if current_dasha:
            dasha_lord = current_dasha.get("lord", "")
            dasha_rituals = self._get_dasha_rituals(dasha_lord)
            for ritual in dasha_rituals:
                rituals.append({
                    **ritual,
                    "why": f"Beneficial during {dasha_lord} dasha period"
                })
        
        # Score-based rituals
        color = day_score.get("color", "AMBER")
        if color == "RED":
            rituals.append({
                "ritual_name": "Hanuman Chalisa",
                "description": "Recite Hanuman Chalisa for protection and obstacle removal",
                "tags": ["protection", "mantra", "daily"],
                "duration_minutes": 15,
                "materials_needed": [],
                "priority": 1,
                "why": "Protection ritual recommended for challenging day"
            })
            rituals.append({
                "ritual_name": "Shanti Meditation",
                "description": "15-minute peace meditation to calm planetary influences",
                "tags": ["meditation", "peace"],
                "duration_minutes": 15,
                "materials_needed": [],
                "priority": 1,
                "why": "Meditation recommended for challenging day"
            })
        elif color == "GREEN":
            rituals.append({
                "ritual_name": "Gratitude Practice",
                "description": "Express gratitude and set intentions for the auspicious day",
                "tags": ["gratitude", "intention"],
                "duration_minutes": 10,
                "materials_needed": ["journal"],
                "priority": 2,
                "why": "Amplify positive energies on favorable day"
            })
        
        # Sort by priority
        rituals.sort(key=lambda x: x.get("priority", 2))
        
        return rituals[:6]  # Return top 6 rituals
    
    def _get_day_lord_rituals(self, day_lord: str) -> List[Dict]:
        """Get rituals specific to day lord"""
        ritual_map = {
            "SUN": [
                {"ritual_name": "Surya Namaskar", "description": "12 rounds of Sun Salutation", 
                 "tags": ["yoga", "health", "sun"], "duration_minutes": 20, 
                 "materials_needed": ["yoga mat"], "priority": 1}
            ],
            "MOON": [
                {"ritual_name": "Chandra Mantra", "description": "Chant 'Om Som Somaya Namah' 108 times",
                 "tags": ["mantra", "moon", "peace"], "duration_minutes": 15,
                 "materials_needed": ["mala"], "priority": 1}
            ],
            "MARS": [
                {"ritual_name": "Hanuman Worship", "description": "Visit Hanuman temple or recite Hanuman Chalisa",
                 "tags": ["mantra", "mars", "strength"], "duration_minutes": 20,
                 "materials_needed": [], "priority": 1}
            ],
            "MERCURY": [
                {"ritual_name": "Vishnu Sahasranama", "description": "Recite or listen to Vishnu Sahasranama",
                 "tags": ["mantra", "mercury", "wisdom"], "duration_minutes": 30,
                 "materials_needed": [], "priority": 2}
            ],
            "JUPITER": [
                {"ritual_name": "Guru Vandana", "description": "Honor teachers and seek blessings",
                 "tags": ["guru", "jupiter", "wisdom"], "duration_minutes": 15,
                 "materials_needed": ["yellow flowers"], "priority": 1}
            ],
            "VENUS": [
                {"ritual_name": "Lakshmi Puja", "description": "Offer prayers to Goddess Lakshmi",
                 "tags": ["puja", "venus", "prosperity"], "duration_minutes": 20,
                 "materials_needed": ["flowers", "incense", "lamp"], "priority": 1}
            ],
            "SATURN": [
                {"ritual_name": "Shani Mantra", "description": "Chant 'Om Sham Shanaishcharaya Namah' 108 times",
                 "tags": ["mantra", "saturn", "karma"], "duration_minutes": 20,
                 "materials_needed": ["mala", "sesame oil"], "priority": 1}
            ]
        }
        return ritual_map.get(day_lord, [])
    
    def _get_dasha_rituals(self, dasha_lord: str) -> List[Dict]:
        """Get rituals specific to dasha lord"""
        if dasha_lord in ["RAHU", "KETU"]:
            return [{
                "ritual_name": "Durga Mantra",
                "description": "Chant 'Om Dum Durgayei Namah' for shadow planet pacification",
                "tags": ["mantra", "protection"],
                "duration_minutes": 15,
                "materials_needed": ["mala"],
                "priority": 1
            }]
        elif dasha_lord == "SATURN":
            return [{
                "ritual_name": "Service to Elders",
                "description": "Perform acts of service to elderly or disadvantaged",
                "tags": ["karma", "saturn", "service"],
                "duration_minutes": 30,
                "materials_needed": [],
                "priority": 1
            }]
        return []
    
    def generate_planner(self,
                        start_date: date,
                        days: int,
                        natal_moon_rasi: int,
                        natal_asc_rasi: int,
                        transiting_planets: Dict,
                        current_dasha: Dict) -> List[Dict]:
        """Generate planner for multiple days"""
        planner = []
        
        for i in range(days):
            target_date = start_date + timedelta(days=i)
            
            # Calculate day score
            day_score = self.calculate_day_score(
                target_date, natal_moon_rasi, natal_asc_rasi,
                transiting_planets, current_dasha
            )
            
            # Generate moments
            moments = self.generate_moments(
                target_date, natal_moon_rasi, natal_asc_rasi,
                transiting_planets
            )
            
            # Get best moment
            golden = next((m for m in moments if m["type"] == "GOLDEN"), None)
            best_moment = None
            if golden:
                best_moment = {
                    "type": golden["type"],
                    "start": golden["start"].strftime("%H:%M"),
                    "end": golden["end"].strftime("%H:%M")
                }
            
            planner.append({
                "date": target_date.isoformat(),
                "weekday": target_date.strftime("%A"),
                "score": day_score["score"],
                "color": day_score["color"],
                "best_moment": best_moment,
                "moment_count": len(moments)
            })
        
        return planner
    
    def generate_ics_events(self,
                           start_date: date,
                           end_date: date,
                           profile_name: str,
                           natal_moon_rasi: int,
                           natal_asc_rasi: int,
                           transiting_planets: Dict) -> str:
        """Generate ICS calendar content"""
        lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AstroOS//Align27//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            f"X-WR-CALNAME:AstroOS - {profile_name}"
        ]
        
        current = start_date
        event_uid = 1
        
        while current <= end_date:
            # Generate moments for this day
            moments = self.generate_moments(
                current, natal_moon_rasi, natal_asc_rasi,
                transiting_planets
            )
            
            for moment in moments:
                dtstart = moment["start"].strftime("%Y%m%dT%H%M%S")
                dtend = moment["end"].strftime("%Y%m%dT%H%M%S")
                
                emoji = "🌟" if moment["type"] == "GOLDEN" else "⚡" if moment["type"] == "PRODUCTIVE" else "🧘"
                
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{event_uid}@astroos.align27",
                    f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
                    f"DTSTART:{dtstart}",
                    f"DTEND:{dtend}",
                    f"SUMMARY:{emoji} {moment['type']} Moment",
                    f"DESCRIPTION:{moment['reason']}",
                    f"CATEGORIES:{moment['type']}",
                    "END:VEVENT"
                ])
                event_uid += 1
            
            current += timedelta(days=1)
        
        lines.append("END:VCALENDAR")
        return "\r\n".join(lines)
    
    def calculate_hash(self, profile_id: int, target_date: date, 
                      natal_moon_rasi: int, natal_asc_rasi: int) -> str:
        """Calculate deterministic hash for caching"""
        data = f"{profile_id}:{target_date.isoformat()}:{natal_moon_rasi}:{natal_asc_rasi}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]

align27_calculator = Align27Calculator()
