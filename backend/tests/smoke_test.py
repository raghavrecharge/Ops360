#!/usr/bin/env python3
"""API Smoke Tests - Batch 1, 2, and 3"""
import requests
import sys
import time

BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200, f"Health endpoint failed: {response.status_code}"
    data = response.json()
    assert data.get("status") == "healthy", "Service not healthy"
    print("✓ Health endpoint passed")
    return True

def setup_demo_and_login():
    """Setup demo user and login"""
    print("Setting up demo user...")
    response = requests.post(f"{BASE_URL}/api/demo/setup")
    assert response.status_code == 200, f"Demo setup failed: {response.status_code}"
    
    print("Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": "demo@astroos.com", "password": "demo123"}
    )
    assert response.status_code == 200, f"Login failed: {response.status_code}"
    token = response.json().get("access_token")
    assert token, "No access token"
    print("✓ Demo setup and login passed")
    return token

def test_get_profiles(token):
    """Test getting profiles"""
    print("Testing get profiles...")
    response = requests.get(
        f"{BASE_URL}/api/profiles",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Get profiles failed: {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Profiles response not a list"
    assert len(data) > 0, "No profiles found"
    print(f"✓ Get profiles passed (found {len(data)} profiles)")
    return data[0]["id"]

def test_chart_bundle(token, profile_id):
    """Test chart bundle endpoint"""
    print("Testing chart bundle...")
    response = requests.get(
        f"{BASE_URL}/api/charts/{profile_id}/bundle",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Chart bundle failed: {response.status_code}"
    data = response.json()
    assert "d1" in data, "D1 not in bundle"
    assert "planetary_table" in data, "Planetary table not in bundle"
    print("✓ Chart bundle passed")
    return True

def test_dashas(token, profile_id):
    """Test Vimshottari dashas"""
    print("Testing Vimshottari dashas...")
    response = requests.get(
        f"{BASE_URL}/api/dashas/{profile_id}?system=vimshottari&depth=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashas failed: {response.status_code}"
    data = response.json()
    assert "dashas" in data, "Dashas not in response"
    assert len(data["dashas"]) > 0, "No dashas returned"
    print(f"✓ Vimshottari dashas passed ({len(data['dashas'])} dashas)")
    return True

def test_transits(token, profile_id):
    """Test today's transits"""
    print("Testing today's transits...")
    response = requests.get(
        f"{BASE_URL}/api/transits/today/{profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Transits failed: {response.status_code}"
    data = response.json()
    assert "transiting_planets" in data, "Transiting planets not in response"
    print("✓ Today's transits passed")
    return True

# Batch 3 Tests
def test_ashtakavarga(token, profile_id):
    """Test Ashtakavarga endpoints"""
    print("Testing Ashtakavarga BAV...")
    response = requests.get(
        f"{BASE_URL}/api/ashtakavarga/{profile_id}/bav",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Ashtakavarga BAV failed: {response.status_code}"
    data = response.json()
    assert "bav" in data, "BAV not in response"
    assert len(data["bav"]) == 7, "BAV should have 7 planets"
    
    print("Testing Ashtakavarga SAV...")
    response = requests.get(
        f"{BASE_URL}/api/ashtakavarga/{profile_id}/sav",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Ashtakavarga SAV failed: {response.status_code}"
    data = response.json()
    assert "sav" in data, "SAV not in response"
    
    print("Testing Ashtakavarga Summary...")
    response = requests.get(
        f"{BASE_URL}/api/ashtakavarga/{profile_id}/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Ashtakavarga summary failed: {response.status_code}"
    data = response.json()
    assert "summary" in data, "Summary not in response"
    print("✓ Ashtakavarga tests passed")
    return True

def test_yogas(token, profile_id):
    """Test Yoga detection endpoints"""
    print("Testing Yogas...")
    response = requests.get(
        f"{BASE_URL}/api/yogas/{profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Yogas failed: {response.status_code}"
    data = response.json()
    assert "yogas" in data, "Yogas not in response"
    assert "count" in data, "Count not in response"
    
    print("Testing Yoga categories...")
    response = requests.get(
        f"{BASE_URL}/api/yogas/{profile_id}/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Yoga categories failed: {response.status_code}"
    print(f"✓ Yogas tests passed ({data['count']} yogas detected)")
    return True

def test_strength(token, profile_id):
    """Test Strength (Shadbala) endpoints"""
    print("Testing Shadbala...")
    response = requests.get(
        f"{BASE_URL}/api/strength/{profile_id}/shadbala",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Shadbala failed: {response.status_code}"
    data = response.json()
    assert "shadbala" in data, "Shadbala not in response"
    
    print("Testing Strength summary...")
    response = requests.get(
        f"{BASE_URL}/api/strength/{profile_id}/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Strength summary failed: {response.status_code}"
    data = response.json()
    assert "strongest_planet" in data, "Strongest planet not in response"
    print(f"✓ Strength tests passed (strongest: {data['strongest_planet']})")
    return True

def test_varshaphala(token, profile_id):
    """Test Varshaphala (Annual Chart) endpoints"""
    print("Testing Varshaphala...")
    response = requests.get(
        f"{BASE_URL}/api/varshaphala/{profile_id}/2025",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Varshaphala failed: {response.status_code}"
    data = response.json()
    assert "year" in data, "Year not in response"
    assert "tajika_yogas" in data, "Tajika yogas not in response"
    assert data["year"] == 2025, "Wrong year"
    
    print("Testing Muntha...")
    response = requests.get(
        f"{BASE_URL}/api/varshaphala/{profile_id}/muntha/2025",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Muntha failed: {response.status_code}"
    print(f"✓ Varshaphala tests passed ({len(data['tajika_yogas'])} Tajika yogas)")
    return True

def test_compatibility(token, profile_id):
    """Test Compatibility endpoints (need 2nd profile)"""
    print("Creating 2nd profile for compatibility...")
    response = requests.post(
        f"{BASE_URL}/api/profiles",
        params={
            "name": "Test Partner",
            "birth_date": "1992-05-20",
            "birth_time": "14:30:00",
            "birth_place": "Mumbai, India",
            "latitude": 19.076,
            "longitude": 72.8777,
            "timezone": "Asia/Kolkata",
            "ayanamsa": "LAHIRI"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        print(f"  (Using existing profile)")
        profile2_id = 2
    else:
        profile2_id = response.json().get("id", 2)
    
    print("Testing Compatibility...")
    response = requests.get(
        f"{BASE_URL}/api/compatibility/{profile_id}/{profile2_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Compatibility failed: {response.status_code}"
    data = response.json()
    assert "ashtakoot" in data, "Ashtakoot not in response"
    assert "manglik_analysis" in data, "Manglik analysis not in response"
    
    print("Testing Manglik status...")
    response = requests.get(
        f"{BASE_URL}/api/compatibility/{profile_id}/manglik",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Manglik failed: {response.status_code}"
    print(f"✓ Compatibility tests passed (score: {data['ashtakoot']['total']}/36)")
    return True

def test_remedies(token, profile_id):
    """Test Remedies endpoints"""
    print("Testing Remedies...")
    response = requests.get(
        f"{BASE_URL}/api/remedies/{profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Remedies failed: {response.status_code}"
    data = response.json()
    assert "weak_planets" in data, "Weak planets not in response"
    assert "remedies_by_planet" in data, "Remedies by planet not in response"
    
    print("Testing Quick Remedies...")
    response = requests.get(
        f"{BASE_URL}/api/remedies/{profile_id}/quick",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Quick remedies failed: {response.status_code}"
    
    print("Testing Gemstone recommendations...")
    response = requests.get(
        f"{BASE_URL}/api/remedies/{profile_id}/gemstones",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Gemstones failed: {response.status_code}"
    print(f"✓ Remedies tests passed (weak planets: {data['weak_planets'][:3]})")
    return True

# Batch 4 Tests
def test_align27_day(token, profile_id):
    """Test Align27 day score endpoint"""
    print("Testing Align27 day score...")
    response = requests.get(
        f"{BASE_URL}/api/align27/day?profile_id={profile_id}&date=2026-01-05",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Align27 day failed: {response.status_code}"
    data = response.json()
    assert "score" in data, "Score not in response"
    assert "color" in data, "Color not in response"
    assert data["color"] in ["GREEN", "AMBER", "RED"], f"Invalid color: {data['color']}"
    print(f"✓ Align27 day score passed (score: {data['score']}, color: {data['color']})")
    return True

def test_align27_moments(token, profile_id):
    """Test Align27 moments endpoint"""
    print("Testing Align27 moments...")
    response = requests.get(
        f"{BASE_URL}/api/align27/moments?profile_id={profile_id}&date=2026-01-05",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Align27 moments failed: {response.status_code}"
    data = response.json()
    assert "moments" in data, "Moments not in response"
    assert len(data["moments"]) > 0, "No moments returned"
    
    types = [m["type"] for m in data["moments"]]
    assert "GOLDEN" in types, "No GOLDEN moment"
    print(f"✓ Align27 moments passed ({len(data['moments'])} moments, types: {set(types)})")
    return True

def test_align27_planner(token, profile_id):
    """Test Align27 planner endpoint"""
    print("Testing Align27 planner (90 days)...")
    response = requests.get(
        f"{BASE_URL}/api/align27/planner?profile_id={profile_id}&start=2026-01-05&days=90",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Align27 planner failed: {response.status_code}"
    data = response.json()
    assert "planner" in data, "Planner not in response"
    assert len(data["planner"]) == 90, f"Expected 90 days, got {len(data['planner'])}"
    
    green_days = len([d for d in data["planner"] if d["color"] == "GREEN"])
    print(f"✓ Align27 planner passed (90 days, {green_days} GREEN days)")
    return True

def test_align27_ics(token, profile_id):
    """Test Align27 ICS export endpoint"""
    print("Testing Align27 ICS export...")
    response = requests.get(
        f"{BASE_URL}/api/align27/ics?profile_id={profile_id}&start=2026-01-05&end=2026-01-10",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Align27 ICS failed: {response.status_code}"
    
    content = response.text
    assert "BEGIN:VCALENDAR" in content, "Invalid ICS: missing VCALENDAR"
    assert "BEGIN:VEVENT" in content, "Invalid ICS: no events"
    assert "GOLDEN Moment" in content or "PRODUCTIVE Moment" in content or "SILENCE Moment" in content
    
    event_count = content.count("BEGIN:VEVENT")
    print(f"✓ Align27 ICS export passed ({event_count} events)")
    return True

def test_align27_rituals(token, profile_id):
    """Test Align27 rituals endpoint"""
    print("Testing Align27 rituals...")
    response = requests.get(
        f"{BASE_URL}/api/align27/rituals?profile_id={profile_id}&date=2026-01-05",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Align27 rituals failed: {response.status_code}"
    data = response.json()
    assert "rituals" in data, "Rituals not in response"
    assert len(data["rituals"]) > 0, "No rituals returned"
    print(f"✓ Align27 rituals passed ({len(data['rituals'])} rituals)")
    return True


# ========== BATCH 5: RAG + ML Tests ==========

def test_kb_stats(token):
    """Test KB stats endpoint"""
    print("Testing KB stats...")
    response = requests.get(
        f"{BASE_URL}/api/kb/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"KB stats failed: {response.status_code}"
    data = response.json()
    assert "total_sources" in data, "total_sources missing"
    assert "max_files" in data, "max_files missing"
    assert data["max_files"] == 200, f"max_files should be 200, got {data['max_files']}"
    print(f"✓ KB stats passed (max_files: {data['max_files']}, sources: {data['total_sources']})")
    return True


def test_kb_sources(token):
    """Test KB sources endpoint"""
    print("Testing KB sources list...")
    response = requests.get(
        f"{BASE_URL}/api/kb/sources",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"KB sources failed: {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Expected list of sources"
    print(f"✓ KB sources passed ({len(data)} sources)")
    return True


def test_chat_sessions(token):
    """Test chat sessions endpoint"""
    print("Testing chat sessions list...")
    response = requests.get(
        f"{BASE_URL}/api/chat/sessions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Chat sessions failed: {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Expected list of sessions"
    print(f"✓ Chat sessions passed ({len(data)} sessions)")
    return True


def test_ml_stats(token):
    """Test ML stats endpoint"""
    print("Testing ML stats...")
    response = requests.get(
        f"{BASE_URL}/api/ml/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"ML stats failed: {response.status_code}"
    data = response.json()
    assert "total_examples" in data, "total_examples missing"
    assert "by_event_type" in data, "by_event_type missing"
    print(f"✓ ML stats passed (examples: {data['total_examples']})")
    return True


def test_ml_event_labels(token):
    """Test ML event labels endpoint"""
    print("Testing ML event labels...")
    response = requests.get(
        f"{BASE_URL}/api/ml/event-labels",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"ML event labels failed: {response.status_code}"
    data = response.json()
    assert "labels" in data, "labels missing"
    expected_labels = ["marriage", "job_change", "health_issue", "foreign_travel", "property_purchase"]
    assert data["labels"] == expected_labels, f"Labels mismatch: {data['labels']}"
    print(f"✓ ML event labels passed ({len(data['labels'])} labels)")
    return True


def test_ml_extract_features(token, profile_id):
    """Test ML feature extraction endpoint"""
    print("Testing ML feature extraction...")
    response = requests.post(
        f"{BASE_URL}/api/ml/extract-features?profile_id={profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"ML extract features failed: {response.status_code}"
    data = response.json()
    assert "features" in data, "features missing"
    assert "feature_count" in data, "feature_count missing"
    print(f"✓ ML feature extraction passed ({data['feature_count']} features)")
    return True


# ========== BATCH 6: Dashboard Tests ==========

def test_dashboard_widgets(token):
    """Test dashboard widgets endpoint"""
    print("Testing dashboard widgets...")
    response = requests.get(
        f"{BASE_URL}/api/dashboard/widgets",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashboard widgets failed: {response.status_code}"
    data = response.json()
    assert len(data) >= 11, f"Expected at least 11 widgets, got {len(data)}"
    widget_ids = [w['widget_id'] for w in data]
    required = ['chart_d1', 'chart_d9', 'dasha_running', 'align27_today', 'ai_insight']
    for req in required:
        assert req in widget_ids, f"Missing required widget: {req}"
    print(f"✓ Dashboard widgets passed ({len(data)} widgets)")
    return True


def test_dashboard_default_layout(token, profile_id):
    """Test dashboard default layout endpoint"""
    print("Testing dashboard default layout...")
    response = requests.get(
        f"{BASE_URL}/api/dashboard/layouts/default?profile_id={profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashboard default layout failed: {response.status_code}"
    data = response.json()
    assert "layout_json" in data, "layout_json missing"
    assert len(data["layout_json"]) >= 10, f"Expected at least 10 layout items, got {len(data['layout_json'])}"
    print(f"✓ Dashboard default layout passed ({len(data['layout_json'])} items)")
    return True


def test_dashboard_layouts_crud(token, profile_id):
    """Test dashboard layout CRUD operations"""
    print("Testing dashboard layout save...")
    
    # Create layout
    payload = {
        "layout_name": "Test Layout",
        "profile_id": profile_id,
        "layout_json": [
            {"i": "chart_d1", "x": 0, "y": 0, "w": 4, "h": 4}
        ],
        "widget_configs": {},
        "is_default": False
    }
    response = requests.post(
        f"{BASE_URL}/api/dashboard/layouts",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload
    )
    assert response.status_code == 200, f"Dashboard layout create failed: {response.status_code}"
    layout = response.json()
    layout_id = layout["id"]
    
    # List layouts
    response = requests.get(
        f"{BASE_URL}/api/dashboard/layouts",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashboard layouts list failed: {response.status_code}"
    layouts = response.json()
    assert any(l["id"] == layout_id for l in layouts), "Created layout not in list"
    
    # Delete layout
    response = requests.delete(
        f"{BASE_URL}/api/dashboard/layouts/{layout_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashboard layout delete failed: {response.status_code}"
    
    print("✓ Dashboard layouts CRUD passed")
    return True


def test_dashboard_insight(token, profile_id):
    """Test dashboard AI insight endpoint"""
    print("Testing dashboard insight...")
    response = requests.get(
        f"{BASE_URL}/api/dashboard/insight?profile_id={profile_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Dashboard insight failed: {response.status_code}"
    data = response.json()
    assert "insight" in data, "insight missing"
    assert len(data["insight"]) > 10, "Insight too short"
    print(f"✓ Dashboard insight passed (length: {len(data['insight'])})")
    return True


def run_smoke_tests():
    """Run all smoke tests"""
    print("\n" + "="*60)
    print("Running API Smoke Tests - Batches 1, 2, 3, 4, 5, and 6")
    print("="*60 + "\n")
    
    try:
        # Wait for service to be ready
        print("Waiting for service...")
        for i in range(30):
            try:
                requests.get(f"{BASE_URL}/api/health", timeout=1)
                break
            except Exception:
                time.sleep(1)
        
        # Batch 1 Tests
        print("\n--- BATCH 1: Foundation ---")
        test_health()
        token = setup_demo_and_login()
        profile_id = test_get_profiles(token)
        
        # Batch 2 Tests
        print("\n--- BATCH 2: Astrology Workspace ---")
        test_chart_bundle(token, profile_id)
        test_dashas(token, profile_id)
        test_transits(token, profile_id)
        
        # Batch 3 Tests
        print("\n--- BATCH 3: Advanced Modules ---")
        test_ashtakavarga(token, profile_id)
        test_yogas(token, profile_id)
        test_strength(token, profile_id)
        test_varshaphala(token, profile_id)
        test_compatibility(token, profile_id)
        test_remedies(token, profile_id)
        
        # Batch 4 Tests
        print("\n--- BATCH 4: Align27 Features ---")
        test_align27_day(token, profile_id)
        test_align27_moments(token, profile_id)
        test_align27_planner(token, profile_id)
        test_align27_ics(token, profile_id)
        test_align27_rituals(token, profile_id)
        
        # Batch 5 Tests
        print("\n--- BATCH 5: RAG + ML ---")
        test_kb_stats(token)
        test_kb_sources(token)
        test_chat_sessions(token)
        test_ml_stats(token)
        test_ml_event_labels(token)
        test_ml_extract_features(token, profile_id)
        
        # Batch 6 Tests
        print("\n--- BATCH 6: Dashboard ---")
        test_dashboard_widgets(token)
        test_dashboard_default_layout(token, profile_id)
        test_dashboard_layouts_crud(token, profile_id)
        test_dashboard_insight(token, profile_id)
        
        print("\n" + "="*60)
        print("All Smoke Tests Passed! ✓")
        print("="*60 + "\n")
        return 0
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(run_smoke_tests())
