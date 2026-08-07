import datetime
from typing import Any, Dict, Optional, Union
import jwt
import bcrypt
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash password using bcrypt with strong salt factor."""
    salt = bcrypt.gensalt(12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def create_access_token(subject: Union[str, int], expires_delta: Optional[datetime.timedelta] = None, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Generate short-lived JWT access token."""
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "type": "access",
        "iat": now,
        "exp": expire
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(subject: Union[str, int], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generate long-lived JWT refresh token."""
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "type": "refresh",
        "iat": now,
        "exp": expire
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_REFRESH_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str, is_refresh: bool = False) -> Optional[Dict[str, Any]]:
    """Decode and validate token type and expiration."""
    secret = settings.JWT_REFRESH_SECRET_KEY if is_refresh else settings.JWT_SECRET_KEY
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.JWT_ALGORITHM]
        )
        expected_type = "refresh" if is_refresh else "access"
        if payload.get("type") != expected_type:
            return None
        return payload
    except jwt.PyJWTError:
        return None
