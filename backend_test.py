#!/usr/bin/env python3

import requests
import sys
from datetime import datetime
import json

class AstroOSAPITester:
    def __init__(self, base_url="https://api-integration-hub-10.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.profile_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                if 'application/x-www-form-urlencoded' in test_headers.get('Content-Type', ''):
                    response = requests.post(url, data=data, headers=test_headers, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_demo_setup(self):
        """Test demo setup"""
        return self.run_test("Demo Setup", "POST", "api/demo/setup", 200)

    def test_login(self, email, password):
        """Test login and get token"""
        form_data = {
            'username': email,
            'password': password
        }
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        
        success, response = self.run_test(
            "Login",
            "POST",
            "api/auth/login",
            200,
            data=form_data,
            headers=headers
        )
        
        if success and isinstance(response, dict) and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   Token acquired for user ID: {self.user_id}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "api/auth/me", 200)

    def test_list_profiles(self):
        """Test list profiles"""
        success, response = self.run_test("List Profiles", "GET", "api/profiles", 200)
        if success and isinstance(response, list) and len(response) > 0:
            self.profile_id = response[0]['id']
            print(f"   Found profile ID: {self.profile_id}")
        return success, response

    def test_get_chart_bundle(self):
        """Test chart bundle endpoint"""
        if not self.profile_id:
            print("❌ No profile ID available for chart test")
            return False
        return self.run_test("Chart Bundle", "GET", f"api/charts/{self.profile_id}/bundle", 200)

    def test_get_dashas(self):
        """Test dashas endpoint"""
        if not self.profile_id:
            print("❌ No profile ID available for dashas test")
            return False
        return self.run_test("Dashas", "GET", f"api/dashas/{self.profile_id}", 200)

    def test_get_yogas(self):
        """Test yogas endpoint"""
        if not self.profile_id:
            print("❌ No profile ID available for yogas test")
            return False
        return self.run_test("Yogas", "GET", f"api/yogas/{self.profile_id}", 200)

    def test_chat_message(self):
        """Test chat endpoint"""
        if not self.profile_id:
            print("❌ No profile ID available for chat test")
            return False
        
        chat_data = {
            "profile_id": self.profile_id,
            "message": "What is my sun sign?",
            "history": []
        }
        return self.run_test("Chat Message", "POST", "api/chat/messages", 200, data=chat_data)

    def test_knowledge_search(self):
        """Test knowledge base search"""
        return self.run_test("Knowledge Search", "GET", "api/kb/search?q=vedic%20astrology&limit=5", 200)

def main():
    print("🚀 Starting AstroOS API Testing...")
    print("=" * 50)
    
    tester = AstroOSAPITester()
    
    # Test 1: Health Check
    if not tester.test_health_check()[0]:
        print("❌ Health check failed - API may be down")
        return 1

    # Test 2: Demo Setup
    if not tester.test_demo_setup()[0]:
        print("❌ Demo setup failed")
        return 1

    # Test 3: Login with demo credentials
    if not tester.test_login("demo@astroos.com", "demo123"):
        print("❌ Demo login failed")
        return 1

    # Test 4: Get current user
    if not tester.test_get_me()[0]:
        print("❌ Get current user failed")
        return 1

    # Test 5: List profiles
    if not tester.test_list_profiles()[0]:
        print("❌ List profiles failed")
        return 1

    # Test 6: Chart Bundle
    chart_success, _ = tester.test_get_chart_bundle()
    if not chart_success:
        print("⚠️  Chart bundle test failed")

    # Test 7: Dashas
    dasha_success, _ = tester.test_get_dashas()
    if not dasha_success:
        print("⚠️  Dashas test failed")

    # Test 8: Yogas
    yoga_success, _ = tester.test_get_yogas()
    if not yoga_success:
        print("⚠️  Yogas test failed")

    # Test 9: Chat
    chat_success, _ = tester.test_chat_message()
    if not chat_success:
        print("⚠️  Chat test failed")

    # Test 10: Knowledge Search
    kb_success, _ = tester.test_knowledge_search()
    if not kb_success:
        print("⚠️  Knowledge search test failed")

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed >= 5:  # Core functionality working
        print("✅ Core API functionality is working")
        return 0
    else:
        print("❌ Critical API issues detected")
        return 1

if __name__ == "__main__":
    sys.exit(main())