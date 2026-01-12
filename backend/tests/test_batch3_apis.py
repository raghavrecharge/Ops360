#!/usr/bin/env python3
"""
Comprehensive Pytest Tests for AstroOS Batch 3 APIs
Tests: Ashtakavarga, Yogas, Strength, Varshaphala, Compatibility, Remedies
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://stellar-align.preview.emergentagent.com')


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for demo user"""
        # Setup demo user first
        setup_response = requests.post(f"{BASE_URL}/api/demo/setup")
        assert setup_response.status_code == 200, f"Demo setup failed: {setup_response.text}"
        
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "demo@astroos.com", "password": "demo123"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        token = login_response.json().get("access_token")
        assert token, "No access token returned"
        return token
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    @pytest.fixture(scope="class")
    def profile_id(self, headers):
        """Get first profile ID"""
        response = requests.get(f"{BASE_URL}/api/profiles", headers=headers)
        assert response.status_code == 200
        profiles = response.json()
        assert len(profiles) > 0, "No profiles found"
        return profiles[0]["id"]


class TestHealthAndRegression(TestSetup):
    """Batch 1 & 2 regression tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is working"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "AstroOS"
    
    def test_chart_bundle(self, headers, profile_id):
        """Test chart bundle endpoint (Batch 2)"""
        response = requests.get(f"{BASE_URL}/api/charts/{profile_id}/bundle", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "d1" in data, "D1 chart missing"
        assert "planetary_table" in data, "Planetary table missing"
        assert len(data["planetary_table"]) == 9, "Should have 9 planets"
    
    def test_dashas(self, headers, profile_id):
        """Test Vimshottari dashas endpoint (Batch 2)"""
        response = requests.get(
            f"{BASE_URL}/api/dashas/{profile_id}?system=vimshottari&depth=1",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "dashas" in data
        assert "current" in data
        assert len(data["dashas"]) > 0


class TestAshtakavarga(TestSetup):
    """Ashtakavarga module tests"""
    
    def test_bav_endpoint(self, headers, profile_id):
        """Test Bhinnashtakavarga endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/ashtakavarga/{profile_id}/bav",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate BAV structure
        assert "bav" in data, "BAV data missing"
        assert len(data["bav"]) == 7, "BAV should have 7 planets"
        
        # Validate planet totals
        assert "planet_totals" in data
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            assert planet in data["bav"], f"{planet} missing from BAV"
            assert len(data["bav"][planet]) == 12, f"{planet} should have 12 house values"
    
    def test_sav_endpoint(self, headers, profile_id):
        """Test Sarvashtakavarga endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/ashtakavarga/{profile_id}/sav",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "sav" in data, "SAV data missing"
        assert len(data["sav"]) == 12, "SAV should have 12 house values"
        assert "total_points" in data
        assert "reductions" in data
    
    def test_ashtakavarga_summary(self, headers, profile_id):
        """Test Ashtakavarga summary endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/ashtakavarga/{profile_id}/summary",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "summary" in data
        assert "strong_houses" in data
        assert "weak_houses" in data
        assert "sav_by_house" in data
        assert "interpretation" in data
        
        # Validate summary fields
        summary = data["summary"]
        assert "total_points" in summary
        assert "max_rasi" in summary
        assert "min_rasi" in summary
        assert "average" in summary


class TestYogas(TestSetup):
    """Yoga detection module tests"""
    
    def test_yogas_endpoint(self, headers, profile_id):
        """Test yogas detection endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/yogas/{profile_id}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "yogas" in data
        assert "count" in data
        assert "categories" in data
        assert isinstance(data["yogas"], list)
        
        # Validate yoga structure if any detected
        if data["count"] > 0:
            yoga = data["yogas"][0]
            assert "name" in yoga
            assert "type" in yoga
            assert "description" in yoga
            assert "strength" in yoga
    
    def test_yoga_categories(self, headers, profile_id):
        """Test yoga categories endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/yogas/{profile_id}/categories",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "categories" in data
        # Validate category structure
        for cat_name, cat_data in data["categories"].items():
            assert "count" in cat_data
            assert "yogas" in cat_data
    
    def test_yogas_filter_by_category(self, headers, profile_id):
        """Test filtering yogas by category"""
        # First get all yogas to find a category
        response = requests.get(
            f"{BASE_URL}/api/yogas/{profile_id}",
            headers=headers
        )
        data = response.json()
        
        if data["categories"]:
            category = data["categories"][0]
            filtered_response = requests.get(
                f"{BASE_URL}/api/yogas/{profile_id}?category={category}",
                headers=headers
            )
            assert filtered_response.status_code == 200
            filtered_data = filtered_response.json()
            
            # All returned yogas should be of the filtered category
            for yoga in filtered_data["yogas"]:
                assert yoga["type"] == category


