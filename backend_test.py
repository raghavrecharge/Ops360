#!/usr/bin/env python3
"""
Ops360 Mobile Field Operations API Backend Tests
Tests all backend APIs including authentication, attendance, activities, expenses, and dashboard.
"""

import requests
import json
import base64
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = "http://localhost:8001"  # Use localhost for testing
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def log_pass(self, test_name):
        print(f"✅ PASS: {test_name}")
        self.passed += 1
    
    def log_fail(self, test_name, error):
        print(f"❌ FAIL: {test_name} - {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")

# Global test state
results = TestResults()
auth_token = None
user_data = None

def create_sample_image():
    """Create a small base64 encoded image for testing"""
    # Simple 1x1 pixel PNG in base64
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def test_health_check():
    """Test basic health check endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            results.log_pass("Health check")
            return True
        else:
            results.log_fail("Health check", f"Status code: {response.status_code}")
            return False
    except Exception as e:
        results.log_fail("Health check", f"Connection error: {str(e)}")
        return False

def test_api_root():
    """Test API root endpoint"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                results.log_pass("API root endpoint")
                return True
        results.log_fail("API root endpoint", f"Unexpected response: {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("API root endpoint", f"Error: {str(e)}")
        return False

def test_register_user():
    """Test user registration"""
    global user_data
    try:
        # Test with promoter role as requested
        user_data = {
            "email": f"testpromoter_{uuid.uuid4().hex[:8]}@ops360.com",
            "name": "Test Promoter User",
            "phone": "+1234567890",
            "password": "testpassword123",
            "role": "promoter"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=user_data, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if data.get("email") == user_data["email"] and data.get("role") == "promoter":
                results.log_pass("User registration (promoter)")
                return True
        
        results.log_fail("User registration", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("User registration", f"Error: {str(e)}")
        return False

def test_duplicate_registration():
    """Test duplicate email registration should fail"""
    try:
        response = requests.post(f"{API_BASE}/auth/register", json=user_data, timeout=10)
        
        if response.status_code == 400:
            results.log_pass("Duplicate registration prevention")
            return True
        
        results.log_fail("Duplicate registration prevention", f"Expected 400, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Duplicate registration prevention", f"Error: {str(e)}")
        return False

def test_login():
    """Test user login"""
    global auth_token
    try:
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                results.log_pass("User login")
                return True
        
        results.log_fail("User login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("User login", f"Error: {str(e)}")
        return False

def test_invalid_login():
    """Test login with invalid credentials"""
    try:
        login_data = {
            "email": user_data["email"],
            "password": "wrongpassword"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 401:
            results.log_pass("Invalid login rejection")
            return True
        
        results.log_fail("Invalid login rejection", f"Expected 401, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Invalid login rejection", f"Error: {str(e)}")
        return False

def test_get_current_user():
    """Test getting current user info"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == user_data["email"]:
                results.log_pass("Get current user")
                return True
        
        results.log_fail("Get current user", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get current user", f"Error: {str(e)}")
        return False

def test_unauthorized_access():
    """Test accessing protected endpoint without token"""
    try:
        response = requests.get(f"{API_BASE}/auth/me", timeout=10)
        
        if response.status_code == 401:
            results.log_pass("Unauthorized access prevention")
            return True
        
        results.log_fail("Unauthorized access prevention", f"Expected 401, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Unauthorized access prevention", f"Error: {str(e)}")
        return False

def test_start_attendance():
    """Test starting attendance"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        attendance_data = {
            "action": "start",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "accuracy": 5.0,
            "photo": create_sample_image(),
            "notes": "Starting my day"
        }
        
        response = requests.post(f"{API_BASE}/attendance", json=attendance_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "in_progress":
                results.log_pass("Start attendance")
                return True
        
        results.log_fail("Start attendance", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Start attendance", f"Error: {str(e)}")
        return False

def test_duplicate_start_attendance():
    """Test that starting attendance twice should fail"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        attendance_data = {
            "action": "start",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "accuracy": 5.0,
            "photo": create_sample_image()
        }
        
        response = requests.post(f"{API_BASE}/attendance", json=attendance_data, headers=headers, timeout=10)
        
        if response.status_code == 400:
            results.log_pass("Duplicate start attendance prevention")
            return True
        
        results.log_fail("Duplicate start attendance prevention", f"Expected 400, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Duplicate start attendance prevention", f"Error: {str(e)}")
        return False

def test_get_today_attendance():
    """Test getting today's attendance"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/attendance/today", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and data.get("status") == "in_progress":
                results.log_pass("Get today's attendance")
                return True
        
        results.log_fail("Get today's attendance", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get today's attendance", f"Error: {str(e)}")
        return False

def test_get_attendance_history():
    """Test getting attendance history"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/attendance/history", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.log_pass("Get attendance history")
                return True
        
        results.log_fail("Get attendance history", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get attendance history", f"Error: {str(e)}")
        return False

def test_create_activity():
    """Test creating an activity"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        activity_data = {
            "description": "Visited client location",
            "photo": create_sample_image(),
            "latitude": 37.7849,
            "longitude": -122.4094,
            "activity_type": "client_visit"
        }
        
        response = requests.post(f"{API_BASE}/activities", json=activity_data, headers=headers, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if data.get("description") == activity_data["description"]:
                results.log_pass("Create activity")
                return True
        
        results.log_fail("Create activity", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Create activity", f"Error: {str(e)}")
        return False

def test_get_today_activities():
    """Test getting today's activities"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/activities/today", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                results.log_pass("Get today's activities")
                return True
        
        results.log_fail("Get today's activities", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get today's activities", f"Error: {str(e)}")
        return False

def test_get_expense_categories():
    """Test getting expense categories (role-based)"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/expenses/categories", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            categories = data.get("categories", [])
            # Should get promoter categories since we registered as promoter
            expected_promoter_categories = ["Travel", "Food", "Promotion Materials", "Communication", "Other"]
            if any(cat in categories for cat in expected_promoter_categories):
                results.log_pass("Get expense categories (promoter role)")
                return True
        
        results.log_fail("Get expense categories", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get expense categories", f"Error: {str(e)}")
        return False

def test_create_expense():
    """Test creating an expense"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        expense_data = {
            "category": "Travel",
            "amount": 25.50,
            "description": "Bus fare to client location",
            "receipt_image": create_sample_image()
        }
        
        response = requests.post(f"{API_BASE}/expenses", json=expense_data, headers=headers, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if data.get("amount") == expense_data["amount"]:
                results.log_pass("Create expense")
                return True
        
        results.log_fail("Create expense", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Create expense", f"Error: {str(e)}")
        return False

def test_get_today_expenses():
    """Test getting today's expenses"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/expenses/today", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                results.log_pass("Get today's expenses")
                return True
        
        results.log_fail("Get today's expenses", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get today's expenses", f"Error: {str(e)}")
        return False

def test_get_today_expense_total():
    """Test getting today's expense total"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/expenses/today/total", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "total" in data and "count" in data:
                results.log_pass("Get today's expense total")
                return True
        
        results.log_fail("Get today's expense total", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Get today's expense total", f"Error: {str(e)}")
        return False

def test_mobile_dashboard():
    """Test mobile dashboard stats"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_BASE}/dashboard/mobile", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["day_status", "total_expenses", "expenses_count", "activities_count"]
            if all(field in data for field in required_fields):
                results.log_pass("Mobile dashboard")
                return True
        
        results.log_fail("Mobile dashboard", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Mobile dashboard", f"Error: {str(e)}")
        return False

def test_end_attendance():
    """Test ending attendance"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        attendance_data = {
            "action": "end",
            "latitude": 37.7649,
            "longitude": -122.4294,
            "accuracy": 5.0,
            "photo": create_sample_image(),  # Required for end day
            "notes": "Ending my day"
        }
        
        response = requests.post(f"{API_BASE}/attendance", json=attendance_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "completed":
                results.log_pass("End attendance")
                return True
        
        results.log_fail("End attendance", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("End attendance", f"Error: {str(e)}")
        return False

def test_activity_after_day_end():
    """Test that activities cannot be created after day ends"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        activity_data = {
            "description": "Should not work",
            "photo": create_sample_image(),
            "latitude": 37.7849,
            "longitude": -122.4094,
            "activity_type": "test"
        }
        
        response = requests.post(f"{API_BASE}/activities", json=activity_data, headers=headers, timeout=10)
        
        if response.status_code == 400:
            results.log_pass("Activity restriction after day end")
            return True
        
        results.log_fail("Activity restriction after day end", f"Expected 400, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Activity restriction after day end", f"Error: {str(e)}")
        return False

def test_expense_after_day_end():
    """Test that expenses cannot be created after day ends"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        expense_data = {
            "category": "Travel",
            "amount": 10.00,
            "description": "Should not work"
        }
        
        response = requests.post(f"{API_BASE}/expenses", json=expense_data, headers=headers, timeout=10)
        
        if response.status_code == 400:
            results.log_pass("Expense restriction after day end")
            return True
        
        results.log_fail("Expense restriction after day end", f"Expected 400, got {response.status_code}")
        return False
    except Exception as e:
        results.log_fail("Expense restriction after day end", f"Error: {str(e)}")
        return False

def test_existing_user_login():
    """Test login with existing user credentials"""
    try:
        login_data = {
            "email": "driver@ops360.com",
            "password": "password123"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("user", {}).get("role") == "vendor":
                results.log_pass("Existing user login (vendor/driver)")
                return True
        
        results.log_fail("Existing user login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_fail("Existing user login", f"Error: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("Starting Ops360 Mobile Backend API Tests...")
    print(f"Backend URL: {API_BASE}")
    print("="*60)
    
    # Basic connectivity tests
    if not test_health_check():
        print("❌ Backend is not accessible. Stopping tests.")
        return
    
    test_api_root()
    
    # Authentication flow tests
    test_register_user()
    test_duplicate_registration()
    test_login()
    test_invalid_login()
    test_get_current_user()
    test_unauthorized_access()
    
    # Attendance workflow tests
    test_start_attendance()
    test_duplicate_start_attendance()
    test_get_today_attendance()
    test_get_attendance_history()
    
    # Activity tests (during active day)
    test_create_activity()
    test_get_today_activities()
    
    # Expense tests (during active day)
    test_get_expense_categories()
    test_create_expense()
    test_get_today_expenses()
    test_get_today_expense_total()
    
    # Dashboard test
    test_mobile_dashboard()
    
    # End day and test restrictions
    test_end_attendance()
    test_activity_after_day_end()
    test_expense_after_day_end()
    
    # Test existing user
    test_existing_user_login()
    
    # Print summary
    results.summary()

if __name__ == "__main__":
    run_all_tests()