import pytest
from unittest.mock import patch

@pytest.fixture
def mock_sb():
    with patch('apps.work.services.get_supabase') as m:
        yield m.return_value

def test_create_job_post_success(mock_sb):
    mock_sb.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "j1", "status": "open", "title": "Need workers"}
    ]
    from apps.work.services import create_job_post
    r = create_job_post({
        "farmer_id": "f1", "farmer_name": "Raju", "farmer_phone": "9999999999",
        "farmer_district": "Warangal", "title": "Need 10 harvesters",
        "service_type": "worker", "scheduled_date": "2026-04-01", "duration": "full_day"
    })
    assert r["status"] == "open"

def test_create_job_post_missing_field(mock_sb):
    from apps.work.services import create_job_post
    with pytest.raises(ValueError, match="farmer_name is required"):
        create_job_post({"farmer_id": "f1"})

def test_rating_invalid(mock_sb):
    from apps.work.services import submit_rating
    with pytest.raises(ValueError, match="Rating must be 1-5"):
        submit_rating("j1", "f1", "s1", 6)

def test_get_supplier_profile_none(mock_sb):
    mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    from apps.work.services import get_supplier_profile
    result = get_supplier_profile("unknown-user")
    assert result is None


def test_update_job_post_status_success(mock_sb):
    mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "farmer_id": "f1",
    }
    mock_sb.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value.data = [
        {"id": "j1", "status": "closed"}
    ]
    from apps.work.services import update_job_post_status
    row = update_job_post_status("j1", "f1", "closed")
    assert row["status"] == "closed"


def test_update_job_post_status_permission(mock_sb):
    mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "farmer_id": "other",
    }
    from apps.work.services import update_job_post_status
    with pytest.raises(PermissionError):
        update_job_post_status("j1", "f1", "open")
