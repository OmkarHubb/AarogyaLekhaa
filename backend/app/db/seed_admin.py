"""
seed_admin.py — One-time script to seed the default admin account.

Run from the backend directory:
    python -m app.db.seed_admin
"""

import os
import sys

# Add backend dir to path so `app.` imports work when run as a script
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from dotenv import load_dotenv
load_dotenv()

from app.db.firebase import db
from app.utils.password_utils import hash_password


def seed():
    # Check if an admin already exists
    existing = list(
        db.collection("admin_credentials")
        .where("username", "==", "admin")
        .limit(1)
        .stream()
    )
    if existing:
        print("⚠  Default admin already exists — skipping seed.")
        return

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@aarogyalekha.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    doc_ref = db.collection("admin_credentials").document()
    doc_ref.set(
        {
            "username": "admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
        }
    )
    print(f"✅  Default admin created  (username=admin, email={admin_email})")
    print("   You can now log in at /admin/login")


if __name__ == "__main__":
    seed()
