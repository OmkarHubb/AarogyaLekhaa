import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

if not firebase_admin._apps:

    # Production (Render)
    if os.getenv("FIREBASE_CREDENTIALS"):
        cred_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
        cred = credentials.Certificate(cred_dict)
    else:
        # Local development
        cred = credentials.Certificate("serviceAccountKey.json")

    firebase_admin.initialize_app(cred)

db = firestore.client()