class TestStrength(TestSetup):
    """Planetary strength (Shadbala) module tests"""
    
    def test_shadbala_endpoint(self, headers, profile_id):
        """Test Shadbala endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/strength/{profile_id}/shadbala",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "shadbala" in data
        
        # Validate Shadbala for each planet
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            assert planet in data["shadbala"], f"{planet} missing from Shadbala"
            planet_data = data["shadbala"][planet]
            
            # Validate Shadbala components
            assert "sthana_bala" in planet_data
            assert "dig_bala" in planet_data
            assert "kala_bala" in planet_data
            assert "chesta_bala" in planet_data
            assert "naisargika_bala" in planet_data
            assert "drik_bala" in planet_data
            assert "total" in planet_data
    
    def test_strength_summary(self, headers, profile_id):
        """Test strength summary endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/strength/{profile_id}/summary",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "strongest_planet" in data
        assert "weakest_planet" in data
        assert "shadbala_summary" in data
        assert "ishtakashta_summary" in data
        assert "avastha_summary" in data
        
        # Validate strongest/weakest are valid planets
        valid_planets = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]
        assert data["strongest_planet"] in valid_planets
        assert data["weakest_planet"] in valid_planets


class TestVarshaphala(TestSetup):
    """Varshaphala (Annual Chart) module tests"""
    
    def test_varshaphala_endpoint(self, headers, profile_id):
        """Test Varshaphala for year 2025"""
        response = requests.get(
            f"{BASE_URL}/api/varshaphala/{profile_id}/2025",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["year"] == 2025
        assert "varsha_pravesh_date" in data
        assert "ascendant" in data
        assert "planetary_positions" in data
        assert "tajika_yogas" in data
        assert "sahams" in data
        assert "mudda_dasha" in data
        assert "predictions" in data
        
        # Validate planetary positions
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            assert planet in data["planetary_positions"]
    
    def test_muntha_endpoint(self, headers, profile_id):
        """Test Muntha endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/varshaphala/{profile_id}/muntha/2025",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["year"] == 2025
        assert "age" in data
        assert "muntha_rasi" in data
        assert "muntha_sign" in data
        assert "muntha_house" in data
        assert "interpretation" in data
        assert "is_favorable" in data
        
        # Validate muntha_rasi is 1-12
        assert 1 <= data["muntha_rasi"] <= 12
        assert 1 <= data["muntha_house"] <= 12
    
    def test_varshaphala_predictions(self, headers, profile_id):
        """Test Varshaphala predictions structure"""
        response = requests.get(
            f"{BASE_URL}/api/varshaphala/{profile_id}/2025",
            headers=headers
        )
        data = response.json()
        
        predictions = data["predictions"]
        assert "overall_theme" in predictions
        assert "career" in predictions
        assert "relationships" in predictions
        assert "health" in predictions
        assert "finance" in predictions


class TestCompatibility(TestSetup):
    """Compatibility module tests"""
    
    def test_manglik_status(self, headers, profile_id):
        """Test Manglik status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/compatibility/{profile_id}/manglik",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "profile" in data
        assert "manglik_status" in data
        
        manglik = data["manglik_status"]
        assert "is_manglik" in manglik
        assert "mars_house" in manglik
        assert "severity" in manglik
        assert "cancelled" in manglik
    
    def test_compatibility_between_profiles(self, headers, profile_id):
        """Test compatibility between two profiles"""
        # Get second profile
        profiles_response = requests.get(f"{BASE_URL}/api/profiles", headers=headers)
        profiles = profiles_response.json()
        
        if len(profiles) < 2:
            pytest.skip("Need at least 2 profiles for compatibility test")
        
        profile2_id = profiles[1]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/compatibility/{profile_id}/{profile2_id}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "profile1" in data
        assert "profile2" in data
        assert "ashtakoot" in data
        assert "manglik_analysis" in data
        assert "recommendations" in data
        
        # Validate Ashtakoot scores
        ashtakoot = data["ashtakoot"]
        expected_koots = ["varna", "vashya", "tara", "yoni", "graha_maitri", "gana", "bhakoot", "nadi"]
        for koot in expected_koots:
            assert koot in ashtakoot, f"{koot} missing from Ashtakoot"
    
    def test_compatibility_total_score(self, headers, profile_id):
        """Test compatibility total score calculation"""
        profiles_response = requests.get(f"{BASE_URL}/api/profiles", headers=headers)
        profiles = profiles_response.json()
        
        if len(profiles) < 2:
            pytest.skip("Need at least 2 profiles for compatibility test")
        
        profile2_id = profiles[1]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/compatibility/{profile_id}/{profile2_id}",
            headers=headers
        )
        data = response.json()
        
        # Total score should be between 0 and 36
        assert "total_score" in data
        assert 0 <= data["total_score"] <= 36


