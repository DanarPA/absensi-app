from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import get_db
import app.models as models
import app.schemas as schemas
import re

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Support backward compatibility jika ada password lama plain text
    if not hashed_password.startswith("$2b$"):
        return plain_password == hashed_password
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah!"
        )

    return {
        "access_token": f"bearer-token-user-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "role": user.role or "employee"
    }

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Validasi ketentuan password
    if len(user.password) < 8 or not re.search(r"[0-9]", user.password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password harus minimal 8 karakter, mengandung angka, dan simbol."
        )

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar!"
        )

    hashed_pwd = hash_password(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_pwd,
        role=user.role or "employee"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user