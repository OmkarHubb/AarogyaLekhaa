"""
jwt_utils.py — JWT token creation, decoding, and FastAPI dependency.

Usage:
    from app.utils.jwt_utils import create_token, decode_token, get_current_user
"""

import os
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import Request, HTTPException

JWT_SECRET = os.environ.get("JWT_SECRET", "aarogyalekha-default-secret-change-me")
JWT_ALGORITHM = "HS256"


def create_token(payload: dict, expires_hours: int = 24) -> str:
    """Create a signed JWT with the given payload and expiry."""
    data = payload.copy()
    data["exp"] = datetime.now(tz=timezone.utc) + timedelta(hours=expires_hours)
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT. Raises HTTPException(401) on failure."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency – extracts the JWT from the Authorization header
    and returns the decoded payload.

    Usage in a route:
        @app.get("/protected")
        def protected_route(user: dict = Depends(get_current_user)):
            ...
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header[7:]  # strip "Bearer "
    return decode_token(token)
