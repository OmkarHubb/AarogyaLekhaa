from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from datetime import datetime, timezone

from firebase_init import db
from services.severity_service import calculate_severity
from services.triage_service import compute_emergency
from services.slot_service import allocate_slot
from services.resource_service import update_bed_occupancy
from services.stress_service import calculate_stress_index
from services.recommendation_service import generate_recommendations
from services.dashboard_service import get_admin_dashboard, get_doctor_dashboard

app = FastAPI(title="AarogyaLekhaa Backend")

class PatientRequest(BaseModel):
    patient_name: str
    age: int = Field(..., gt=0)
    symptoms: str
    department: str

@app.post("/appointments")
def create_appointment(request: PatientRequest):
    severity_score = calculate_severity(request.age, request.symptoms)
    emergency = compute_emergency(severity_score)
    slot = allocate_slot(request.department, emergency)

    if not slot:
        return JSONResponse(status_code=200, content={"status": "rejected", "reason": "No available doctor"})

    now_iso = datetime.now(timezone.utc).isoformat()

    appointment = {
        "patient_name": request.patient_name,
        "age": request.age,
        "symptoms": request.symptoms,
        "severity_score": severity_score,
        "emergency": emergency,
        **slot,
        "status": "Scheduled",
        "created_at": now_iso,
    }

    db.collection("appointments").add(appointment)
    update_bed_occupancy(emergency)
    calculate_stress_index()
    generate_recommendations()

    return appointment

@app.get("/admin-dashboard")
def admin_dashboard():
    return get_admin_dashboard()

@app.get("/doctor-dashboard/{doctor_id}")
def doctor_dashboard(doctor_id: str):
    return get_doctor_dashboard(doctor_id)