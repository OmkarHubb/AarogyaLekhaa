from firebase_init import db

def get_available_doctors(department: str):
    doctors = db.collection("doctors") \
        .where("department", "==", department) \
        .where("is_available", "==", True) \
        .stream()

    result = []
    for doc in doctors:
        d = doc.to_dict()
        if d["current_appointments"] < d["daily_capacity"]:
            workload_ratio = (d["current_appointments"] / d["daily_capacity"])
            result.append({"id": doc.id, "data": d, "workload_ratio": workload_ratio})
    return result


def compute_all_doctor_workloads():
    doctors = db.collection("doctors").stream()
    output = []
    for doc in doctors:
        d = doc.to_dict()
        percent = round((d["current_appointments"] / d["daily_capacity"]) * 100, 2)
        output.append({
            "doctor_id": doc.id,
            "name": d["name"],
            "department": d["department"],
            "workload_percent": percent,
            "current_appointments": d["current_appointments"],
            "daily_capacity": d["daily_capacity"],
        })
    return output