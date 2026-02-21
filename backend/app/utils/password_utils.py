"""
password_utils.py — bcrypt-based password hashing for AarogyaLekha.

Usage:
    from app.utils.password_utils import hash_password, verify_password
"""

import bcrypt


def hash_password(plain: str) -> str:
    """Hash a plaintext password and return the bcrypt hash as a UTF-8 string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Compare a plaintext password against a stored bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
