from firebase_init import db
from services.doctor_service import compute_all_doctor_workloads
from services.resource_service import get_resource_status

def get_admin_dashboard():
    doctors = compute_all_doctor_workloads()
    resources = get_resource_status()
    metrics = db.collection("hospital_metrics").document("live_metrics").get().to_dict() or {}
    recommendations = db.collection("recommendations").document("current_recommendations").get().to_dict() or {}
    return {
        "doctor_workloads": doctors,
        "resources": resources,
        "metrics": metrics,
        "recommendations": recommendations,
    }


def get_doctor_dashboard(doctor_id: str):
    doctor = db.collection("doctors").document(doctor_id).get().to_dict() or {}
    appointments = db.collection("appointments") \
        .where("assigned_doctor_id", "==", doctor_id).stream()
    return {
        "doctor": doctor,
        "appointments": [a.to_dict() for a in appointments]
    }