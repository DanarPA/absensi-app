from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="employee")  # 'admin' atau 'employee'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    attendances = relationship("AttendanceLog", back_populates="user")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, server_default=func.current_date())
    clock_in = Column(DateTime(timezone=True), nullable=True)
    clock_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="On Time")  # 'On Time', 'Late', 'Overtime'
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="attendances")