"""
appointment_repo.py — Firestore operations for the appointments collection.
"""

from app.db.firebase import db
from datetime import datetime, timezone


def create_appointment(data: dict, appointment_id: str):
    data["created_at"] = datetime.now(tz=timezone.utc)
    db.collection("appointments").document(appointment_id).set(data)
    return appointment_id


def get_all_appointments():
    docs = db.collection("appointments").stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        # Convert Firestore timestamps to ISO strings for JSON serialization
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        result.append(d)
    return result


def get_appointments_by_doctor(doctor_id: str):
    """Return all appointments assigned to a specific doctor."""
    docs = (
        db.collection("appointments")
        .where("assigned_doctor_id", "==", doctor_id)
        .stream()
    )
    result = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        result.append(d)
    return result


def get_scheduled_appointments_for_doctor_today(doctor_id: str):
    """
    Return non-emergency, status='scheduled' appointments for a doctor
    created today (UTC).
    """
    today_start = datetime.now(tz=timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    docs = (
        db.collection("appointments")
        .where("assigned_doctor_id", "==", doctor_id)
        .where("status", "==", "scheduled")
        .stream()
    )
    result = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        # Only include non-emergency appointments created today
        if d.get("emergency") == 1:
            continue
        created = d.get("created_at")
        if created and hasattr(created, "timestamp"):
            if created.timestamp() >= today_start.timestamp():
                if hasattr(created, "isoformat"):
                    d["created_at"] = created.isoformat()
                result.append(d)
        else:
            # If created_at is already a string or missing, include it anyway
            result.append(d)
    return result


def reschedule_appointment(appointment_id: str, reason: str):
    """Mark an appointment as rescheduled with the given reason."""
    db.collection("appointments").document(appointment_id).update({
        "status": "rescheduled",
        "rescheduled_reason": reason,
    })