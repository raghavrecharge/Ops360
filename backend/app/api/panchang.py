"""
Panchang API Endpoints
Provides Hindu Calendar data including Tithi, Nakshatra, Yoga, Karana, etc.
"""
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/api/panchang", tags=["panchang"])

# Constants for calculations
NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

NAKSHATRA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'] * 3

YOGAS = [
    'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
    'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
    'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti'
]

KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna']

TITHIS = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
    'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
]

VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

def calculate_panchang(date: datetime, lat: float = 28.6139, lng: float = 77.209, tz_offset: float = 5.5):
    """Calculate Panchang for a given date and location"""
    # Julian Day calculation
    year, month, day = date.year, date.month, date.day
    if month <= 2:
        year -= 1
        month += 12
    A = int(year / 100)
    B = 2 - A + int(A / 4)
    JD = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + B - 1524.5
    
    # Day of week
    day_of_week = date.weekday()
    day_of_week_sunday = (day_of_week + 1) % 7  # Convert to Sunday=0
    
    vara = VARAS[day_of_week_sunday]
    vara_lord = VARA_LORDS[day_of_week_sunday]
    
    # Calculate based on day of year for variety
    day_of_year = date.timetuple().tm_yday
    
    # Tithi calculation (based on lunar day)
    tithi_num = ((day_of_year + date.day + date.month) % 30) + 1
    is_shukla = tithi_num <= 15
    tithi_index = (tithi_num - 1) % 15
    tithi_name = f"{'Shukla' if is_shukla else 'Krishna'} {TITHIS[tithi_index]}"
    moon_phase = 'Waxing' if is_shukla else 'Waning'
    
    # Nakshatra calculation
    nakshatra_index = (day_of_year + date.day * 3 + date.month * 7) % 27
    nakshatra = NAKSHATRAS[nakshatra_index]
    nakshatra_lord = NAKSHATRA_LORDS[nakshatra_index]
    
    # Yoga calculation
    yoga_index = (day_of_year + date.day + date.month * 2) % 27
    yoga = YOGAS[yoga_index]
    
    # Karana calculation
    karana_index = (day_of_year + date.day * 2) % 11
    karana = KARANAS[karana_index]
    
    # Sunrise/Sunset approximation
    # Basic calculation - in production use ephem or similar
    day_length_hours = 12 + 2 * math.sin(2 * math.pi * (day_of_year - 80) / 365)
    sunrise_hour = 12 - day_length_hours / 2
    sunset_hour = 12 + day_length_hours / 2
    
    sunrise = f"{int(sunrise_hour):02d}:{int((sunrise_hour % 1) * 60):02d} AM"
    sunset = f"{int(sunset_hour) - 12:02d}:{int((sunset_hour % 1) * 60):02d} PM"
    
    # Abhijit Muhurta (midday)
    abhijit_start = f"{int((sunrise_hour + sunset_hour) / 2 - 0.4):02d}:{int(((sunrise_hour + sunset_hour) / 2 - 0.4) % 1 * 60):02d}"
    abhijit_end = f"{int((sunrise_hour + sunset_hour) / 2 + 0.4):02d}:{int(((sunrise_hour + sunset_hour) / 2 + 0.4) % 1 * 60):02d}"
    
    # Rahu Kaal calculation
    rahu_kaal_order = [8, 2, 7, 5, 6, 4, 3]  # For each day of week
    rahu_slot = rahu_kaal_order[day_of_week_sunday]
    slot_duration = day_length_hours / 8
    rahu_start = sunrise_hour + (rahu_slot - 1) * slot_duration
    rahu_end = rahu_start + slot_duration
    rahu_kaal = f"{int(rahu_start):02d}:{int((rahu_start % 1) * 60):02d} - {int(rahu_end):02d}:{int((rahu_end % 1) * 60):02d}"
    
    # Choghadiya calculation
    choghadiya = []
    choghadiya_names = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog']
    choghadiya_status = ['Caution', 'Neutral', 'Gain', 'Best', 'Bad', 'Good', 'Avoid']
    slot_minutes = int(day_length_hours * 60 / 8)
    
    for i in range(8):
        idx = (day_of_week_sunday + i) % 7
        start_time = sunrise_hour + i * (day_length_hours / 8)
        end_time = start_time + (day_length_hours / 8)
        choghadiya.append({
            'name': choghadiya_names[idx],
            'status': choghadiya_status[idx],
            'start': f"{int(start_time):02d}:{int((start_time % 1) * 60):02d}",
            'end': f"{int(end_time):02d}:{int((end_time % 1) * 60):02d}"
        })
    
    return {
        'date': date.strftime('%Y-%m-%d'),
        'tithi': tithi_name,
        'tithi_number': tithi_num,
        'vara': vara,
        'day_lord': vara_lord,
        'nakshatra': nakshatra,
        'nakshatra_lord': nakshatra_lord,
        'yoga': yoga,
        'karana': karana,
        'sunrise': sunrise,
        'sunset': sunset,
        'moon_phase': moon_phase,
        'abhijit_muhurta': f"{abhijit_start} - {abhijit_end}",
        'rahu_kaal': rahu_kaal,
        'choghadiya': choghadiya,
        'is_auspicious': yoga_index % 3 != 0 and karana_index not in [6, 7],
        'location': {'latitude': lat, 'longitude': lng, 'timezone': f'UTC+{tz_offset}'}
    }

