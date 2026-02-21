"""
triage_service.py
-----------------
Rule-based triage logic for the Hospital Coordination System.
Determines whether an incoming patient is an emergency case.
"""


def compute_emergency(severity_score: int) -> int:
    """
    Determine the emergency flag for a patient based on their severity score.

    Parameters
    ----------
    severity_score : int
        Patient-reported or clinically assessed score in the range [0, 10].

    Returns
    -------
    int
        1 if the patient is an emergency (severity_score >= 8), 0 otherwise.
    """
    return 1 if severity_score >= 8 else 0
