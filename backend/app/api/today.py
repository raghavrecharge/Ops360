"""
Today API Endpoints
Provides daily astrological data including transits, alignment scores, and recommendations
"""
from fastapi import APIRouter, Query, Depends
from datetime import datetime, timedelta
import math
import random
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(prefix="/api/today", tags=["today"])

# Planet data
PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

TRANSIT_INSIGHTS = {
    'Sun': {
        1: 'Personal vitality peaks; good for starting new projects.',
        2: 'Focus on finances and speech; avoid harsh words.',
        3: 'Courage increases; good for short travels.',
        4: 'Home matters dominate; spend time with family.',
        5: 'Creative energy flows; children bring joy.',
        6: 'Health needs attention; victory over enemies.',
        7: 'Partnership focus; business dealings favorable.',
        8: 'Transform through challenges; research benefits.',
        9: 'Fortune smiles; spiritual growth indicated.',
        10: 'Career recognition incoming; professional efforts pay off.',
        11: 'Gains through friends; wishes fulfilled.',
        12: 'Rest needed; spiritual retreat beneficial.'
    },
    'Moon': {
        1: 'Emotional beginnings; trust your intuition.',
        2: 'Financial intuition strong; family bonds.',
        3: 'Communication flows; sibling connections.',
        4: 'Emotional focus on home and family comfort.',
        5: 'Heart-centered creativity; romance possible.',
        6: 'Serve others; health through emotions.',
        7: 'Relationship harmony; partnerships flourish.',
        8: 'Deep intuitive insights; stay away from financial risks.',
        9: 'Spiritual emotions; wisdom travels.',
        10: 'Public recognition; career intuition.',
        11: 'Friend circles expand; hopes realized.',
        12: 'Need for solitude and rest; spiritual detachment.'
    },
    'Mars': {
        1: 'Energy boost; assert yourself wisely.',
        2: 'Speech may be sharp; financial actions.',
        3: 'Courage peaks; siblings may need you.',
        4: 'Property matters; mother\'s health attention.',
        5: 'Athletic activities; children energy.',
        6: 'Victory over competition; health improvements.',
        7: 'Partnership conflicts possible; negotiate wisely.',
        8: 'Transformation through action; research gains.',
        9: 'Righteous battles; legal victories.',
        10: 'Career ambition high; leadership opportunities.',
        11: 'Goals achieved through effort.',
        12: 'Hidden enemies; channel energy constructively.'
    }
}

def calculate_transit_positions(date: datetime):
    """Calculate approximate transit positions for all planets"""
    day_of_year = date.timetuple().tm_yday
    year = date.year
    
    # Approximate orbital periods and positions
    positions = []
    
    # Sun - moves ~1 degree per day through zodiac
    sun_deg = (day_of_year * 360 / 365.25) % 360
    sun_sign = int(sun_deg / 30) + 1
    positions.append({
        'planet': 'Sun',
        'sign': SIGNS[sun_sign - 1],
        'sign_num': sun_sign,
        'degree': sun_deg % 30,
        'house': sun_sign,
        'nakshatra': NAKSHATRAS[int(sun_deg / 13.33) % 27],
        'pada': int((sun_deg % 13.33) / 3.33) + 1,
        'is_retrograde': False
    })
    
    # Moon - moves ~13 degrees per day
    moon_deg = (day_of_year * 13 + date.hour) % 360
    moon_sign = int(moon_deg / 30) + 1
    positions.append({
        'planet': 'Moon',
        'sign': SIGNS[moon_sign - 1],
        'sign_num': moon_sign,
        'degree': moon_deg % 30,
        'house': moon_sign,
        'nakshatra': NAKSHATRAS[int(moon_deg / 13.33) % 27],
        'pada': int((moon_deg % 13.33) / 3.33) + 1,
        'is_retrograde': False
    })
    
    # Other planets with approximate positions
    planet_data = [
        ('Mars', 687, 2.1),      # 687 day orbit
        ('Mercury', 88, 4.1),   # 88 day orbit
        ('Jupiter', 4333, 11.9), # ~12 year orbit
        ('Venus', 225, 0.6),    # 225 day orbit
        ('Saturn', 10759, 29.5), # ~29.5 year orbit
        ('Rahu', 6798, 18.6),   # 18.6 year retrograde cycle
        ('Ketu', 6798, 18.6),   # Opposite to Rahu
    ]
    
    for planet, period, years in planet_data:
        if planet == 'Ketu':
            # Ketu is always opposite Rahu
            rahu_pos = next(p for p in positions if p['planet'] == 'Rahu')
            deg = (rahu_pos['degree'] + 180) % 360
            sign_num = ((rahu_pos['sign_num'] + 5) % 12) + 1
        else:
            base_deg = ((day_of_year + year * 365.25) * 360 / period) % 360
            if planet == 'Rahu':
                base_deg = 360 - base_deg  # Rahu moves retrograde
            deg = base_deg % 30
            sign_num = int(base_deg / 30) + 1
        
        positions.append({
            'planet': planet,
            'sign': SIGNS[sign_num - 1],
            'sign_num': sign_num,
            'degree': deg,
            'house': sign_num,
            'nakshatra': NAKSHATRAS[int((sign_num * 30 + deg) / 13.33) % 27],
            'pada': int((deg % 13.33) / 3.33) + 1,
            'is_retrograde': planet in ['Rahu', 'Ketu'] or (planet in ['Mercury', 'Venus', 'Mars'] and day_of_year % 60 < 20)
        })
    
    return positions

