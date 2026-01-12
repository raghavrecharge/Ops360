import pytest
from datetime import datetime
from app.api.transits import check_sade_sati, check_dhaiya_kantaka

def test_sade_sati_detection():
    """Test Sade Sati phase detection"""
    # Test Moon in Capricorn (10)
    moon_rasi = 10
    
    # Saturn in Sagittarius (9) - 12th from Moon
    saturn_rasi = 9
    result = check_sade_sati(saturn_rasi, moon_rasi)
    assert result["is_active"] == True
    assert result["phase"] == "rising"
    print("✓ Sade Sati rising phase detected correctly")
    
    # Saturn in Capricorn (10) - over Moon
    saturn_rasi = 10
    result = check_sade_sati(saturn_rasi, moon_rasi)
    assert result["is_active"] == True
    assert result["phase"] == "peak"
    print("✓ Sade Sati peak phase detected correctly")
    
    # Saturn in Aquarius (11) - 2nd from Moon
    saturn_rasi = 11
    result = check_sade_sati(saturn_rasi, moon_rasi)
    assert result["is_active"] == True
    assert result["phase"] == "setting"
    print("✓ Sade Sati setting phase detected correctly")
    
    # Saturn in Aries (1) - not in Sade Sati
    saturn_rasi = 1
    result = check_sade_sati(saturn_rasi, moon_rasi)
    assert result["is_active"] == False
    assert result["phase"] is None
    print("✓ No Sade Sati detected correctly")

def test_dhaiya_kantaka_detection():
    """Test Dhaiya and Kantaka detection"""
    # Test Moon in Leo (5)
    moon_rasi = 5
    
    # Saturn in Scorpio (8) - 4th from Moon (Dhaiya)
    saturn_rasi = 8
    result = check_dhaiya_kantaka(saturn_rasi, moon_rasi)
    assert result["is_active"] == True
    assert result["type"] == "dhaiya"
    print("✓ Dhaiya detected correctly")
    
    # Saturn in Pisces (12) - 8th from Moon (Kantaka)
    saturn_rasi = 12
    result = check_dhaiya_kantaka(saturn_rasi, moon_rasi)
    assert result["is_active"] == True
    assert result["type"] == "kantaka"
    print("✓ Kantaka Shani detected correctly")
    
    # Saturn in Aries (1) - not Dhaiya/Kantaka
    saturn_rasi = 1
    result = check_dhaiya_kantaka(saturn_rasi, moon_rasi)
    assert result["is_active"] == False
    assert result["type"] is None
    print("✓ No Dhaiya/Kantaka detected correctly")

def test_sade_sati_all_moon_signs():
    """Test Sade Sati detection for all Moon signs"""
    for moon_rasi in range(1, 13):
        # Test 12th house (rising)
        saturn_rasi = ((moon_rasi - 2) % 12) + 1
        result = check_sade_sati(saturn_rasi, moon_rasi)
        assert result["is_active"] == True
        assert result["phase"] == "rising"
        
        # Test same house (peak)
        saturn_rasi = moon_rasi
        result = check_sade_sati(saturn_rasi, moon_rasi)
        assert result["is_active"] == True
        assert result["phase"] == "peak"
        
        # Test 2nd house (setting)
        saturn_rasi = (moon_rasi % 12) + 1
        result = check_sade_sati(saturn_rasi, moon_rasi)
        assert result["is_active"] == True
        assert result["phase"] == "setting"
    
    print("✓ Sade Sati detection works for all 12 Moon signs")

if __name__ == "__main__":
    test_sade_sati_detection()
    test_dhaiya_kantaka_detection()
    test_sade_sati_all_moon_signs()
