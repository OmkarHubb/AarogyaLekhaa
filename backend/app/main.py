"""
main.py — FastAPI entry point for AarogyaLekha Hospital Coordination System.

Run with:
    uvicorn app.main:app --reload
"""

import os
import uuid
import string
import random
import logging
from datetime import datetime, timezone

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.services.resource_service import allocate_bed
from app.services.triage_service import compute_emergency
from app.services.doctor_service import assign_doctor, calculate_workload
from app.services.wait_time_service import calculate_wait_time
from app.services.severity_service import calculate_severity
from app.services.email_service import (
    send_scheduling_email,
    send_rescheduling_email,
    send_password_reset_email,
)

from app.db.appointment_repo import (
    create_appointment,
    get_all_appointments,
    get_appointments_by_doctor,
    get_scheduled_appointments_for_doctor_today,
    reschedule_appointment,
)
from app.db.doctor_repo import (
    get_all_doctors,
    get_doctor_by_id,
    create_doctor,
    create_doctor_credentials,
    get_doctor_credentials_by_email,
    update_doctor_password,
)
from app.db.admin_repo import (
    get_admin_by_username,
    get_admin_by_email,
    update_admin_password,
)

from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import create_token, get_current_user

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App initialisation
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AarogyaLekha — Hospital Coordination System",
    version="3.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Keyword lists for symptom parsing
# ---------------------------------------------------------------------------
SEVERE_KEYWORDS = [
    "chest pain", "breathlessness", "unconscious", "seizure", "stroke",
    "heart attack", "severe bleeding", "paralysis", "trauma", "cardiac arrest",
    "difficulty breathing", "shortness of breath", "fainting", "collapse",
]

MODERATE_KEYWORDS = [
    "fever", "vomiting", "dizziness", "headache", "nausea", "pain",
    "swelling", "cough", "fatigue", "weakness", "infection", "fracture",
    "sprain", "diarrhea", "abdominal pain",
]


def parse_symptoms(symptoms_text: str) -> dict:
    """Convert free-text symptoms into boolean flags for the triage engine."""
    lower = symptoms_text.lower()
    return {
        "severe_symptoms": any(kw in lower for kw in SEVERE_KEYWORDS),
        "moderate_symptoms": any(kw in lower for kw in MODERATE_KEYWORDS),
    }


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _generate_temp_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.SystemRandom().choice(chars) for _ in range(length))


# ---------------------------------------------------------------------------
# Routes — Health check
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "AarogyaLekha Backend Running 🚀"}


# ═══════════════════════════════════════════════════════════════════════════
# AUTH — Admin Login (Feature 11)
# ═══════════════════════════════════════════════════════════════════════════
@app.post("/api/admin/login")
def admin_login(credentials: dict):
    username = credentials.get("username", "").strip()
    password = credentials.get("password", "")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    admin = get_admin_by_username(username)
    if not admin or not verify_password(password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": admin["id"],
        "username": admin["username"],
        "role": "admin",
    })

    return {
        "success": True,
        "token": token,
        "user": {
            "id": admin["id"],
            "username": admin["username"],
            "email": admin.get("email", ""),
            "role": "admin",
        },
    }


