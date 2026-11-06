from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
import app.models as models
import app.schemas as schemas

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

# 1. Endpoint Clock In
@router.post("/clock-in", response_model=schemas.AttendanceLogResponse)
def clock_in(req: schemas.ClockInRequest, db: Session = Depends(get_db)):
    today = date.today()
    
    # Cek ketersediaan user
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User ID tidak ditemukan!")

    existing_log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == req.user_id,
        models.AttendanceLog.date == today
    ).first()

    if existing_log and existing_log.clock_in:
        raise HTTPException(
            status_code=400,
            detail="User sudah melakukan Clock In hari ini!"
        )

    now = datetime.now()
    status_attendance = "Late" if now.hour >= 8 and now.minute > 0 else "On Time"

    if not existing_log:
        new_log = models.AttendanceLog(
            user_id=req.user_id,
            date=today,
            clock_in=now,
            status=status_attendance,
            notes=req.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log
    else:
        existing_log.clock_in = now
        existing_log.status = status_attendance
        if req.notes:
            existing_log.notes = req.notes
        db.commit()
        db.refresh(existing_log)
        return existing_log

# 2. Endpoint Clock Out (Gunakan JSON Body req.user_id)
@router.post("/clock-out", response_model=schemas.AttendanceLogResponse)
def clock_out(req: schemas.ClockInRequest, db: Session = Depends(get_db)):
    today = date.today()
    
    log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == req.user_id,
        models.AttendanceLog.date == today
    ).first()

    if not log or not log.clock_in:
        raise HTTPException(
            status_code=400,
            detail="Belum ada record Clock In untuk hari ini!"
        )

    if log.clock_out:
        raise HTTPException(
            status_code=400,
            detail="User sudah melakukan Clock Out hari ini!"
        )

    log.clock_out = datetime.now()
    db.commit()
    db.refresh(log)
    return log

# 3. Endpoint Get Riwayat Absensi User
@router.get("/history/{user_id}")
def get_attendance_history(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id
    ).all()
    return logs