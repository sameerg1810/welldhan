"""WELLDHAN API Backend Tests - All 4 role flows"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')

# ─── Test Credentials ────────────────────────────────────────────────────────
USER_PHONE = "9876543210"
TRAINER_PHONE = "9100000001"
MANAGER_PHONE = "9000000002"
ADMIN_PHONE = "9000000001"

@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

def get_token(session, phone):
    """Helper: send OTP and verify to get token"""
    r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": phone})
    assert r.status_code == 200, f"send-otp failed: {r.text}"
    data = r.json()
    otp = data.get("otp_dev")
    assert otp, "Dev OTP not returned"
    r2 = session.post(f"{BASE_URL}/api/auth/verify-otp", json={"phone": phone, "otp": otp})
    assert r2.status_code == 200, f"verify-otp failed: {r2.text}"
    return r2.json()["token"], r2.json()["role"]

# ─── Health / Seed ───────────────────────────────────────────────────────────

class TestSeedAndHealth:
    def test_seed_endpoint(self, session):
        r = session.post(f"{BASE_URL}/api/seed")
        assert r.status_code == 200
        data = r.json()
        assert "seeded" in data or "message" in data
        print(f"Seed: {data['message']}")

# ─── Auth Tests ──────────────────────────────────────────────────────────────

class TestAuth:
    def test_send_otp_user(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": USER_PHONE})
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "otp_dev" in data
        assert data["user_type"] == "User"
        print(f"User OTP: {data['otp_dev']}, email: {data['masked_email']}")

    def test_send_otp_trainer(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": TRAINER_PHONE})
        assert r.status_code == 200
        data = r.json()
        assert data["user_type"] == "Trainer"

    def test_send_otp_manager(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": MANAGER_PHONE})
        assert r.status_code == 200
        data = r.json()
        assert data["user_type"] == "Manager"

    def test_send_otp_admin(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": ADMIN_PHONE})
        assert r.status_code == 200
        data = r.json()
        assert data["user_type"] == "Admin"

    def test_verify_otp_user(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": USER_PHONE})
        otp = r.json()["otp_dev"]
        r2 = session.post(f"{BASE_URL}/api/auth/verify-otp", json={"phone": USER_PHONE, "otp": otp})
        assert r2.status_code == 200
        data = r2.json()
        assert "token" in data
        assert data["role"] == "User"
        print(f"User token obtained, role={data['role']}")

    def test_invalid_otp(self, session):
        session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": USER_PHONE})
        r = session.post(f"{BASE_URL}/api/auth/verify-otp", json={"phone": USER_PHONE, "otp": "000000"})
        assert r.status_code == 400

    def test_unknown_phone(self, session):
        r = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": "9999999999"})
        assert r.status_code == 404

# ─── User Role Tests ─────────────────────────────────────────────────────────

class TestUserRole:
    @pytest.fixture(scope="class")
    def user_headers(self, session):
        token, _ = get_token(session, USER_PHONE)
        return {"Authorization": f"Bearer {token}"}

    def test_get_me_user(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=user_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["primary_name"] == "Ravi Shankar"
        assert data["primary_phone"] == USER_PHONE

    def test_get_slots_all(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/slots", headers=user_headers)
        assert r.status_code == 200
        slots = r.json()
        assert len(slots) > 0
        assert "trainer" in slots[0]
        assert "spots_left" in slots[0]
        print(f"Total available slots: {len(slots)}")

    def test_get_slots_by_sport(self, session, user_headers):
        for sport in ["Badminton", "Yoga", "Karate", "Swimming"]:
            r = session.get(f"{BASE_URL}/api/slots?sport={sport}", headers=user_headers)
            assert r.status_code == 200
            slots = r.json()
            if slots:
                assert all(s["sport"] == sport for s in slots)

    def test_get_members(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/members", headers=user_headers)
        assert r.status_code == 200
        members = r.json()
        assert len(members) >= 1
        print(f"Family members: {[m['member_name'] for m in members]}")

    def test_get_bookings(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/bookings", headers=user_headers)
        assert r.status_code == 200
        bookings = r.json()
        print(f"User bookings count: {len(bookings)}")

    def test_get_payments(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/payments", headers=user_headers)
        assert r.status_code == 200
        payments = r.json()
        assert len(payments) > 0
        assert "amount_due" in payments[0]

    def test_get_streak(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/streak", headers=user_headers)
        assert r.status_code == 200
        data = r.json()
        assert "streak" in data

    def test_get_food_prefs(self, session, user_headers):
        r = session.get(f"{BASE_URL}/api/food/preferences", headers=user_headers)
        assert r.status_code == 200
        prefs = r.json()
        print(f"Food preferences: {len(prefs)}")

    def test_create_booking(self, session, user_headers):
        # Get slots and members first
        slots_r = session.get(f"{BASE_URL}/api/slots", headers=user_headers)
        slots = slots_r.json()
        available = [s for s in slots if s["spots_left"] > 0]
        assert available, "No available slots"

        members_r = session.get(f"{BASE_URL}/api/members", headers=user_headers)
        members = members_r.json()
        assert members

        import datetime
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

        r = session.post(f"{BASE_URL}/api/bookings", headers=user_headers, json={
            "slot_id": available[0]["id"],
            "member_ids": [members[0]["id"]],
            "session_date": tomorrow
        })
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert len(data["booking_ids"]) == 1
        print(f"Booking created: {data['booking_ids']}")
        return data["booking_ids"][0]

# ─── Trainer Role Tests ───────────────────────────────────────────────────────

class TestTrainerRole:
    @pytest.fixture(scope="class")
    def trainer_headers(self, session):
        token, _ = get_token(session, TRAINER_PHONE)
        return {"Authorization": f"Bearer {token}"}

    def test_get_me_trainer(self, session, trainer_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=trainer_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "Suresh Babu"
        assert data["sport"] == "Badminton"

    def test_trainer_profile(self, session, trainer_headers):
        r = session.get(f"{BASE_URL}/api/trainer/profile", headers=trainer_headers)
        assert r.status_code == 200

    def test_trainer_slots(self, session, trainer_headers):
        r = session.get(f"{BASE_URL}/api/trainer/slots", headers=trainer_headers)
        assert r.status_code == 200
        slots = r.json()
        print(f"Trainer slots: {len(slots)}")

    def test_trainer_students(self, session, trainer_headers):
        r = session.get(f"{BASE_URL}/api/trainer/students", headers=trainer_headers)
        assert r.status_code == 200
        students = r.json()
        print(f"Trainer students: {len(students)}")

    def test_trainer_today_bookings(self, session, trainer_headers):
        r = session.get(f"{BASE_URL}/api/trainer/today-bookings", headers=trainer_headers)
        assert r.status_code == 200

# ─── Manager Role Tests ───────────────────────────────────────────────────────

class TestManagerRole:
    @pytest.fixture(scope="class")
    def manager_headers(self, session):
        token, _ = get_token(session, MANAGER_PHONE)
        return {"Authorization": f"Bearer {token}"}

    def test_get_me_manager(self, session, manager_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=manager_headers)
        assert r.status_code == 200
        data = r.json()
        assert "manager_name" in data or "name" in data

    def test_manager_summary(self, session, manager_headers):
        r = session.get(f"{BASE_URL}/api/manager/summary", headers=manager_headers)
        assert r.status_code == 200
        data = r.json()
        assert "total_families" in data
        assert "pending_payments" in data
        assert "low_stock_items" in data

    def test_manager_households(self, session, manager_headers):
        r = session.get(f"{BASE_URL}/api/manager/households", headers=manager_headers)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0

    def test_manager_pending_payments(self, session, manager_headers):
        r = session.get(f"{BASE_URL}/api/manager/pending-payments", headers=manager_headers)
        assert r.status_code == 200

    def test_manager_inventory(self, session, manager_headers):
        r = session.get(f"{BASE_URL}/api/manager/inventory", headers=manager_headers)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0

# ─── Admin Role Tests ─────────────────────────────────────────────────────────

class TestAdminRole:
    @pytest.fixture(scope="class")
    def admin_headers(self, session):
        token, _ = get_token(session, ADMIN_PHONE)
        return {"Authorization": f"Bearer {token}"}

    def test_get_me_admin(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert "name" in data

    def test_admin_summary(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/admin/summary", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert "communities" in data
        assert "total_families" in data
        assert "total_revenue" in data

    def test_admin_communities(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/admin/communities", headers=admin_headers)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 3

    def test_admin_trainers(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/admin/trainers", headers=admin_headers)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 4

    def test_admin_packages(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/admin/packages", headers=admin_headers)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 8
