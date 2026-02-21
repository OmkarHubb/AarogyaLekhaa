from firebase_init import db

def generate_recommendations():
    metrics = db.collection("hospital_metrics").document("live_metrics").get().to_dict() or {}
    level = metrics.get("level", "NORMAL")
    icu = metrics.get("icu_occupancy_percent", 0)
    workload = metrics.get("avg_doctor_workload_percent", 0)

    messages = []
    if level == "CRITICAL":
        messages.append("Activate emergency response protocol")
        messages.append("Defer non-urgent appointments")
        if icu > 90:
            messages.append("Initiate ICU patient transfer")
        if workload > 85:
            messages.append("Call additional on-call doctors")
    elif level == "WARNING":
        messages.append("Monitor ICU capacity closely")
        if icu > 75:
            messages.append("Prepare overflow beds")
    else:
        messages.append("Hospital operating within safe limits")

    db.collection("recommendations").document("current_recommendations").set({
        "level": level,
        "messages": messages,
    })
    return messages