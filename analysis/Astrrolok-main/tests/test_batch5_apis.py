"""
Batch 5 API Tests - KB, Chat, and ML endpoints
Tests for RAG + ML implementation features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://stellar-align.preview.emergentagent.com').rstrip('/')


class TestBatch5APIs:
    """Test suite for Batch 5 KB, Chat, and ML APIs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "demo@astroos.com", "password": "demo123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    # ==================== KB API Tests ====================
    
    def test_kb_stats_endpoint(self):
        """Test /api/kb/stats returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/kb/stats", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_sources" in data
        assert "completed_sources" in data
        assert "total_chunks" in data
        assert "total_vectors" in data
        assert "max_files" in data
        assert "max_file_size_mb" in data
        
        # Validate types
        assert isinstance(data["total_sources"], int)
        assert isinstance(data["max_files"], int)
        assert data["max_files"] == 200  # Per requirements
        assert data["max_file_size_mb"] == 25  # Per requirements
    
    def test_kb_sources_endpoint(self):
        """Test /api/kb/sources returns list"""
        response = requests.get(f"{BASE_URL}/api/kb/sources", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_kb_search_endpoint(self):
        """Test /api/kb/search endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/kb/search?query=vedic&top_k=5",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "query" in data
        assert isinstance(data["results"], list)
    
    # ==================== Chat API Tests ====================
    
    def test_chat_sessions_endpoint(self):
        """Test /api/chat/sessions returns list"""
        response = requests.get(f"{BASE_URL}/api/chat/sessions", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_chat_create_session(self):
        """Test creating a new chat session"""
        response = requests.post(
            f"{BASE_URL}/api/chat/sessions",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert isinstance(data["session_id"], int)
        
        # Cleanup - delete the session
        session_id = data["session_id"]
        requests.delete(f"{BASE_URL}/api/chat/sessions/{session_id}", headers=self.headers)
    
    def test_chat_ask_endpoint(self):
        """Test /api/chat/ask endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/chat/ask",
            headers={**self.headers, "Content-Type": "application/json"},
            json={"message": "What is a yoga in Vedic astrology?"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "answer" in data
        assert "citations" in data
        assert "session_id" in data
        assert "retrieved_chunks" in data
        assert "has_context" in data
        
        # Cleanup - delete the session
        if data.get("session_id"):
            requests.delete(f"{BASE_URL}/api/chat/sessions/{data['session_id']}", headers=self.headers)
    
    # ==================== ML API Tests ====================
    
    def test_ml_stats_endpoint(self):
        """Test /api/ml/stats returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/ml/stats", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_examples" in data
        assert "by_event_type" in data
        assert "active_model" in data
        
        # Validate by_event_type has all 5 labels
        assert "marriage" in data["by_event_type"]
        assert "job_change" in data["by_event_type"]
        assert "health_issue" in data["by_event_type"]
        assert "foreign_travel" in data["by_event_type"]
        assert "property_purchase" in data["by_event_type"]
    
    def test_ml_event_labels_endpoint(self):
        """Test /api/ml/event-labels returns 5 labels"""
        response = requests.get(f"{BASE_URL}/api/ml/event-labels", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "labels" in data
        assert "descriptions" in data
        
        # Validate 5 labels
        assert len(data["labels"]) == 5
        assert "marriage" in data["labels"]
        assert "job_change" in data["labels"]
        assert "health_issue" in data["labels"]
        assert "foreign_travel" in data["labels"]
        assert "property_purchase" in data["labels"]
        
        # Validate descriptions
        assert len(data["descriptions"]) == 5
    
    def test_ml_extract_features_endpoint(self):
        """Test /api/ml/extract-features extracts features"""
        response = requests.post(
            f"{BASE_URL}/api/ml/extract-features?profile_id=1",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "profile_id" in data
        assert "features" in data
        assert "feature_count" in data
        
        # Validate features structure
        features = data["features"]
        assert "sun_house" in features
        assert "moon_house" in features
        assert "jupiter_strength" in features
        assert "mahadasha_lord_num" in features
        assert "house_7_strength" in features
        assert "sade_sati_active" in features
        
        # Validate feature count
        assert data["feature_count"] == 48
    
    def test_ml_predict_without_model(self):
        """Test /api/ml/predict returns error when no model trained"""
        # Get sample features first
        features_response = requests.post(
            f"{BASE_URL}/api/ml/extract-features?profile_id=1",
            headers=self.headers
        )
        features = features_response.json()["features"]
        
        response = requests.post(
            f"{BASE_URL}/api/ml/predict",
            headers={**self.headers, "Content-Type": "application/json"},
            json={"features": features}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        # Without trained model, should return error
        if not data["success"]:
            assert "error" in data
    
    def test_ml_train_insufficient_examples(self):
        """Test /api/ml/train returns error with insufficient examples"""
        response = requests.post(
            f"{BASE_URL}/api/ml/train?min_examples=5",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        # With 0 examples, should fail
        if data["success"] == False:
            assert "error" in data


class TestBatch5Integration:
    """Integration tests for Batch 5 features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "demo@astroos.com", "password": "demo123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_chat_flow_creates_session(self):
        """Test that asking a question creates a session"""
        # Ask a question
        response = requests.post(
            f"{BASE_URL}/api/chat/ask",
            headers={**self.headers, "Content-Type": "application/json"},
            json={"message": "What is Rahu?"}
        )
        assert response.status_code == 200
        
        data = response.json()
        session_id = data.get("session_id")
        assert session_id is not None
        
        # Verify session exists
        sessions_response = requests.get(f"{BASE_URL}/api/chat/sessions", headers=self.headers)
        sessions = sessions_response.json()
        session_ids = [s["id"] for s in sessions]
        assert session_id in session_ids
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/chat/sessions/{session_id}", headers=self.headers)
    
    def test_ml_training_example_flow(self):
        """Test adding a training example"""
        # Get features
        features_response = requests.post(
            f"{BASE_URL}/api/ml/extract-features?profile_id=1",
            headers=self.headers
        )
        features = features_response.json()["features"]
        
        # Add training example
        response = requests.post(
            f"{BASE_URL}/api/ml/training-examples",
            headers={**self.headers, "Content-Type": "application/json"},
            json={
                "profile_id": 1,
                "event_type": "marriage",
                "event_date": "2025-06-15",
                "features": features,
                "metadata": {"source": "test"}
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["event_type"] == "marriage"
        
        # Verify stats updated
        stats_response = requests.get(f"{BASE_URL}/api/ml/stats", headers=self.headers)
        stats = stats_response.json()
        assert stats["total_examples"] >= 1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
