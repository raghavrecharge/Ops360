"""
Driver CRUD API Tests
Tests all driver endpoints: Create, Read, Update, Delete
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ops-dashboard-51.preview.emergentagent.com')

class TestDriverCRUD:
    """Driver CRUD endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "admin@fleetops.com", "password": "password123"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        self.created_driver_id = None
        yield
        
        # Cleanup: Delete test driver if created
        if self.created_driver_id:
            try:
                self.session.delete(f"{BASE_URL}/api/v1/drivers/{self.created_driver_id}")
            except:
                pass
    
    def test_01_create_driver(self):
        """Test POST /api/v1/drivers - Create new driver"""
        driver_data = {
            "name": "TEST_Driver Create",
            "phone": "1234567890",
            "email": "test_create@example.com",
            "license_number": "DL-TEST-001",
            "license_validity": "2027-12-31",
            "address": "123 Test Street, Test City",
            "emergency_contact": "Emergency Contact",
            "emergency_phone": "0987654321"
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/drivers", json=driver_data)
        
        assert response.status_code == 201, f"Create failed: {response.text}"
        
        data = response.json()
        assert data["name"] == driver_data["name"]
        assert data["phone"] == driver_data["phone"]
        assert data["email"] == driver_data["email"]
        assert data["license_number"] == driver_data["license_number"]
        assert data["address"] == driver_data["address"]
        assert data["emergency_contact"] == driver_data["emergency_contact"]
        assert data["emergency_phone"] == driver_data["emergency_phone"]
        assert "id" in data
        assert data["is_active"] == True
        
        self.created_driver_id = data["id"]
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/v1/drivers/{data['id']}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == driver_data["name"]
    
    def test_02_get_all_drivers(self):
        """Test GET /api/v1/drivers - List all drivers"""
        response = self.session.get(f"{BASE_URL}/api/v1/drivers")
        
        assert response.status_code == 200, f"Get all failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # Verify response structure if drivers exist
        if len(data) > 0:
            driver = data[0]
            assert "id" in driver
            assert "name" in driver
            assert "is_active" in driver
            assert "created_at" in driver
    
    def test_03_get_single_driver(self):
        """Test GET /api/v1/drivers/{id} - Get single driver"""
        # First create a driver
        create_response = self.session.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"name": "TEST_Single Driver", "phone": "1111111111"}
        )
        assert create_response.status_code == 201
        driver_id = create_response.json()["id"]
        self.created_driver_id = driver_id
        
        # Get the driver
        response = self.session.get(f"{BASE_URL}/api/v1/drivers/{driver_id}")
        
        assert response.status_code == 200, f"Get single failed: {response.text}"
        
        data = response.json()
        assert data["id"] == driver_id
        assert data["name"] == "TEST_Single Driver"
        assert "updated_at" in data  # DetailResponse includes updated_at
    
    def test_04_get_nonexistent_driver(self):
        """Test GET /api/v1/drivers/{id} - 404 for nonexistent driver"""
        response = self.session.get(f"{BASE_URL}/api/v1/drivers/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_05_update_driver(self):
        """Test PUT /api/v1/drivers/{id} - Update driver"""
        # First create a driver
        create_response = self.session.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"name": "TEST_Update Driver", "phone": "2222222222"}
        )
        assert create_response.status_code == 201
        driver_id = create_response.json()["id"]
        self.created_driver_id = driver_id
        
        # Update the driver
        update_data = {
            "name": "TEST_Updated Name",
            "phone": "3333333333",
            "email": "updated@example.com",
            "address": "Updated Address"
        }
        
        response = self.session.put(f"{BASE_URL}/api/v1/drivers/{driver_id}", json=update_data)
        
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["phone"] == update_data["phone"]
        assert data["email"] == update_data["email"]
        assert data["address"] == update_data["address"]
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/v1/drivers/{driver_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == update_data["name"]
    
    def test_06_update_nonexistent_driver(self):
        """Test PUT /api/v1/drivers/{id} - 404 for nonexistent driver"""
        response = self.session.put(
            f"{BASE_URL}/api/v1/drivers/99999",
            json={"name": "Test"}
        )
        
        assert response.status_code == 404
    
    def test_07_update_empty_data(self):
        """Test PUT /api/v1/drivers/{id} - 400 for empty update data"""
        # First create a driver
        create_response = self.session.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"name": "TEST_Empty Update", "phone": "4444444444"}
        )
        assert create_response.status_code == 201
        driver_id = create_response.json()["id"]
        self.created_driver_id = driver_id
        
        # Try to update with empty data
        response = self.session.put(f"{BASE_URL}/api/v1/drivers/{driver_id}", json={})
        
        assert response.status_code == 400
        assert "no data" in response.json()["detail"].lower()
    
    def test_08_delete_driver(self):
        """Test DELETE /api/v1/drivers/{id} - Soft delete driver"""
        # First create a driver
        create_response = self.session.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"name": "TEST_Delete Driver", "phone": "5555555555"}
        )
        assert create_response.status_code == 201
        driver_id = create_response.json()["id"]
        
        # Delete the driver
        response = self.session.delete(f"{BASE_URL}/api/v1/drivers/{driver_id}")
        
        assert response.status_code == 204, f"Delete failed: {response.text}"
        
        # Verify driver is not in active list
        list_response = self.session.get(f"{BASE_URL}/api/v1/drivers")
        assert list_response.status_code == 200
        drivers = list_response.json()
        driver_ids = [d["id"] for d in drivers]
        assert driver_id not in driver_ids, "Deleted driver should not appear in active list"
    
    def test_09_delete_nonexistent_driver(self):
        """Test DELETE /api/v1/drivers/{id} - 404 for nonexistent driver"""
        response = self.session.delete(f"{BASE_URL}/api/v1/drivers/99999")
        
        assert response.status_code == 404
    
    def test_10_create_driver_with_vendor(self):
        """Test POST /api/v1/drivers - Create driver with vendor_id"""
        # First get vendors
        vendors_response = self.session.get(f"{BASE_URL}/api/v1/vendors")
        if vendors_response.status_code == 200 and len(vendors_response.json()) > 0:
            vendor_id = vendors_response.json()[0]["id"]
            
            driver_data = {
                "name": "TEST_Driver With Vendor",
                "phone": "6666666666",
                "vendor_id": vendor_id
            }
            
            response = self.session.post(f"{BASE_URL}/api/v1/drivers", json=driver_data)
            
            assert response.status_code == 201
            data = response.json()
            assert data["vendor_id"] == vendor_id
            
            self.created_driver_id = data["id"]
        else:
            pytest.skip("No vendors available for testing")
    
    def test_11_filter_drivers_by_vendor(self):
        """Test GET /api/v1/drivers?vendor_id={id} - Filter by vendor"""
        # Get vendors first
        vendors_response = self.session.get(f"{BASE_URL}/api/v1/vendors")
        if vendors_response.status_code == 200 and len(vendors_response.json()) > 0:
            vendor_id = vendors_response.json()[0]["id"]
            
            response = self.session.get(f"{BASE_URL}/api/v1/drivers?vendor_id={vendor_id}")
            
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            # All returned drivers should have the specified vendor_id
            for driver in data:
                assert driver["vendor_id"] == vendor_id
        else:
            pytest.skip("No vendors available for testing")
    
    def test_12_create_driver_validation(self):
        """Test POST /api/v1/drivers - Validation for required fields"""
        # Missing name should fail
        response = self.session.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"phone": "7777777777"}
        )
        
        assert response.status_code == 422, "Should fail validation without name"


