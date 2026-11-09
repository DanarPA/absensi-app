from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Employee"

# Tambahkan alias ini untuk mencocokkan UserCreate di auth.py
UserCreate = UserRegister

class UserLogin(BaseModel):
    email: str
    password: str

LoginRequest = UserLogin

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ClockInRequest(BaseModel):
    user_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ClockOutRequest(BaseModel):
    user_id: int

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    role: str