from app.db.firebase import db
from datetime import datetime


def get_resources():
    doc = db.collection("resources").document("hospital_resources").get()
    return doc.to_dict()


def update_resources(data: dict):
    db.collection("resources").document("hospital_resources").update(data)