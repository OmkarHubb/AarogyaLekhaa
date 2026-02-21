"""
doctor_service.py
-----------------
Handles doctor selection and workload logic.
"""

from app.db.doctor_repo import (
    get_doctors_by_department,
    update_doctor_appointments
)


def calculate_workload(doctor: dict) -> float:
    """
    Calculates workload percentage of a doctor.
    """
    return (
        doctor["current_appointments"] /
        doctor["daily_capacity"]
    ) * 100


def assign_doctor(department: str):
    """
    Selects the least loaded available doctor
    from the given department and updates
    appointment count.
    """

    doctors = get_doctors_by_department(department)

    # Filter doctors who still have capacity
    available_doctors = [
        d for d in doctors
        if d["current_appointments"] < d["daily_capacity"]
        and d["is_available"] is True
    ]

    if not available_doctors:
        return None

    # Sort by lowest workload %
    available_doctors.sort(key=calculate_workload)

    selected = available_doctors[0]

    # Update Firestore appointment count
    new_count = selected["current_appointments"] + 1
    update_doctor_appointments(selected["id"], new_count)

    # Return updated doctor info
    selected["current_appointments"] = new_count

    return selected