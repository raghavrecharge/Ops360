import pytest
from datetime import datetime
from app.modules.dasha.calculator import VimshottariDasha

def test_vimshottari_5_levels():
    """Test Vimshottari dasha 5-level calculation"""
    birth_date = datetime(1990, 1, 15, 10, 30)
    moon_longitude = 125.5  # Approximately in Magha nakshatra
    
    calculator = VimshottariDasha(birth_date, moon_longitude)
    
    # Test Maha Dashas
    maha_dashas = calculator.calculate_maha_dashas(num_years=120)
    assert len(maha_dashas) > 0, "No Maha dashas calculated"
    assert maha_dashas[0]["level"] == "MAHA", "First dasha should be MAHA level"
    
    # Test that boundaries are contiguous
    for i in range(len(maha_dashas) - 1):
        assert maha_dashas[i]["end_date"] == maha_dashas[i+1]["start_date"], \
            f"Gap in dasha periods at index {i}"
    
    # Test Antar Dashas
    antar_dashas = calculator.calculate_antar_dashas(maha_dashas[0])
    assert len(antar_dashas) == 9, "Should have 9 Antar dashas"
    
    # Verify antar periods sum to maha period
    antar_sum = sum(d["years"] for d in antar_dashas)
    assert abs(antar_sum - maha_dashas[0]["years"]) < 0.01, \
        "Antar periods don't sum to Maha period"
    
    # Test Pratyantar Dashas
    pratyantar_dashas = calculator.calculate_pratyantar_dashas(antar_dashas[0])
    assert len(pratyantar_dashas) == 9, "Should have 9 Pratyantar dashas"
    
    pratyantar_sum = sum(d["years"] for d in pratyantar_dashas)
    assert abs(pratyantar_sum - antar_dashas[0]["years"]) < 0.01, \
        "Pratyantar periods don't sum to Antar period"
    
    # Test Sookshma Dashas
    sookshma_dashas = calculator.calculate_sookshma_dashas(pratyantar_dashas[0])
    assert len(sookshma_dashas) == 9, "Should have 9 Sookshma dashas"
    
    sookshma_sum = sum(d["years"] for d in sookshma_dashas)
    assert abs(sookshma_sum - pratyantar_dashas[0]["years"]) < 0.01, \
        "Sookshma periods don't sum to Pratyantar period"
    
    # Test Prana Dashas (5th level)
    prana_dashas = calculator.calculate_prana_dashas(sookshma_dashas[0])
    assert len(prana_dashas) == 9, "Should have 9 Prana dashas"
    assert prana_dashas[0]["level"] == "PRANA", "Should be PRANA level"
    
    prana_sum = sum(d["years"] for d in prana_dashas)
    assert abs(prana_sum - sookshma_dashas[0]["years"]) < 0.01, \
        "Prana periods don't sum to Sookshma period"
    
    print("✓ All 5-level Vimshottari tests passed")

def test_dasha_lords_sequence():
    """Test that dasha lords follow correct sequence"""
    birth_date = datetime(1990, 1, 15, 10, 30)
    moon_longitude = 125.5
    
    calculator = VimshottariDasha(birth_date, moon_longitude)
    maha_dashas = calculator.calculate_maha_dashas(num_years=40)
    
    # Verify sequence repeats correctly
    sequence = ["KETU", "VENUS", "SUN", "MOON", "MARS", "RAHU", "JUPITER", "SATURN", "MERCURY"]
    
    # Find starting lord
    starting_lord = maha_dashas[0]["lord"]
    start_idx = sequence.index(starting_lord)
    
    # Check sequence continues correctly
    for i, dasha in enumerate(maha_dashas[1:], start=1):
        expected_lord = sequence[(start_idx + i) % 9]
        assert dasha["lord"] == expected_lord, \
            f"Dasha {i} lord mismatch: expected {expected_lord}, got {dasha['lord']}"
    
    print("✓ Dasha sequence test passed")

if __name__ == "__main__":
    test_vimshottari_5_levels()
    test_dasha_lords_sequence()
