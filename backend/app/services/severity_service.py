"""
severity_service.py
-------------------
Rule-based severity scoring for the Hospital Coordination System.

Calculates a severity score (0–10) from patient age and symptom description.
This score is consumed downstream by triage_service to set the emergency flag.
"""

# ---------------------------------------------------------------------------
# Symptom keyword → weight mapping.
# Keys must be lowercase. Values should reflect clinical urgency.
# ---------------------------------------------------------------------------
SYMPTOM_WEIGHTS: dict[str, int] = {
    "unconscious": 5,
    "chest pain": 4,
    "breathing difficulty": 4,
    "fever": 2,
    "headache": 1,
    "vomiting": 1,
}

# Maximum allowed severity score
MAX_SEVERITY: int = 10


def _age_score(age: int) -> int:
    """
    Return age-based severity contribution.

    Parameters
    ----------
    age : int
        Patient age in years.

    Returns
    -------
    int
        +2 for seniors (≥ 65), +1 for middle-aged (≥ 45), 0 otherwise.
    """
    if age >= 65:
        return 2
    if age >= 45:
        return 1
    return 0


def _symptom_score(symptoms_lower: str) -> int:
    """
    Return cumulative symptom-based severity contribution.

    Parameters
    ----------
    symptoms_lower : str
        Patient symptom description pre-converted to lowercase.

    Returns
    -------
    int
        Sum of weights for all matched symptom keywords.
    """
    return sum(
        weight
        for keyword, weight in SYMPTOM_WEIGHTS.items()
        if keyword in symptoms_lower
    )


def calculate_severity(age: int, symptoms: str) -> int:
    """
    Calculate a rule-based severity score for a patient.

    The score is the sum of an age factor and symptom-keyword weights,
    capped at ``MAX_SEVERITY`` (10).

    Parameters
    ----------
    age : int
        Patient age in years (must be > 0).
    symptoms : str
        Free-text symptom description (case-insensitive).

    Returns
    -------
    int
        Integer severity score in the range [0, 10].

    Examples
    --------
    >>> calculate_severity(67, "Chest pain and breathing difficulty")
    10
    >>> calculate_severity(30, "Headache")
    1
    >>> calculate_severity(50, "Fever and vomiting")
    4
    """
    symptoms_lower: str = symptoms.lower()

    total: int = _age_score(age) + _symptom_score(symptoms_lower)
    return min(total, MAX_SEVERITY)
