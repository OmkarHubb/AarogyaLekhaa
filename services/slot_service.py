from typing import Optional
from firebase_admin import firestore
from firebase_init import db
from services.doctor_service import get_available_doctors

def allocate_slot(department: str, emergency: int) -> Optional[dict]:
    candidates = get_available_doctors(department)
    if not candidates:
        return None

    candidates.sort(key=lambda x: x["workload_ratio"])
    selected = candidates[0]
    doctor_id = selected["id"]
    doctor_data = selected["data"]

    transaction = db.transaction()

    @firestore.transactional
    def update_doctor(transaction):
        ref = db.collection("doctors").document(doctor_id)
        snapshot = ref.get(transaction=transaction)
        current = snapshot.get("current_appointments")
        capacity = snapshot.get("daily_capacity")
        if current >= capacity:
            raise Exception("Doctor capacity exceeded")
        transaction.update(ref, {"current_appointments": current + 1})

    update_doctor(transaction)

    predicted_wait = (doctor_data["current_appointments"] * doctor_data["avg_consultation_time"])
    workload_percent = round((doctor_data["current_appointments"] / doctor_data["daily_capacity"]) * 100, 2)

    return {
        "assigned_doctor_id": doctor_id,
        "assigned_doctor_name": doctor_data["name"],
        "department": doctor_data["department"],
        "predicted_wait_minutes": predicted_wait,
        "workload_percent": workload_percent,
    }