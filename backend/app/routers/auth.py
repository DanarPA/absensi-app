from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
import app.models as models
import app.schemas as schemas

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# 1. Endpoint Login
@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or user.password_hash != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah!"
        )

    return {
        "access_token": f"bearer-token-user-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "role": user.role
    }

# 2. Endpoint Register Baru
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar!"
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=user.password,
        role=user.role or "employee"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user