# ═══════════════════════════════════════════════════════════════════════════
# AUTH — Doctor Login (Feature 2)
# ═══════════════════════════════════════════════════════════════════════════
@app.post("/api/doctor/login")
def doctor_login(credentials: dict):
    email = credentials.get("email", "").strip()
    password = credentials.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    creds = get_doctor_credentials_by_email(email)
    if not creds or not verify_password(password, creds["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    doctor = get_doctor_by_id(creds["doctor_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    token = create_token({
        "sub": doctor["id"],
        "doctor_id": doctor["id"],
        "role": "doctor",
    })

    return {
        "success": True,
        "token": token,
        "user": {
            "id": doctor["id"],
            "name": doctor.get("name", ""),
            "email": email,
            "department": doctor.get("department", ""),
            "daily_capacity": doctor.get("daily_capacity", 0),
            "current_appointments": doctor.get("current_appointments", 0),
            "is_available": doctor.get("is_available", True),
        },
    }


# ═══════════════════════════════════════════════════════════════════════════
# AUTH — Password Reset (Feature 7)
# ═══════════════════════════════════════════════════════════════════════════
@app.post("/api/auth/reset-password")
def reset_password(body: dict):
    email = body.get("email", "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    temp = _generate_temp_password()
    hashed = hash_password(temp)

    # Try doctor_credentials first
    creds = get_doctor_credentials_by_email(email)
    if creds:
        update_doctor_password(email, hashed)
        send_password_reset_email(email, temp)
        return {"success": True, "message": "Temporary password sent to your email"}

    # Try admin_credentials
    admin = get_admin_by_email(email)
    if admin:
        update_admin_password(admin["id"], hashed)
        send_password_reset_email(email, temp)
        return {"success": True, "message": "Temporary password sent to your email"}

    raise HTTPException(status_code=404, detail="No account found with that email")


# ═══════════════════════════════════════════════════════════════════════════
# ADMIN — Register Doctor (Feature 3)
# ═══════════════════════════════════════════════════════════════════════════
@app.post("/api/admin/register-doctor")
def register_doctor(body: dict, _user: dict = Depends(get_current_user)):
    """Register a new doctor. Admin-only (requires JWT)."""
    required = ["name", "email", "department", "daily_capacity", "password"]
    for field in required:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"'{field}' is required")

    # Check if email already registered
    if get_doctor_credentials_by_email(body["email"]):
        raise HTTPException(status_code=409, detail="A doctor with this email already exists")

    # Create doctor profile
    doctor_data = {
        "name": body["name"],
        "department": body["department"],
        "daily_capacity": int(body["daily_capacity"]),
        "is_available": True,
        "current_appointments": 0,
    }
    doctor_id = create_doctor(doctor_data)

    # Create credentials
    pw_hash = hash_password(body["password"])
    create_doctor_credentials(doctor_id, body["email"], pw_hash)

    return {"success": True, "doctor_id": doctor_id, "message": "Doctor registered successfully"}


# ═══════════════════════════════════════════════════════════════════════════
# DOCTOR — Profile & Appointments (Feature 1)
# ═══════════════════════════════════════════════════════════════════════════
@app.get("/api/doctor/profile/{doctor_id}")
def doctor_profile(doctor_id: str, _user: dict = Depends(get_current_user)):
    doctor = get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    workload = round(calculate_workload(doctor), 1) if doctor.get("daily_capacity", 0) > 0 else 0
    return {
        **doctor,
        "workload_percent": workload,
    }


@app.get("/api/doctor/appointments/{doctor_id}")
def doctor_appointments(doctor_id: str, _user: dict = Depends(get_current_user)):
    return get_appointments_by_doctor(doctor_id)


# ═══════════════════════════════════════════════════════════════════════════
# Appointment submission (updated — Features 5, 10)
# ═══════════════════════════════════════════════════════════════════════════
@app.post("/api/submit-appointment")
def submit_appointment(patient_data: dict):
    """
    Full appointment flow:
      1. Parse symptoms → triage
      2. Assign doctor (least loaded)
      3. Calculate wait time
      4. Allocate bed (ICU / Ward)
      5. If emergency → reschedule non-emergency appointments for same doctor
      6. Send confirmation email
      7. Persist to Firestore
      8. Return enriched response for ReportPanel
    """

    # Parse free-text symptoms into triage flags
    symptom_flags = parse_symptoms(patient_data.get("symptoms", ""))
    triage_input = {
        "age": patient_data.get("age", 0),
        **symptom_flags,
    }

    # 1️⃣ TRIAGE
    emergency_flag = compute_emergency(triage_input)

    # 2️⃣ SEVERITY SCORE
    severity_score = calculate_severity(
        patient_data.get("age", 0),
        patient_data.get("symptoms", ""),
    )

    # 3️⃣ ASSIGN DOCTOR
    doctor = assign_doctor(patient_data["department"])
    if not doctor:
        return {"status": "rejected", "reason": "No doctor available in this department"}

    # 4️⃣ CALCULATE WAIT TIME
    wait_time = calculate_wait_time(doctor)

    # 5️⃣ ALLOCATE BED
    bed_result = allocate_bed(emergency_flag)
    if "error" in bed_result:
        return {"status": "rejected", "reason": bed_result["error"]}

    # 6️⃣ WORKLOAD
    workload = round(calculate_workload(doctor), 1)

    # 7️⃣ EMERGENCY AUTO-RESCHEDULING (Feature 10)
    rescheduled_ids = []
    if emergency_flag == 1:
        affected = get_scheduled_appointments_for_doctor_today(doctor["id"])
        for appt in affected:
            reschedule_appointment(appt["id"], "Emergency patient priority")
            rescheduled_ids.append(appt["id"])
            # Send rescheduling email if patient_email exists
            patient_email = appt.get("patient_email")
            if patient_email:
                try:
                    send_rescheduling_email(
                        patient_email, appt, "Emergency patient priority"
                    )
                except Exception as exc:
                    logger.error("Rescheduling email failed for %s: %s", patient_email, exc)

    # 8️⃣ CREATE APPOINTMENT DOCUMENT
    appointment_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc)

    appointment_data = {
        "patient_name": patient_data["patient_name"],
        "age": patient_data["age"],
        "symptoms": patient_data.get("symptoms", ""),
        "department": patient_data["department"],
        "patient_email": patient_data.get("patient_email", ""),
        "severity_score": severity_score,
        "emergency": emergency_flag,
        "assigned_doctor_id": doctor["id"],
        "assigned_doctor_name": doctor["name"],
        "predicted_wait_minutes": wait_time,
        "workload_percent": workload,
        "bed_type": bed_result.get("allocated", "N/A"),
        "status": "scheduled",
        "created_at": now.isoformat(),
    }

    create_appointment(appointment_data, appointment_id)

    # 9️⃣ SEND CONFIRMATION EMAIL (Feature 5)
    patient_email = patient_data.get("patient_email", "").strip()
    if patient_email:
        try:
            send_scheduling_email(patient_email, appointment_data)
        except Exception as exc:
            logger.error("Scheduling email failed for %s: %s", patient_email, exc)

    # 🔟 RESPONSE — matches what ReportPanel expects
    response = {
        "appointment_id": appointment_id,
        "patient_name": patient_data["patient_name"],
        "age": patient_data["age"],
        "symptoms": patient_data.get("symptoms", ""),
        "department": patient_data["department"],
        "severity_score": severity_score,
        "emergency": emergency_flag,
        "assigned_doctor_name": doctor["name"],
        "predicted_wait_minutes": wait_time,
        "workload_percent": workload,
        "bed_type": bed_result.get("allocated", "N/A"),
        "status": "scheduled",
        "created_at": now.isoformat(),
    }
    if rescheduled_ids:
        response["rescheduled_appointment_ids"] = rescheduled_ids

    return response


# ═══════════════════════════════════════════════════════════════════════════
# Existing list endpoints (unchanged)
# ═══════════════════════════════════════════════════════════════════════════
@app.get("/api/doctors")
def list_doctors():
    doctors = get_all_doctors()
    result = []
    for doc in doctors:
        workload = round(calculate_workload(doc), 1) if doc.get("daily_capacity", 0) > 0 else 0
        result.append({
            "id": doc["id"],
            "name": doc.get("name", "Unknown"),
            "department": doc.get("department", ""),
            "daily_capacity": doc.get("daily_capacity", 0),
            "current_appointments": doc.get("current_appointments", 0),
            "workload_percent": workload,
            "is_available": doc.get("is_available", False),
        })
    return result


@app.get("/api/appointments")
def list_appointments():
    return get_all_appointments()


@app.get("/api/admin/stats")
def admin_stats():
    doctors = get_all_doctors()
    appointments = get_all_appointments()

    total_doctors = len(doctors)
    total_appointments = len(appointments)
    emergency_cases = sum(1 for a in appointments if a.get("emergency") == 1)

    workloads = [
        calculate_workload(d)
        for d in doctors
        if d.get("daily_capacity", 0) > 0
    ]
    avg_workload = round(sum(workloads) / len(workloads), 1) if workloads else 0

    return {
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "emergency_cases": emergency_cases,
        "avg_workload": avg_workload,
    }