from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, time
from geopy.distance import geodesic
from app import models, schemas
from app.database import get_db
import pytz

router = APIRouter(prefix="/attendance", tags=["Attendance"])

WIB = pytz.timezone("Asia/Jakarta")

@router.post("/clock-in")
def clock_in(data: schemas.ClockInRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    now_wib = datetime.now(WIB)
    today = now_wib.date()

    existing_log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == data.user_id,
        models.AttendanceLog.date == today
    ).first()

    if existing_log:
        raise HTTPException(status_code=400, detail="Anda sudah melakukan Clock In hari ini!")

    # Validasi Geofencing HANYA UNTUK PACKER
    if user.role.lower() == "packer":
        if data.latitude is None or data.longitude is None:
            raise HTTPException(status_code=400, detail="Akses lokasi (GPS) wajib diaktifkan untuk Tim Packer!")
        
        WAREHOUSE_LAT = -6.1714774
        WAREHOUSE_LON = 106.9922184
        ALLOWED_RADIUS_KM = 0.5  # Radius 500 meter

        distance = geodesic((data.latitude, data.longitude), (WAREHOUSE_LAT, WAREHOUSE_LON)).km
        if distance > ALLOWED_RADIUS_KM:
            raise HTTPException(
                status_code=400,
                detail=f"Anda berada di luar radius kantor! Jarak Anda: {round(distance * 1000)} meter dari gudang."
            )

    # Untuk Admin atau role lain, koordinat disimpan apa adanya (bisa di luar gudang)
    WORK_START_TIME = time(8, 0, 0)
    current_time = now_wib.time()

    attendance_status = "On Time"
    notes = "Tepat waktu"

    if current_time > WORK_START_TIME or current_time < time(5, 0, 0):
        attendance_status = "Late"
        if current_time < time(5, 0, 0):
            notes = "Terlambat (Presensi Dini Hari / Luar Jam Kerja)"
        else:
            target_datetime = datetime.combine(today, WORK_START_TIME, tzinfo=WIB)
            late_seconds = (now_wib - target_datetime).total_seconds()
            late_minutes = int(late_seconds // 60)
            notes = f"Terlambat {late_minutes} menit"

    db_log = models.AttendanceLog(
        user_id=data.user_id,
        date=today,
        clock_in=now_wib.replace(tzinfo=None),
        status=attendance_status,
        notes=notes,
        latitude=data.latitude,
        longitude=data.longitude
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    return {
        "message": f"Clock In Berhasil! Status: {attendance_status}",
        "log_id": db_log.id,
        "clock_in": db_log.clock_in.isoformat(),
        "status": db_log.status,
        "notes": db_log.notes
    }


@router.post("/clock-out")
def clock_out(data: schemas.ClockOutRequest, db: Session = Depends(get_db)):
    now_wib = datetime.now(WIB)
    today = now_wib.date()

    log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == data.user_id,
        models.AttendanceLog.date == today
    ).first()

    if not log:
        raise HTTPException(status_code=400, detail="Anda belum melakukan Clock In hari ini!")

    if log.clock_out:
        raise HTTPException(status_code=400, detail="Anda sudah melakukan Clock Out hari ini!")

    log.clock_out = now_wib.replace(tzinfo=None)
    
    WORK_END_TIME = time(17, 0, 0)
    current_time = now_wib.time()

    if current_time < WORK_END_TIME:
        log.notes = (log.notes or "") + " | Pulang Cepat"
    else:
        log.notes = (log.notes or "") + " | Clock Out Normal"

    db.commit()
    db.refresh(log)

    return {
        "message": "Clock Out Berhasil!",
        "clock_out": log.clock_out.isoformat(),
        "status": log.status,
        "notes": log.notes
    }


@router.get("/status/{user_id}")
def get_user_attendance_status(user_id: int, db: Session = Depends(get_db)):
    today = datetime.now(WIB).date()
    log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id,
        models.AttendanceLog.date == today
    ).first()
    
    if not log:
        return {"clock_in": None, "clock_out": None, "status": None, "notes": None}
    
    return {
        "clock_in": log.clock_in.isoformat() if log.clock_in else None,
        "clock_out": log.clock_out.isoformat() if log.clock_out else None,
        "status": log.status,
        "notes": log.notes
    }

@router.get("/history/{user_id}")
def get_user_attendance_history(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id
    ).order_by(models.AttendanceLog.date.desc()).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "date": str(log.date),
            "clock_in": log.clock_in.isoformat() if log.clock_in else None,
            "clock_out": log.clock_out.isoformat() if log.clock_out else None,
            "status": log.status,
            "notes": log.notes,
            "latitude": log.latitude,
            "longitude": log.longitude
        })
    return result