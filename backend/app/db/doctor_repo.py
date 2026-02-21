"""
doctor_repo.py — Firestore operations for doctors & doctor_credentials collections.
"""

from app.db.firebase import db


# ---------------------------------------------------------------------------
# doctors collection
# ---------------------------------------------------------------------------

def get_all_doctors():
    docs = db.collection("doctors").stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]


def get_doctor_by_id(doctor_id: str):
    """Fetch a single doctor by document ID."""
    doc = db.collection("doctors").document(doctor_id).get()
    if doc.exists:
        return {**doc.to_dict(), "id": doc.id}
    return None


def update_doctor_appointments(doctor_id, new_count):
    db.collection("doctors").document(doctor_id).update({
        "current_appointments": new_count
    })


def get_doctors_by_department(department):
    docs = (
        db.collection("doctors")
        .where("department", "==", department)
        .where("is_available", "==", True)
        .stream()
    )
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]


def create_doctor(data: dict) -> str:
    """Create a new doctor document. Returns the auto-generated document ID."""
    doc_ref = db.collection("doctors").document()
    doc_ref.set(data)
    return doc_ref.id


# ---------------------------------------------------------------------------
# doctor_credentials collection
# ---------------------------------------------------------------------------

def create_doctor_credentials(doctor_id: str, email: str, password_hash: str):
    """Create login credentials for a doctor."""
    doc_ref = db.collection("doctor_credentials").document()
    doc_ref.set({
        "doctor_id": doctor_id,
        "email": email,
        "password_hash": password_hash,
    })
    return doc_ref.id


def get_doctor_credentials_by_email(email: str):
    """Look up doctor credentials by email. Returns dict with 'id' or None."""
    docs = (
        db.collection("doctor_credentials")
        .where("email", "==", email)
        .limit(1)
        .stream()
    )
    for doc in docs:
        return {**doc.to_dict(), "id": doc.id}
    return None


def update_doctor_password(email: str, new_hash: str):
    """Update password_hash for a doctor looked up by email."""
    creds = get_doctor_credentials_by_email(email)
    if creds:
        db.collection("doctor_credentials").document(creds["id"]).update({
            "password_hash": new_hash,
        })
        return True
    return False