#!/usr/bin/env python3
"""Test Align27 Planner generation"""
import pytest
from datetime import date, timedelta
from app.modules.align27.calculator import align27_calculator


class TestPlannerGeneration:
    """Test planner generation logic"""
    
    def test_planner_returns_correct_days(self):
        """Test that planner returns exactly the requested number of days"""
        start_date = date(2026, 1, 1)
        days = 90
        
        planner = align27_calculator.generate_planner(
            start_date=start_date,
            days=days,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        assert len(planner) == 90, f"Expected 90 days, got {len(planner)}"
    
    def test_planner_deterministic(self):
        """Test that planner produces stable results across calls"""
        start_date = date(2026, 1, 1)
        
        planner1 = align27_calculator.generate_planner(
            start_date=start_date,
            days=30,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        planner2 = align27_calculator.generate_planner(
            start_date=start_date,
            days=30,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        # Compare scores and colors
        for i in range(30):
            assert planner1[i]["score"] == planner2[i]["score"], f"Day {i} score mismatch"
            assert planner1[i]["color"] == planner2[i]["color"], f"Day {i} color mismatch"
    
    def test_planner_dates_sequential(self):
        """Test that planner dates are sequential"""
        start_date = date(2026, 1, 1)
        
        planner = align27_calculator.generate_planner(
            start_date=start_date,
            days=90,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        for i, entry in enumerate(planner):
            expected_date = (start_date + timedelta(days=i)).isoformat()
            assert entry["date"] == expected_date, f"Date mismatch at index {i}"
    
    def test_planner_has_required_fields(self):
        """Test that each planner entry has required fields"""
        planner = align27_calculator.generate_planner(
            start_date=date(2026, 1, 1),
            days=10,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        required_fields = ["date", "weekday", "score", "color", "best_moment", "moment_count"]
        
        for entry in planner:
            for field in required_fields:
                assert field in entry, f"Missing field '{field}' in planner entry"
    
    def test_planner_colors_valid(self):
        """Test that all planner entries have valid colors"""
        planner = align27_calculator.generate_planner(
            start_date=date(2026, 1, 1),
            days=90,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        valid_colors = {"GREEN", "AMBER", "RED"}
        
        for entry in planner:
            assert entry["color"] in valid_colors, f"Invalid color: {entry['color']}"
    
    def test_planner_scores_valid_range(self):
        """Test that all planner scores are within 0-100"""
        planner = align27_calculator.generate_planner(
            start_date=date(2026, 1, 1),
            days=90,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        for entry in planner:
            assert 0 <= entry["score"] <= 100, f"Invalid score: {entry['score']}"
    
    def test_planner_weekdays_correct(self):
        """Test that weekdays are correctly assigned"""
        start_date = date(2026, 1, 1)  # This is a Thursday
        
        planner = align27_calculator.generate_planner(
            start_date=start_date,
            days=7,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        expected_weekdays = ["Thursday", "Friday", "Saturday", "Sunday", 
                           "Monday", "Tuesday", "Wednesday"]
        
        for i, entry in enumerate(planner):
            assert entry["weekday"] == expected_weekdays[i], f"Weekday mismatch at day {i}"
    
    def test_planner_best_moment_structure(self):
        """Test that best_moment has correct structure when present"""
        planner = align27_calculator.generate_planner(
            start_date=date(2026, 1, 1),
            days=10,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        for entry in planner:
            if entry["best_moment"]:
                assert "type" in entry["best_moment"]
                assert "start" in entry["best_moment"]
                assert "end" in entry["best_moment"]
                assert entry["best_moment"]["type"] == "GOLDEN"


class TestPlannerEdgeCases:
    """Test edge cases for planner generation"""
    
    def test_planner_single_day(self):
        """Test planner with single day"""
        planner = align27_calculator.generate_planner(
            start_date=date(2026, 1, 1),
            days=1,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        assert len(planner) == 1
    
    def test_planner_leap_year(self):
        """Test planner across leap year boundary"""
        # 2024 is a leap year
        planner = align27_calculator.generate_planner(
            start_date=date(2024, 2, 28),
            days=3,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        assert len(planner) == 3
        assert planner[0]["date"] == "2024-02-28"
        assert planner[1]["date"] == "2024-02-29"  # Leap day
        assert planner[2]["date"] == "2024-03-01"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
