import pytest
from datetime import datetime
from app.modules.charts.calculator import chart_calculator
from app.modules.ephemeris.calculator import ephemeris

# Test fixtures with known chart data
FIXTURES = [
    {
        "name": "Demo User",
        "birth_date": datetime(1990, 1, 15, 10, 30),
        "lat": 28.6139,
        "lon": 77.2090,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 3,  # Gemini (calculated)
        "expected_moon_rasi": 5,  # Leo (calculated)
        "expected_d9_moon": 12  # Example D9 position
    },
    {
        "name": "Test Chart 2",
        "birth_date": datetime(1985, 6, 10, 14, 20),
        "lat": 19.0760,
        "lon": 72.8777,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 6,  # Virgo
        "expected_moon_rasi": 2   # Taurus
    },
    {
        "name": "Test Chart 3",
        "birth_date": datetime(1995, 3, 20, 8, 15),
        "lat": 13.0827,
        "lon": 80.2707,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 1,  # Aries
        "expected_moon_rasi": 12  # Pisces
    },
    {
        "name": "Test Chart 4",
        "birth_date": datetime(2000, 9, 5, 18, 45),
        "lat": 22.5726,
        "lon": 88.3639,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 3,  # Gemini
        "expected_moon_rasi": 8   # Scorpio
    },
    {
        "name": "Test Chart 5",
        "birth_date": datetime(1980, 12, 1, 6, 0),
        "lat": 17.3850,
        "lon": 78.4867,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 11,  # Aquarius
        "expected_moon_rasi": 7   # Libra
    },
    {
        "name": "Test Chart 6",
        "birth_date": datetime(1992, 7, 14, 12, 30),
        "lat": 26.9124,
        "lon": 75.7873,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 7,  # Libra
        "expected_moon_rasi": 4   # Cancer
    },
    {
        "name": "Test Chart 7",
        "birth_date": datetime(1988, 11, 25, 20, 10),
        "lat": 12.9716,
        "lon": 77.5946,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 5,  # Leo
        "expected_moon_rasi": 9   # Sagittarius
    },
    {
        "name": "Test Chart 8",
        "birth_date": datetime(1997, 4, 8, 9, 20),
        "lat": 23.0225,
        "lon": 72.5714,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 4,  # Cancer
        "expected_moon_rasi": 1   # Aries
    },
    {
        "name": "Test Chart 9",
        "birth_date": datetime(1983, 2, 18, 15, 45),
        "lat": 21.1702,
        "lon": 72.8311,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 2,  # Taurus
        "expected_moon_rasi": 11  # Aquarius
    },
    {
        "name": "Test Chart 10",
        "birth_date": datetime(2005, 10, 30, 7, 30),
        "lat": 28.7041,
        "lon": 77.1025,
        "ayanamsa": "LAHIRI",
        "expected_asc_rasi": 9,  # Sagittarius
        "expected_moon_rasi": 6   # Virgo
    }
]

def test_chart_d1_placements():
    """Test D1 chart placements for fixtures"""
    for fixture in FIXTURES:
        chart = chart_calculator.calculate_natal_chart(
            fixture["birth_date"],
            fixture["lat"],
            fixture["lon"],
            fixture["ayanamsa"]
        )
        
        # Test Ascendant rasi
        asc_rasi = int(chart["ascendant"] / 30.0) + 1
        assert asc_rasi == fixture["expected_asc_rasi"], \
            f"{fixture['name']}: Expected Asc in rasi {fixture['expected_asc_rasi']}, got {asc_rasi}"
        
        # Test Moon rasi
        moon_rasi = chart["planets"]["MOON"]["rasi"]
        assert moon_rasi == fixture["expected_moon_rasi"], \
            f"{fixture['name']}: Expected Moon in rasi {fixture['expected_moon_rasi']}, got {moon_rasi}"
        
        print(f"✓ {fixture['name']}: Asc={asc_rasi}, Moon={moon_rasi}")

def test_d9_navamsa_calculation():
    """Test D9 (Navamsa) calculations"""
    for i, fixture in enumerate(FIXTURES[:5]):  # Test first 5
        chart = chart_calculator.calculate_natal_chart(
            fixture["birth_date"],
            fixture["lat"],
            fixture["lon"],
            fixture["ayanamsa"]
        )
        
        # D9 should be calculated
        assert 9 in chart["divisional_charts"], f"{fixture['name']}: D9 not calculated"
        
        d9 = chart["divisional_charts"][9]
        
        # All planets should have D9 positions
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            assert planet in d9, f"{fixture['name']}: {planet} not in D9"
            assert 1 <= d9[planet] <= 12, f"{fixture['name']}: {planet} D9 position out of range"
        
        print(f"✓ {fixture['name']}: D9 calculated for all planets")

def test_deterministic_caching():
    """Test that same inputs produce same hash"""
    fixture = FIXTURES[0]
    
    # Calculate twice
    hash1 = chart_calculator.generate_chart_hash(
        fixture["birth_date"],
        fixture["lat"],
        fixture["lon"],
        fixture["ayanamsa"]
    )
    
    hash2 = chart_calculator.generate_chart_hash(
        fixture["birth_date"],
        fixture["lat"],
        fixture["lon"],
        fixture["ayanamsa"]
    )
    
    assert hash1 == hash2, "Same inputs should produce same hash"
    
    # Different inputs should produce different hash
    hash3 = chart_calculator.generate_chart_hash(
        fixture["birth_date"],
        fixture["lat"] + 0.1,  # Slightly different
        fixture["lon"],
        fixture["ayanamsa"]
    )
    
    assert hash1 != hash3, "Different inputs should produce different hashes"
    
    print("✓ Deterministic caching works correctly")

def test_all_divisional_charts():
    """Test that all D1-D60 divisions are calculated"""
    fixture = FIXTURES[0]
    chart = chart_calculator.calculate_natal_chart(
        fixture["birth_date"],
        fixture["lat"],
        fixture["lon"],
        fixture["ayanamsa"]
    )
    
    expected_divisions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 20, 24, 27, 30, 40, 45, 60]
    
    for div in expected_divisions:
        assert div in chart["divisional_charts"], f"Division D{div} not calculated"
        
        div_chart = chart["divisional_charts"][div]
        assert len(div_chart) > 0, f"D{div} has no planetary positions"
    
    print(f"✓ All {len(expected_divisions)} divisional charts calculated")

if __name__ == "__main__":
    test_chart_d1_placements()
    test_d9_navamsa_calculation()
    test_deterministic_caching()
    test_all_divisional_charts()
