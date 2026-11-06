from datetime import datetime
import math
import pytz
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])

JAKARTA_TZ = pytz.timezone("Asia/Jakarta")

# Konfigurasi Titik Pusat & Radius untuk Packer (dalam meter)
PACKER_OFFICE_LAT = -6.1714774
PACKER_OFFICE_LON = 106.9922184
MAX_RADIUS_METERS = 100  # Batas toleransi jarak dalam meter (bisa disesuaikan, misal 100m)

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius bumi dalam meter
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("/clock-in")
def clock_in(data: schemas.ClockInRequest, db: Session = Depends(get_db)):
    # Ambil data user untuk mengecek role-nya
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")

    # Ambil waktu sekarang WIB
    now_jakarta = datetime.now(JAKARTA_TZ)
    today = now_jakarta.date()
    
    # Cek apakah user sudah absen hari ini
    existing = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == data.user_id,
        models.AttendanceLog.date == today
    ).first()
    
    if existing and existing.clock_in:
        raise HTTPException(status_code=400, detail="Anda sudah melakukan Clock In hari ini.")

    # KHUSUS PACKER: Wajib validasi geofencing (radius lokasi)
    if user.role.lower() == "packer":
        if data.latitude is None or data.longitude is None:
            raise HTTPException(status_code=400, detail="GPS tidak aktif. Mohon aktifkan izin lokasi browser Anda.")
        
        distance = calculate_distance(PACKER_OFFICE_LAT, PACKER_OFFICE_LON, data.latitude, data.longitude)
        
        if distance > MAX_RADIUS_METERS:
            raise HTTPException(
                status_code=400, 
                detail=f"Anda berada di luar area jangkauan gudang! Jarak anda {round(distance)} meter dari titik lokasi."
            )

    # Validasi jam kerja normal (08:00 - 17:00 WIB)
    current_hour = now_jakarta.hour
    if current_hour < 8 or current_hour >= 17:
        status = "Late"
        notes = "Terlambat (Presensi Dini Hari / Luar Jam Kerja)"
    else:
        threshold_time = now_jakarta.replace(hour=8, minute=0, second=0, microsecond=0)
        status = "On Time" if now_jakarta <= threshold_time else "Late"
        notes = "Tepat waktu" if status == "On Time" else "Terlambat"
    
    clean_now = now_jakarta.replace(tzinfo=None)
    
    if not existing:
        new_log = models.AttendanceLog(
            user_id=data.user_id,
            date=today,
            clock_in=clean_now,
            status=status,
            notes=notes,
            latitude=data.latitude,
            longitude=data.longitude
        )
        db.add(new_log)
    else:
        existing.clock_in = clean_now
        existing.status = status
        existing.notes = notes
        existing.latitude = data.latitude
        existing.longitude = data.longitude
        
    db.commit()
    return {"message": "Clock In berhasil dicatat!", "time": clean_now.strftime("%H:%M:%S")}


@router.post("/clock-out")
def clock_out(data: schemas.ClockOutRequest, db: Session = Depends(get_db)):
    now_jakarta = datetime.now(JAKARTA_TZ)
    today = now_jakarta.date()
    
    log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == data.user_id,
        models.AttendanceLog.date == today
    ).first()
    
    if not log or not log.clock_in:
        raise HTTPException(status_code=400, detail="Anda belum melakukan Clock In hari ini.")
    
    if log.clock_out:
        raise HTTPException(status_code=400, detail="Anda sudah melakukan Clock Out hari ini.")
    
    clean_now = now_jakarta.replace(tzinfo=None)
    log.clock_out = clean_now
    db.commit()
    
    return {"message": "Clock Out berhasil dicatat!", "time": clean_now.strftime("%H:%M:%S")}


@router.get("/status/{user_id}")
def get_attendance_status(user_id: int, db: Session = Depends(get_db)):
    today = datetime.now(JAKARTA_TZ).date()
    
    log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id,
        models.AttendanceLog.date == today
    ).first()
    
    if not log:
        return {
            "clock_in": None,
            "clock_out": None,
            "status": None,
            "notes": None
        }
        
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