from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.middleware import limiter
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.user import User, ActivityLog
from app.schemas.auth import LoginRequest, RegisterRequest, RefreshTokenRequest, Token
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(f"{settings.AUTH_RATE_LIMIT_PER_MINUTE}/minute")
async def register(
    request: Request,
    user_in: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with secure password hashing and unique email validation."""
    result = await db.execute(select(User).where(User.email == user_in.email.lower()))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "user",
        is_active=True,
        is_superuser=False
    )
    db.add(user)
    await db.flush()  # get user.id

    # Log activity
    activity = ActivityLog(
        user_id=user.id,
        action="USER_REGISTERED",
        details=f"Account created for {user.email}",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(activity)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
@limiter.limit(f"{settings.AUTH_RATE_LIMIT_PER_MINUTE}/minute")
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user with email/password and issue JWT Access & Refresh Tokens."""
    result = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role}
    )
    refresh_token = create_refresh_token(subject=user.id)

    # Log login activity
    activity = ActivityLog(
        user_id=user.id,
        action="USER_LOGIN",
        details=f"Successful login for {user.email}",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(activity)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=Token)
async def refresh_token_endpoint(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Validate refresh token and issue fresh JWT Access & Refresh Tokens."""
    payload = decode_token(body.refresh_token, is_refresh=True)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token is inactive or no longer exists"
        )

    new_access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role}
    )
    new_refresh_token = create_refresh_token(subject=user.id)

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Fetch current logged-in user profile details."""
    return current_user
