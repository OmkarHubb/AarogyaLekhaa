"""
admin_repo.py — Firestore operations for admin_credentials collection.
"""

from app.db.firebase import db


def get_admin_by_username(username: str):
    """Look up an admin by username. Returns dict with 'id' or None."""
    docs = (
        db.collection("admin_credentials")
        .where("username", "==", username)
        .limit(1)
        .stream()
    )
    for doc in docs:
        return {**doc.to_dict(), "id": doc.id}
    return None


def get_admin_by_email(email: str):
    """Look up an admin by email. Returns dict with 'id' or None."""
    docs = (
        db.collection("admin_credentials")
        .where("email", "==", email)
        .limit(1)
        .stream()
    )
    for doc in docs:
        return {**doc.to_dict(), "id": doc.id}
    return None


def update_admin_password(doc_id: str, new_hash: str):
    """Update the password_hash for an admin document."""
    db.collection("admin_credentials").document(doc_id).update(
        {"password_hash": new_hash}
    )


def create_admin(username: str, email: str, password_hash: str):
    """Create a new admin_credentials document."""
    doc_ref = db.collection("admin_credentials").document()
    doc_ref.set(
        {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "role": "admin",
        }
    )
    return doc_ref.id
