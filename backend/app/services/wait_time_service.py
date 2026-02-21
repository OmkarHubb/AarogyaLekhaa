"""
wait_time_service.py
--------------------
Calculates predicted wait time based on doctor load.
"""

def calculate_wait_time(doctor: dict) -> int:
    """
    Wait time = current_appointments × avg_consultation_time (default 15 min)
    """
    avg_time = doctor.get("avg_consultation_time", 15)
    return doctor.get("current_appointments", 0) * avg_time