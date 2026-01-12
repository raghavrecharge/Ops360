import pytest
from datetime import datetime, timedelta
from app.modules.align27.calculator import Align27Calculator

def test_align27_day_score():
    """Test Align27 day score calculation"""
    calculator = Align27Calculator()
    
    # Sample chart
    chart = {
        "planets": {
            "SUN": {"rasi": 10, "longitude": 285.5, "dignity": "Neutral"},
            "MOON": {"rasi": 5, "longitude": 125.3, "dignity": "Friend"},
            "MARS": {"rasi": 3, "longitude": 75.2, "dignity": "Neutral"},
            "MERCURY": {"rasi": 11, "longitude": 305.8, "dignity": "Exalted"},
            "JUPITER": {"rasi": 6, "longitude": 165.4, "dignity": "Own"},
            "VENUS": {"rasi": 9, "longitude": 255.7, "dignity": "Neutral"},
            "SATURN": {"rasi": 12, "longitude": 355.1, "dignity": "Exalted"}
        },
        "ascendant": 75.0
    }
    
    date = datetime(2025, 1, 15)
    day_score = calculator.calculate_day_score(chart, date)
    
    # Verify structure
    assert "score" in day_score, "Score not in result"
    assert "traffic_light" in day_score, "Traffic light not in result"
    assert "factors" in day_score, "Factors not in result"
    
    # Verify score range
    assert 0 <= day_score["score"] <= 100, "Score out of range"
    
    # Verify traffic light values
    assert day_score["traffic_light"] in ["GREEN", "AMBER", "RED"], "Invalid traffic light value"
    
    print("✓ Align27 day score test passed")

def test_align27_moments():
    """Test Align27 moments calculation"""
    calculator = Align27Calculator()
    
    chart = {
        "planets": {
            "SUN": {"rasi": 10, "longitude": 285.5, "dignity": "Neutral", "nakshatra": "Uttara Ashadha"},
            "MOON": {"rasi": 5, "longitude": 125.3, "dignity": "Friend", "nakshatra": "Pushya"},
            "MARS": {"rasi": 3, "longitude": 75.2, "dignity": "Neutral", "nakshatra": "Punarvasu"},
            "MERCURY": {"rasi": 11, "longitude": 305.8, "dignity": "Exalted", "nakshatra": "Uttara Bhadrapada"},
            "JUPITER": {"rasi": 6, "longitude": 165.4, "dignity": "Own", "nakshatra": "Uttara Phalguni"},
            "VENUS": {"rasi": 9, "longitude": 255.7, "dignity": "Neutral", "nakshatra": "Purva Ashadha"},
            "SATURN": {"rasi": 12, "longitude": 355.1, "dignity": "Exalted", "nakshatra": "Uttara Bhadrapada"}
        },
        "ascendant": 75.0
    }
    
    date = datetime(2025, 1, 15)
    day_score = calculator.calculate_day_score(chart, date)
    moments = calculator.calculate_moments(day_score, date)
    
    # Verify moments structure
    assert len(moments) > 0, "No moments calculated"
    
    moment_types = [m["type"] for m in moments]
    assert "SILENCE" in moment_types, "Should have SILENCE moment"
    
    # Verify moments don't overlap
    for i in range(len(moments) - 1):
        for j in range(i + 1, len(moments)):
            m1_start = moments[i]["start_time"]
            m1_end = moments[i]["end_time"]
            m2_start = moments[j]["start_time"]
            m2_end = moments[j]["end_time"]
            
            # Check no overlap
            assert not (m1_start < m2_end and m2_start < m1_end), \
                f"Moments {i} and {j} overlap"
    
    # Verify all moment types are valid
    for moment in moments:
        assert moment["type"] in ["GOLDEN", "PRODUCTIVE", "SILENCE"], \
            f"Invalid moment type: {moment['type']}"
        assert moment["start_time"] < moment["end_time"], \
            "Moment start time should be before end time"
    
    print("✓ Align27 moments test passed")

def test_90_day_planner():
    """Test 90-day planner calculation"""
    calculator = Align27Calculator()
    
    chart = {
        "planets": {
            "SUN": {"rasi": 10, "longitude": 285.5, "dignity": "Neutral"},
            "MOON": {"rasi": 5, "longitude": 125.3, "dignity": "Friend"},
            "MARS": {"rasi": 3, "longitude": 75.2, "dignity": "Neutral"},
            "MERCURY": {"rasi": 11, "longitude": 305.8, "dignity": "Exalted"},
            "JUPITER": {"rasi": 6, "longitude": 165.4, "dignity": "Own"},
            "VENUS": {"rasi": 9, "longitude": 255.7, "dignity": "Neutral"},
            "SATURN": {"rasi": 12, "longitude": 355.1, "dignity": "Exalted"}
        },
        "ascendant": 75.0
    }
    
    start_date = datetime(2025, 1, 1)
    planner = calculator.calculate_90_day_planner(chart, start_date)
    
    # Verify 90 days
    assert len(planner) == 90, "Should have 90 days"
    
    # Verify each day has required fields
    for day in planner:
        assert "date" in day, "Date not in planner day"
        assert "score" in day, "Score not in planner day"
        assert "traffic_light" in day, "Traffic light not in planner day"
        assert day["traffic_light"] in ["GREEN", "AMBER", "RED"], "Invalid traffic light"
    
    # Verify dates are consecutive
    for i in range(len(planner) - 1):
        diff = (planner[i+1]["date"] - planner[i]["date"]).days
        assert diff == 1, f"Non-consecutive dates at index {i}"
    
    print("✓ 90-day planner test passed")

if __name__ == "__main__":
    test_align27_day_score()
    test_align27_moments()
    test_90_day_planner()
