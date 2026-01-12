#!/usr/bin/env python3
"""Test ICS Calendar Export"""
import pytest
from datetime import date
from app.modules.align27.calculator import align27_calculator


class TestICSExport:
    """Test ICS calendar export functionality"""
    
    def test_ics_parses_correctly(self):
        """Test that generated ICS has valid structure"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 7),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Check required ICS components
        assert "BEGIN:VCALENDAR" in ics_content
        assert "END:VCALENDAR" in ics_content
        assert "VERSION:2.0" in ics_content
        assert "PRODID:" in ics_content
    
    def test_ics_contains_events(self):
        """Test that ICS contains event entries"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 3),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Should have at least some events
        assert ics_content.count("BEGIN:VEVENT") > 0
        assert ics_content.count("END:VEVENT") > 0
        
        # Count should match
        begin_count = ics_content.count("BEGIN:VEVENT")
        end_count = ics_content.count("END:VEVENT")
        assert begin_count == end_count
    
    def test_ics_event_timestamps_valid(self):
        """Test that event timestamps are in correct format"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Check DTSTART format (should be YYYYMMDDTHHMMSS)
        assert "DTSTART:20260105T" in ics_content
        assert "DTEND:20260105T" in ics_content
    
    def test_ics_event_titles_correct(self):
        """Test that event titles contain moment types"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Should contain moment type in summary
        has_golden = "GOLDEN Moment" in ics_content
        has_productive = "PRODUCTIVE Moment" in ics_content
        has_silence = "SILENCE Moment" in ics_content
        
        # At least one type should be present
        assert has_golden or has_productive or has_silence
    
    def test_ics_unique_uids(self):
        """Test that each event has a unique UID"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 7),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Extract UIDs
        uids = []
        for line in ics_content.split("\r\n"):
            if line.startswith("UID:"):
                uids.append(line)
        
        # All UIDs should be unique
        assert len(uids) == len(set(uids)), "Duplicate UIDs found"
    
    def test_ics_has_calendar_name(self):
        """Test that calendar has proper name"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="My Custom Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        assert "X-WR-CALNAME:AstroOS - My Custom Profile" in ics_content
    
    def test_ics_events_have_description(self):
        """Test that events have descriptions"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        assert "DESCRIPTION:" in ics_content
    
    def test_ics_events_have_categories(self):
        """Test that events have categories (moment type)"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Should have category tags
        has_category = ("CATEGORIES:GOLDEN" in ics_content or 
                       "CATEGORIES:PRODUCTIVE" in ics_content or
                       "CATEGORIES:SILENCE" in ics_content)
        assert has_category
    
    def test_ics_date_range(self):
        """Test ICS covers the requested date range"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 10),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # Should have events on start date
        assert "DTSTART:20260105T" in ics_content
        # Should have events on end date
        assert "DTSTART:20260110T" in ics_content
    
    def test_ics_crlf_line_endings(self):
        """Test that ICS uses CRLF line endings per RFC 5545"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        # ICS standard requires CRLF
        assert "\r\n" in ics_content


class TestICSEdgeCases:
    """Test edge cases for ICS export"""
    
    def test_ics_single_day(self):
        """Test ICS export for single day"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="Test",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        assert "BEGIN:VCALENDAR" in ics_content
        assert "BEGIN:VEVENT" in ics_content
    
    def test_ics_special_characters_in_name(self):
        """Test ICS handles special characters in profile name"""
        ics_content = align27_calculator.generate_ics_events(
            start_date=date(2026, 1, 5),
            end_date=date(2026, 1, 5),
            profile_name="John's Profile",
            natal_moon_rasi=5,
            natal_asc_rasi=3,
            transiting_planets={}
        )
        
        assert "BEGIN:VCALENDAR" in ics_content


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
