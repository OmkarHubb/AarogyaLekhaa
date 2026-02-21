from firebase_init import db

def update_bed_occupancy(emergency: int):
    ref = db.collection("resources").document("hospital_resources")
    data = ref.get().to_dict() or {}

    if emergency == 1:
        if data.get("icu_occupied", 0) >= data.get("icu_total", 0):
            raise Exception("ICU capacity exceeded")
        ref.update({"icu_occupied": data.get("icu_occupied", 0) + 1})
    else:
        if data.get("ward_occupied", 0) >= data.get("ward_total", 0):
            raise Exception("Ward capacity exceeded")
        ref.update({"ward_occupied": data.get("ward_occupied", 0) + 1})


def get_resource_status():
    return db.collection("resources").document("hospital_resources").get().to_dict() or {}