def calculate_alignment_score(transits, profile_id: int = None):
    """Calculate daily alignment score (0-100)"""
    # Base score
    score = 70
    
    # Check benefic/malefic positions
    for transit in transits:
        if transit['planet'] == 'Jupiter' and transit['sign_num'] in [1, 4, 5, 9]:
            score += 8
        if transit['planet'] == 'Venus' and transit['sign_num'] in [2, 7, 12]:
            score += 5
        if transit['planet'] == 'Saturn' and transit['sign_num'] in [6, 8, 12]:
            score -= 5
        if transit['planet'] == 'Mars' and transit['sign_num'] in [1, 6, 8]:
            score -= 3
    
    # Moon phase adjustment
    moon = next(t for t in transits if t['planet'] == 'Moon')
    if moon['degree'] < 15:
        score += 5  # Waxing moon bonus
    
    return max(20, min(98, score))

@router.get("/summary")
async def get_today_summary(profile_id: int = Query(None)):
    """Get comprehensive today summary with alignment score"""
    now = datetime.now()
    transits = calculate_transit_positions(now)
    score = calculate_alignment_score(transits, profile_id)
    
    # Get Moon position for personalized message
    moon = next(t for t in transits if t['planet'] == 'Moon')
    sun = next(t for t in transits if t['planet'] == 'Sun')
    
    return {
        'date': now.strftime('%Y-%m-%d'),
        'day': now.strftime('%A'),
        'alignment_score': score,
        'moon_sign': moon['sign'],
        'moon_nakshatra': moon['nakshatra'],
        'sun_sign': sun['sign'],
        'is_auspicious': score >= 65,
        'headline': f"The Moon is transiting {moon['sign']} in {moon['nakshatra']}. {'A powerful window for expansion.' if score >= 75 else 'Stay mindful and patient today.'}" ,
        'transits': transits
    }

@router.get("/transits")
async def get_transit_positions(date: str = None):
    """Get current planetary transit positions"""
    target_date = datetime.strptime(date, '%Y-%m-%d') if date else datetime.now()
    transits = calculate_transit_positions(target_date)
    
    # Add insights for each transit
    for transit in transits:
        planet = transit['planet']
        house = transit['house']
        if planet in TRANSIT_INSIGHTS and house in TRANSIT_INSIGHTS[planet]:
            transit['insight'] = TRANSIT_INSIGHTS[planet][house]
        else:
            transit['insight'] = f"{planet} energizes house {house} matters today."
    
    return {
        'date': target_date.strftime('%Y-%m-%d'),
        'transits': transits
    }

@router.get("/hora")
async def get_hora_lord():
    """Get current Hora lord"""
    now = datetime.now()
    day_of_week = now.weekday()
    hour = now.hour
    
    # Hora sequence from sunrise
    hora_lords = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
    day_lord_index = [6, 0, 1, 2, 3, 4, 5][day_of_week]  # Adjusted for weekday
    
    # Calculate hora from sunrise (assume 6 AM)
    hours_from_sunrise = (hour - 6) % 24
    hora_index = (day_lord_index + hours_from_sunrise) % 7
    
    return {
        'current_hora_lord': hora_lords[hora_index],
        'hour': hour,
        'day_lord': hora_lords[day_lord_index],
        'next_hora_lord': hora_lords[(hora_index + 1) % 7],
        'next_hora_in_minutes': 60 - now.minute
    }

@router.get("/recommendations")
async def get_daily_recommendations(profile_id: int = Query(None)):
    """Get personalized daily recommendations"""
    now = datetime.now()
    transits = calculate_transit_positions(now)
    score = calculate_alignment_score(transits, profile_id)
    
    recommendations = {
        'dos': [],
        'donts': [],
        'activities': []
    }
    
    # Based on day
    day_recommendations = {
        0: {'dos': ['Start new ventures', 'Sun-related activities'], 'donts': ['Excessive spending']},
        1: {'dos': ['Water activities', 'Mother-related matters'], 'donts': ['Long travels']},
        2: {'dos': ['Physical activities', 'Property matters'], 'donts': ['Starting loans']},
        3: {'dos': ['Communication', 'Learning', 'Trade'], 'donts': ['Legal matters']},
        4: {'dos': ['Spiritual activities', 'Teaching'], 'donts': ['Conflicts']},
        5: {'dos': ['Romance', 'Arts', 'Beauty'], 'donts': ['Surgery']},
        6: {'dos': ['Charity', 'Discipline', 'Oil activities'], 'donts': ['New beginnings']}
    }
    
    day = now.weekday()
    recommendations['dos'] = day_recommendations[day]['dos']
    recommendations['donts'] = day_recommendations[day]['donts']
    
    # Activity scores based on transits
    recommendations['activities'] = [
        {
            'category': 'Financial Decisions',
            'score': min(95, score + (10 if any(t['planet'] == 'Jupiter' and t['sign_num'] in [2, 5, 9, 11] for t in transits) else 0)),
            'status': 'Peak' if score > 75 else 'Neutral' if score > 50 else 'Low',
            'advice': 'Favorable aspects for wealth decisions.' if score > 70 else 'Be cautious with finances.'
        },
        {
            'category': 'Health & Wellness',
            'score': min(95, score + 5),
            'status': 'Peak' if score > 70 else 'Neutral',
            'advice': 'Good day for health routines.' if score > 60 else 'Rest recommended.'
        },
        {
            'category': 'Relationships',
            'score': min(95, score + (15 if any(t['planet'] == 'Venus' and t['sign_num'] in [2, 7] for t in transits) else 0)),
            'status': 'Peak' if score > 75 else 'Neutral',
            'advice': 'Harmonious energies for connections.' if score > 65 else 'Patience in relationships.'
        },
        {
            'category': 'Creative Work',
            'score': min(95, score + 10),
            'status': 'Peak' if score > 72 else 'Neutral',
            'advice': 'Creative inspiration flows.' if score > 68 else 'Routine tasks preferred.'
        }
    ]
    
    return recommendations
