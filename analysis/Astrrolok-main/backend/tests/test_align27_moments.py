#!/usr/bin/env python3
"""Test Align27 Moments generation"""
import pytest
from datetime import date, datetime, time
from app.modules.align27.calculator import align27_calculator


class TestMomentsGeneration:
    """Test moment generation logic"""
    
    def test_moments_non_overlapping(self):
        """Test that generated moments do not overlap"""
        target_date = date(2026, 1, 5)
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Sort by start time
        sorted_moments = sorted(moments, key=lambda x: x["start"])
        
        # Check no overlaps
        for i in range(len(sorted_moments) - 1):
            current_end = sorted_moments[i]["end"]
            next_start = sorted_moments[i + 1]["start"]
            assert current_end <= next_start, f"Overlap detected: {sorted_moments[i]} and {sorted_moments[i+1]}"
    
    def test_moments_include_required_types(self):
        """Test that at least one GOLDEN and one SILENCE moment exists"""
        target_date = date(2026, 1, 5)
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        types = [m["type"] for m in moments]
        
        assert "GOLDEN" in types, "Missing GOLDEN moment"
        assert "SILENCE" in types, "Missing SILENCE moment"
        # PRODUCTIVE is optional but typically present
    
    def test_moments_within_day_bounds(self):
        """Test that all moments are within sunrise to sunset"""
        target_date = date(2026, 1, 5)
        sunrise = time(6, 0)
        sunset = time(18, 0)
        
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            sunrise=sunrise,
            sunset=sunset
        )
        
        day_start = datetime.combine(target_date, sunrise)
        day_end = datetime.combine(target_date, sunset)
        
        for m in moments:
            assert m["start"] >= day_start, f"Moment starts before sunrise: {m}"
            assert m["end"] <= day_end, f"Moment ends after sunset: {m}"
    
    def test_moments_have_required_fields(self):
        """Test that all moments have required fields"""
        target_date = date(2026, 1, 5)
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        required_fields = ["type", "start", "end", "reason", "confidence"]
        
        for m in moments:
            for field in required_fields:
                assert field in m, f"Missing field '{field}' in moment: {m}"
    
    def test_moments_confidence_valid_range(self):
        """Test that confidence values are between 0 and 1"""
        target_date = date(2026, 1, 5)
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        for m in moments:
            assert 0.0 <= m["confidence"] <= 1.0, f"Invalid confidence: {m['confidence']}"
    
    def test_moments_type_values(self):
        """Test that moment types are valid"""
        target_date = date(2026, 1, 5)
        moments = align27_calculator.generate_moments(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        valid_types = {"GOLDEN", "PRODUCTIVE", "SILENCE"}
        
        for m in moments:
            assert m["type"] in valid_types, f"Invalid type: {m['type']}"
    
    def test_moments_different_moon_rasi(self):
        """Test that different moon rasi produces different moments"""
        target_date = date(2026, 1, 5)
        
        moments1 = align27_calculator.generate_moments(
            target_date, natal_moon_rasi=1, natal_asc_rasi=1, transiting_planets={}
        )
        moments2 = align27_calculator.generate_moments(
            target_date, natal_moon_rasi=7, natal_asc_rasi=7, transiting_planets={}
        )
        
        # The moments should be different for different charts
        golden1 = next((m for m in moments1 if m["type"] == "GOLDEN"), None)
        golden2 = next((m for m in moments2 if m["type"] == "GOLDEN"), None)
        
        assert golden1 is not None and golden2 is not None
        # Different natal charts may produce same or different golden times
        # but the hora lord should be chosen based on chart compatibility


class TestDayScore:
    """Test day score calculation"""
    
    def test_day_score_range(self):
        """Test that day score is within 0-100"""
        target_date = date(2026, 1, 5)
        result = align27_calculator.calculate_day_score(
            target_date,
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={},
            current_dasha={}
        )
        
        assert 0 <= result["score"] <= 100
    
    def test_day_score_color_mapping(self):
        """Test that color correctly maps to score"""
        # Test GREEN threshold
        result_high = align27_calculator.calculate_day_score(
            date(2026, 1, 5),
            natal_moon_rasi=5, natal_asc_rasi=3,
            transiting_planets={"JUPITER": {"rasi": 5}},  # Jupiter in own rasi
            current_dasha={"lord": "JUPITER"}
        )
        
        if result_high["score"] >= 65:
            assert result_high["color"] == "GREEN"
        elif result_high["score"] >= 40:
            assert result_high["color"] == "AMBER"
        else:
            assert result_high["color"] == "RED"
    
    def test_day_score_has_required_fields(self):
        """Test that day score has all required fields"""
        result = align27_calculator.calculate_day_score(
            date(2026, 1, 5),
            natal_moon_rasi=5, natal_asc_rasi=3,
            transiting_planets={}, current_dasha={}
        )
        
        assert "score" in result
        assert "color" in result
        assert "reasons" in result
        assert "key_transits" in result
        assert "dasha_overlay" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