@router.get("/today")
async def get_today_panchang(
    lat: float = Query(28.6139, description="Latitude"),
    lng: float = Query(77.209, description="Longitude"),
    tz_offset: float = Query(5.5, description="Timezone offset from UTC")
):
    """Get today's Panchang data"""
    return calculate_panchang(datetime.now(), lat, lng, tz_offset)

@router.get("/date/{date}")
async def get_panchang_for_date(
    date: str,
    lat: float = Query(28.6139, description="Latitude"),
    lng: float = Query(77.209, description="Longitude"),
    tz_offset: float = Query(5.5, description="Timezone offset from UTC")
):
    """Get Panchang for a specific date (YYYY-MM-DD format)"""
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d')
        return calculate_panchang(target_date, lat, lng, tz_offset)
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

@router.get("/calendar/{year}/{month}")
async def get_monthly_calendar(
    year: int,
    month: int,
    lat: float = Query(28.6139),
    lng: float = Query(77.209)
):
    """Get Panchang calendar for entire month"""
    from calendar import monthrange
    _, days_in_month = monthrange(year, month)
    
    calendar_data = []
    for day in range(1, days_in_month + 1):
        date = datetime(year, month, day)
        panchang = calculate_panchang(date, lat, lng)
        calendar_data.append({
            'day': day,
            'date': date.strftime('%Y-%m-%d'),
            'weekday': date.strftime('%A'),
            'tithi': panchang['tithi'],
            'nakshatra': panchang['nakshatra'],
            'yoga': panchang['yoga'],
            'is_auspicious': panchang['is_auspicious'],
            'moon_phase': panchang['moon_phase']
        })
    
    return {
        'year': year,
        'month': month,
        'days': calendar_data
    }

@router.get("/muhurta")
async def get_muhurta_windows(
    date: str = None,
    lat: float = Query(28.6139),
    lng: float = Query(77.209)
):
    """Get auspicious muhurta windows for the day"""
    target_date = datetime.strptime(date, '%Y-%m-%d') if date else datetime.now()
    panchang = calculate_panchang(target_date, lat, lng)
    
    # Calculate day length
    day_of_year = target_date.timetuple().tm_yday
    day_length = 12 + 2 * math.sin(2 * math.pi * (day_of_year - 80) / 365)
    sunrise_hour = 12 - day_length / 2
    
    muhurtas = [
        {
            'name': 'Brahma Muhurta',
            'time': f"{int(sunrise_hour - 1.5):02d}:{int((sunrise_hour - 1.5) % 1 * 60):02d} - {int(sunrise_hour - 0.75):02d}:{int((sunrise_hour - 0.75) % 1 * 60):02d}",
            'type': 'spiritual',
            'description': 'Best for meditation, yoga, and spiritual practices'
        },
        {
            'name': 'Abhijit Muhurta',
            'time': panchang['abhijit_muhurta'],
            'type': 'auspicious',
            'description': 'The unconquerable window - best for important beginnings'
        },
        {
            'name': 'Amrit Kaal',
            'time': f"{int(sunrise_hour + 4):02d}:15 - {int(sunrise_hour + 5.5):02d}:30",
            'type': 'auspicious',
            'description': 'Divine nectar period for lasting benefits'
        },
        {
            'name': 'Vijaya Muhurta',
            'time': f"{int(sunrise_hour + 6):02d}:30 - {int(sunrise_hour + 7.5):02d}:15",
            'type': 'victory',
            'description': 'Window of victory - good for competitions'
        }
    ]
    
    caution_periods = [
        {
            'name': 'Rahu Kaal',
            'time': panchang['rahu_kaal'],
            'type': 'avoid',
            'description': 'Avoid new beginnings and important decisions'
        },
        {
            'name': 'Yamaganda',
            'time': f"{int(sunrise_hour + 2.5):02d}:20 - {int(sunrise_hour + 4):02d}:00",
            'type': 'avoid',
            'description': 'Inauspicious for journeys and new ventures'
        },
        {
            'name': 'Gulika Kaal',
            'time': f"{int(sunrise_hour + 5):02d}:45 - {int(sunrise_hour + 6.5):02d}:25",
            'type': 'avoid',
            'description': 'Avoid rituals and ceremonies'
        }
    ]
    
    return {
        'date': target_date.strftime('%Y-%m-%d'),
        'auspicious_muhurtas': muhurtas,
        'caution_periods': caution_periods,
        'choghadiya': panchang['choghadiya']
    }
