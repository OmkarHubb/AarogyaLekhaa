import os
import json
import firebase_admin
from firebase_admin import credentials

firebase_json = os.environ.get("FIREBASE_CONFIG_JSON")
if firebase_json:
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)