class TestDriverLicenseExpiry:
    """Tests for license expiry functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "admin@fleetops.com", "password": "password123"}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        self.created_driver_ids = []
        yield
        
        # Cleanup
        for driver_id in self.created_driver_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/v1/drivers/{driver_id}")
            except:
                pass
    
    def test_create_driver_with_expired_license(self):
        """Test creating driver with expired license date"""
        driver_data = {
            "name": "TEST_Expired License",
            "license_number": "DL-EXPIRED",
            "license_validity": "2020-01-01"  # Past date
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/drivers", json=driver_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["license_validity"] == "2020-01-01"
        
        self.created_driver_ids.append(data["id"])
    
    def test_create_driver_with_expiring_soon_license(self):
        """Test creating driver with license expiring within 30 days"""
        from datetime import datetime, timedelta
        expiry_date = (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")
        
        driver_data = {
            "name": "TEST_Expiring Soon",
            "license_number": "DL-EXPIRING",
            "license_validity": expiry_date
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/drivers", json=driver_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["license_validity"] == expiry_date
        
        self.created_driver_ids.append(data["id"])


class TestAuthRequired:
    """Tests for authentication requirements"""
    
    def test_get_drivers_without_auth(self):
        """Test GET /api/v1/drivers without authentication"""
        response = requests.get(f"{BASE_URL}/api/v1/drivers")
        
        assert response.status_code == 401
    
    def test_create_driver_without_auth(self):
        """Test POST /api/v1/drivers without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/v1/drivers",
            json={"name": "Test"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401
    
    def test_update_driver_without_auth(self):
        """Test PUT /api/v1/drivers/{id} without authentication"""
        response = requests.put(
            f"{BASE_URL}/api/v1/drivers/1",
            json={"name": "Test"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401
    
    def test_delete_driver_without_auth(self):
        """Test DELETE /api/v1/drivers/{id} without authentication"""
        response = requests.delete(f"{BASE_URL}/api/v1/drivers/1")
        
        assert response.status_code == 401
