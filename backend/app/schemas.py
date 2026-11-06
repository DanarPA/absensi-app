from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "employee"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Attendance Schemas
class ClockInRequest(BaseModel):
    user_id: int
    notes: Optional[str] = None

class AttendanceLogBase(BaseModel):
    notes: Optional[str] = None

class AttendanceLogResponse(AttendanceLogBase):
    id: int
    user_id: int
    date: date
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    role: str