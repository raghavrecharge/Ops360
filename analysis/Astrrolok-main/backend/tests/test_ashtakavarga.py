import pytest
from app.modules.ashtakavarga.calculator import AshtakavargaCalculator

def test_ashtakavarga_matrix_shapes():
    """Test that Ashtakavarga matrices have correct shapes"""
    calculator = AshtakavargaCalculator()
    
    # Sample planetary positions
    planets = {
        "SUN": {"rasi": 10, "longitude": 285.5},
        "MOON": {"rasi": 5, "longitude": 125.3},
        "MARS": {"rasi": 3, "longitude": 75.2},
        "MERCURY": {"rasi": 11, "longitude": 305.8},
        "JUPITER": {"rasi": 6, "longitude": 165.4},
        "VENUS": {"rasi": 9, "longitude": 255.7},
        "SATURN": {"rasi": 12, "longitude": 355.1}
    }
    
    result = calculator.calculate_all(planets)
    
    # Test BAV shapes
    assert "bav" in result, "BAV not in result"
    for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
        assert planet in result["bav"], f"BAV for {planet} not calculated"
        bav = result["bav"][planet]
        assert len(bav) == 12, f"BAV for {planet} should have 12 values"
        assert all(isinstance(v, int) for v in bav), f"BAV values should be integers"
    
    # Test SAV shape
    assert "sav" in result, "SAV not in result"
    assert len(result["sav"]) == 12, "SAV should have 12 values"
    
    # Test reductions
    assert "reductions" in result, "Reductions not in result"
    assert "original" in result["reductions"], "Original SAV not in reductions"
    assert "trikona_shodhana" in result["reductions"], "Trikona shodhana not in reductions"
    
    print("✓ Ashtakavarga matrix shapes test passed")

def test_ashtakavarga_invariants():
    """Test Ashtakavarga invariants"""
    calculator = AshtakavargaCalculator()
    
    planets = {
        "SUN": {"rasi": 10, "longitude": 285.5},
        "MOON": {"rasi": 5, "longitude": 125.3},
        "MARS": {"rasi": 3, "longitude": 75.2},
        "MERCURY": {"rasi": 11, "longitude": 305.8},
        "JUPITER": {"rasi": 6, "longitude": 165.4},
        "VENUS": {"rasi": 9, "longitude": 255.7},
        "SATURN": {"rasi": 12, "longitude": 355.1}
    }
    
    result = calculator.calculate_all(planets)
    
    # Test that SAV is sum of all BAVs
    calculated_sav = [0] * 12
    for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
        bav = result["bav"][planet]
        for i in range(12):
            calculated_sav[i] += bav[i]
    
    assert calculated_sav == result["sav"], "SAV should equal sum of all BAVs"
    
    # Test that total points is within expected range (337 is total for SAV)
    total = sum(result["sav"])
    assert 200 <= total <= 400, f"Total SAV points {total} out of expected range"
    
    # Test summary calculations
    assert "summary" in result, "Summary not in result"
    assert result["summary"]["total_points"] == total, "Summary total doesn't match"
    assert 1 <= result["summary"]["max_rasi"] <= 12, "Max rasi out of range"
    
    print("✓ Ashtakavarga invariants test passed")

if __name__ == "__main__":
    test_ashtakavarga_matrix_shapes()
    test_ashtakavarga_invariants()
