from firebase_init import db

def calculate_stress_index():
    doctors = db.collection("doctors").stream()
    total_workload, count = 0, 0
    for doc in doctors:
        d = doc.to_dict()
        total_workload += (d["current_appointments"] / d["daily_capacity"]) * 100
        count += 1
    avg_workload = total_workload / count if count else 0

    resources = db.collection("resources").document("hospital_resources").get().to_dict() or {}
    icu_percent = (resources.get("icu_occupied", 0) / max(resources.get("icu_total", 1), 1)) * 100
    ward_percent = (resources.get("ward_occupied", 0) / max(resources.get("ward_total", 1), 1)) * 100

    appointments = db.collection("appointments").stream()
    total_cases, emergency_cases = 0, 0
    for a in appointments:
        total_cases += 1
        if a.to_dict().get("emergency") == 1:
            emergency_cases += 1

    emergency_ratio = (emergency_cases / total_cases) if total_cases else 0
    stress = (
        0.4 * avg_workload +
        0.3 * icu_percent +
        0.2 * ward_percent +
        0.1 * (emergency_ratio * 100)
    )

    level = "NORMAL"
    if stress >= 80:
        level = "CRITICAL"
    elif stress >= 60:
        level = "WARNING"

    db.collection("hospital_metrics").document("live_metrics").set({
        "stress_index": stress,
        "level": level,
        "avg_doctor_workload_percent": avg_workload,
        "icu_occupancy_percent": icu_percent,
        "ward_occupancy_percent": ward_percent,
        "emergency_ratio": emergency_ratio,
    })

    return stress, level