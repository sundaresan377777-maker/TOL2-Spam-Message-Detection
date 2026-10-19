"""
Automated Backend API Tests using pytest and FastAPI TestClient.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.database.connection import Base, get_db
from sqlalchemy.pool import StaticPool

# Use in-memory SQLite database with StaticPool for testing
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data
    assert data["model_loaded"] is True
    assert data["database_connected"] is True


def test_predict_spam_message():
    payload = {"message": "WINNER!! You have won a £1,000 cash prize! Text CLAIM to 81010 to receive reward now."}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SPAM"
    assert data["confidence"] >= 0.5
    assert data["spam_probability"] > data["ham_probability"]
    assert "explanation" in data
    assert data["id"] is not None


def test_predict_ham_message():
    payload = {"message": "Hey Sarah, are we still meeting tomorrow for coffee at 10 AM?"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "HAM"
    assert data["confidence"] >= 0.5
    assert data["ham_probability"] > data["spam_probability"]
    assert data["id"] is not None


def test_predict_empty_message_rejected():
    payload = {"message": ""}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


def test_predict_whitespace_message_rejected():
    payload = {"message": "     \n\t   "}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


def test_predict_oversized_message_rejected():
    payload = {"message": "A" * 5001}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


def test_history_flow():
    # 1. Fetch history
    response = client.get("/api/history?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total_count" in data
    assert data["total_count"] >= 2  # from earlier tests

    # 2. Get first record details
    first_id = data["items"][0]["id"]
    detail_res = client.get(f"/api/history/{first_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == first_id
    assert "message_text" in detail

    # 3. Filter by label
    filter_res = client.get("/api/history?label=SPAM")
    assert filter_res.status_code == 200
    for item in filter_res.json()["items"]:
        assert item["predicted_label"] == "SPAM"

    # 4. Delete individual record
    del_res = client.delete(f"/api/history/{first_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Confirm deletion
    not_found = client.get(f"/api/history/{first_id}")
    assert not_found.status_code == 404


def test_statistics_endpoint():
    response = client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyzed" in data
    assert "spam_count" in data
    assert "ham_count" in data
    assert "recent_activity" in data
    assert isinstance(data["recent_activity"], list)


def test_model_metrics_endpoint():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "Multinomial Naive Bayes"
    assert "evaluation_metrics" in data
    assert data["evaluation_metrics"]["accuracy"] > 0.90
    assert data["evaluation_metrics"]["precision"] > 0.85
    assert "confusion_matrix" in data
    assert data["confusion_matrix"]["true_positive"] > 0


def test_model_info_endpoint():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["is_trained"] is True
    assert data["algorithm"] == "Multinomial Naive Bayes"
    assert data["vocabulary_size"] > 0
