"""
Calendar API Endpoints
Provides monthly astrological calendar with daily scores and events
"""
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from calendar import monthrange
import math

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

def calculate_day_score(date: datetime):
    """Calculate astrological score for a day (0-100)"""
    day_of_year = date.timetuple().tm_yday
    day_of_week = date.weekday()
    
    # Base score varies by weekday
    weekday_scores = [75, 70, 65, 80, 85, 80, 60]
    score = weekday_scores[day_of_week]
    
    # Tithi influence
    tithi = (day_of_year + date.day + date.month) % 30 + 1
    if tithi in [4, 8, 9, 14]:  # Rikta tithis
        score -= 10
    elif tithi in [2, 3, 5, 7, 10, 11, 13]:  # Auspicious tithis
        score += 10
    elif tithi == 15:  # Purnima
        score += 15
    elif tithi == 30:  # Amavasya
        score -= 5
    
    # Nakshatra influence
    nakshatra_idx = (day_of_year + date.day * 3) % 27
    auspicious_nakshatras = [0, 3, 6, 7, 11, 12, 13, 21, 26]  # Ashwini, Rohini, etc.
    if nakshatra_idx in auspicious_nakshatras:
        score += 8
    
    return max(30, min(98, score))

def get_day_type(score: int):
    """Get day type based on score"""
    if score >= 80:
        return 'excellent'
    elif score >= 65:
        return 'good'
    elif score >= 50:
        return 'neutral'
    else:
        return 'caution'

@router.get("/month/{year}/{month}")
async def get_monthly_calendar(year: int, month: int, profile_id: int = Query(None)):
    """Get astrological calendar for a month"""
    _, days_in_month = monthrange(year, month)
    
    days = []
    for day in range(1, days_in_month + 1):
        date = datetime(year, month, day)
        day_of_year = date.timetuple().tm_yday
        
        score = calculate_day_score(date)
        tithi_num = (day_of_year + day + month) % 30 + 1
        nakshatra_idx = (day_of_year + day * 3) % 27
        
        days.append({
            'day': day,
            'date': date.strftime('%Y-%m-%d'),
            'weekday': date.strftime('%A'),
            'weekday_short': date.strftime('%a'),
            'score': score,
            'type': get_day_type(score),
            'tithi': f"{'Shukla' if tithi_num <= 15 else 'Krishna'} {(tithi_num - 1) % 15 + 1}",
            'nakshatra': NAKSHATRAS[nakshatra_idx],
            'moon_phase': 'waxing' if tithi_num <= 15 else 'waning',
            'is_purnima': tithi_num == 15,
            'is_amavasya': tithi_num == 30,
            'is_ekadashi': tithi_num in [11, 26],
            'events': []
        })
        
        # Add special events
        if tithi_num == 15:
            days[-1]['events'].append({'name': 'Purnima', 'type': 'lunar'})
        if tithi_num == 30:
            days[-1]['events'].append({'name': 'Amavasya', 'type': 'lunar'})
        if tithi_num in [11, 26]:
            days[-1]['events'].append({'name': 'Ekadashi', 'type': 'fasting'})
    
    # Calculate month summary
    avg_score = sum(d['score'] for d in days) / len(days)
    excellent_days = len([d for d in days if d['type'] == 'excellent'])
    caution_days = len([d for d in days if d['type'] == 'caution'])
    
    return {
        'year': year,
        'month': month,
        'month_name': datetime(year, month, 1).strftime('%B'),
        'days_count': days_in_month,
        'average_score': round(avg_score, 1),
        'excellent_days': excellent_days,
        'caution_days': caution_days,
        'days': days
    }

@router.get("/week")
async def get_weekly_calendar(start_date: str = None, profile_id: int = Query(None)):
    """Get astrological calendar for current/specified week"""
    if start_date:
        start = datetime.strptime(start_date, '%Y-%m-%d')
    else:
        today = datetime.now()
        start = today - timedelta(days=today.weekday())  # Start from Monday
    
    days = []
    for i in range(7):
        date = start + timedelta(days=i)
        day_of_year = date.timetuple().tm_yday
        
        score = calculate_day_score(date)
        tithi_num = (day_of_year + date.day + date.month) % 30 + 1
        nakshatra_idx = (day_of_year + date.day * 3) % 27
        
        days.append({
            'day': date.day,
            'date': date.strftime('%Y-%m-%d'),
            'weekday': date.strftime('%A'),
            'is_today': date.date() == datetime.now().date(),
            'score': score,
            'type': get_day_type(score),
            'tithi': f"{'Shukla' if tithi_num <= 15 else 'Krishna'} {(tithi_num - 1) % 15 + 1}",
            'nakshatra': NAKSHATRAS[nakshatra_idx],
            'best_activities': ['Meditation', 'Study'] if score >= 70 else ['Rest', 'Planning']
        })
    
    return {
        'week_start': start.strftime('%Y-%m-%d'),
        'week_end': (start + timedelta(days=6)).strftime('%Y-%m-%d'),
        'days': days
    }

@router.get("/planner")
async def get_planner_data(profile_id: int = Query(None), days: int = Query(90)):
    """Get planner data for upcoming days"""
    today = datetime.now()
    
    planner_days = []
    for i in range(days):
        date = today + timedelta(days=i)
        score = calculate_day_score(date)
        
        planner_days.append({
            'date': date.strftime('%Y-%m-%d'),
            'score': score,
            'color': 'GREEN' if score >= 70 else 'AMBER' if score >= 50 else 'RED',
            'best_moment': f"{11 + (i % 3)}:{30 + (i * 7) % 30} AM" if score >= 60 else 'Afternoon',
            'activities': [
                {'name': 'Business', 'favorable': score >= 70},
                {'name': 'Travel', 'favorable': score >= 65},
                {'name': 'Health', 'favorable': score >= 50}
            ]
        })
    
    # Summary activities
    activities = [
        {
            'category': 'Financial Decisions',
            'score': 82,
            'status': 'Peak',
            'advice': 'Excellent planetary support for wealth decisions.'
        },
        {
            'category': 'Health & Wellness',
            'score': 68,
            'status': 'Neutral',
            'advice': 'Maintain regular routines; avoid overexertion.'
        },
        {
            'category': 'Creative Projects',
            'score': 91,
            'status': 'Peak',
            'advice': 'Venus-Moon alignment enhances artistic expression.'
        }
    ]
    
    return {
        'start_date': today.strftime('%Y-%m-%d'),
        'days_count': days,
        'activities': activities,
        'schedule': [],
        'day_summary': 'Focus on internal wealth consolidation and creative expansion.',
        'planner': planner_days
    }