class TestRemedies(TestSetup):
    """Remedies module tests"""
    
    def test_remedies_endpoint(self, headers, profile_id):
        """Test main remedies endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/remedies/{profile_id}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "weak_planets" in data
        assert "afflicted_planets" in data
        assert "priority_planets" in data
        assert "remedies_by_planet" in data
        assert "general_recommendations" in data
        
        # Validate remedy structure for each planet
        for planet, remedies in data["remedies_by_planet"].items():
            assert "gemstone" in remedies
            assert "mantra" in remedies
            assert "charity" in remedies
            assert "fasting" in remedies
            assert "rudraksha" in remedies
    
    def test_quick_remedies(self, headers, profile_id):
        """Test quick remedies endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/remedies/{profile_id}/quick",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "weak_planets" in data
        assert "quick_remedies" in data
        assert "note" in data
        
        # Validate quick remedy structure
        for planet, remedies in data["quick_remedies"].items():
            assert isinstance(remedies, list)
            for remedy in remedies:
                assert "type" in remedy
                assert "description" in remedy
    
    def test_gemstone_recommendations(self, headers, profile_id):
        """Test gemstone recommendations endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/remedies/{profile_id}/gemstones",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "ascendant_rasi" in data
        assert "ascendant_lord" in data
        assert "gemstone_recommendations" in data
        assert "caution" in data
        
        # Validate gemstone recommendation structure
        for gem in data["gemstone_recommendations"]:
            assert "primary_gem" in gem
            assert "metal" in gem
            assert "finger" in gem
            assert "day_to_wear" in gem
            assert "recommendation_type" in gem
            assert "priority" in gem
    
    def test_mantra_recommendations(self, headers, profile_id):
        """Test mantra recommendations endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/remedies/{profile_id}/mantras",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "weak_planets" in data
        assert "mantras" in data
        assert "daily_schedule" in data
        
        # Validate mantra structure
        for planet, mantra in data["mantras"].items():
            assert "beej_mantra" in mantra
            assert "vedic_mantra" in mantra
            assert "minimum_count" in mantra
            assert "best_day" in mantra
            assert "is_priority" in mantra


class TestEdgeCases(TestSetup):
    """Edge case and error handling tests"""
    
    def test_invalid_profile_id(self, headers):
        """Test with invalid profile ID"""
        response = requests.get(
            f"{BASE_URL}/api/ashtakavarga/99999/bav",
            headers=headers
        )
        assert response.status_code == 404
    
    def test_unauthorized_access(self):
        """Test without authentication"""
        response = requests.get(f"{BASE_URL}/api/ashtakavarga/1/bav")
        assert response.status_code == 401
    
    def test_invalid_year_varshaphala(self, headers, profile_id):
        """Test Varshaphala with edge case years"""
        # Test with a very old year
        response = requests.get(
            f"{BASE_URL}/api/varshaphala/{profile_id}/1950",
            headers=headers
        )
        # Should still work (person born 1990, so 1950 is before birth)
        # API may return error or handle gracefully
        assert response.status_code in [200, 400]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
