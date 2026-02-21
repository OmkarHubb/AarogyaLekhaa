"""
slot_service.py
---------------
Doctor selection and wait-time calculation for the Hospital Coordination System.

Orchestrates:
  1. Retrieving available doctors for a department.
  2. Selecting the least-loaded doctor (lowest workload ratio).
  3. Computing the predicted wait time.
"""

from typing import Any, Optional

from app.services.doctor_service import assign_doctor


def _workload_ratio(doctor: dict[str, Any]) -> float:
    """
    Compute the workload ratio for a doctor.

    workload_ratio = current_appointments / daily_capacity

    Parameters
    ----------
    doctor : dict[str, Any]
        A doctor record from the mock registry.

    Returns
    -------
    float
        Ratio in [0.0, 1.0).  Lower means the doctor is less loaded.
    """
    return doctor["current_appointments"] / doctor["daily_capacity"]


def _compute_wait_time(doctor: dict[str, Any]) -> int:
    """
    Estimate patient wait time based on the selected doctor's current queue.

    predicted_wait_minutes = current_appointments × avg_consultation_time

    Parameters
    ----------
    doctor : dict[str, Any]
        The selected doctor record.

    Returns
    -------
    int
        Predicted wait time in minutes.
    """
    return doctor["current_appointments"] * doctor["avg_consultation_time"]


def allocate_slot(department: str, emergency: int) -> Optional[dict[str, Any]]:
    """
    Select the best available doctor for the given department and compute
    the predicted wait time.

    Selection algorithm:
    - Filter doctors via ``get_available_doctors``.
    - Sort by workload ratio (ascending) to pick the least-loaded doctor.
    - Compute wait time for that doctor.

    Parameters
    ----------
    department : str
        The patient's requested department.
    emergency : int
        Triage emergency flag (1 = emergency, 0 = routine).
        Reserved for future priority-queue enhancements; not altering
        selection logic in the current scope.

    Returns
    -------
    dict[str, Any] | None
        A dict with ``assigned_doctor_id``, ``department``,
        ``predicted_wait_minutes``, and ``workload_percent`` if a doctor
        is found; ``None`` otherwise.
    """
    candidates = get_available_doctors(department)

    if not candidates:
        return None

    # Sort ascending by workload ratio; pick the least-loaded doctor
    candidates.sort(key=_workload_ratio)
    selected = candidates[0]

    predicted_wait = _compute_wait_time(selected)
    workload_pct = round(_workload_ratio(selected) * 100, 2)

    return {
        "assigned_doctor_id": selected["doctor_id"],
        "assigned_doctor_name": selected["name"],
        "department": selected["department"],
        "predicted_wait_minutes": predicted_wait,
        "workload_percent": workload_pct,
    }
