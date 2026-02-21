"""
triage_service.py
-----------------
Rule-based triage engine.
Returns 1 (Emergency) or 0 (Normal).
"""

from typing import Dict


def compute_emergency(patient_data: Dict) -> int:
    """
    Evaluate patient data and return emergency flag.
    
    Returns:
        1 → Emergency
        0 → Normal
    """

    age = patient_data.get("age", 0)
    severe = patient_data.get("severe_symptoms", False)
    moderate = patient_data.get("moderate_symptoms", False)

    # Rule 1: Severe symptoms
    if severe:
        return 1

    # Rule 2: Elderly + moderate symptoms
    if age > 65 and moderate:
        return 1

    return 0