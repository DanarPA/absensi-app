from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from pydantic import BaseModel
from typing import Optional
import csv
import io

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/attendance")
def get_all_attendance(db: Session = Depends(get_db)):
    records = db.query(models.AttendanceLog).all()
    result = []
    for r in records:
        user = db.query(models.User.name, models.User.role).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": user.name if user else "Unknown",
            "role": user.role if user else "Unknown",
            "date": str(r.date),
            "clock_in": r.clock_in.isoformat() if r.clock_in else None,
            "clock_out": r.clock_out.isoformat() if r.clock_out else None,
            "status": r.status,
            "notes": r.notes,
            "latitude": r.latitude,
            "longitude": r.longitude
        })
    return result

@router.delete("/attendance/{record_id}")
def delete_attendance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.AttendanceLog.id).filter(models.AttendanceLog.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Data presensi tidak ditemukan")
    
    db.query(models.AttendanceLog).filter(models.AttendanceLog.id == record_id).delete()
    db.commit()
    return {"message": "Data presensi berhasil dihapus"}

@router.get("/attendance/export-csv")
def export_attendance_csv(db: Session = Depends(get_db)):
    # Ambil data log absensi dan join ke tabel User untuk ambil nama & role
    logs = db.query(models.AttendanceLog, models.User).join(models.User, models.AttendanceLog.user_id == models.User.id).order_by(models.AttendanceLog.date.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Ubah header kolom sesuai kebutuhan
    writer.writerow(["ID", "Nama Karyawan", "Role", "Date", "Clock In", "Clock Out", "Status", "Notes"])
    
    for log, user in logs:
        writer.writerow([
            log.id,
            user.name if user else "Unknown",
            user.role if user else "Unknown",
            str(log.date),
            str(log.clock_in) if log.clock_in else "",
            str(log.clock_out) if log.clock_out else "",
            log.status or "",
            log.notes or ""
        ])
    
    output.seek(0)
    
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=attendance_report.csv"
    return response

@router.get("/users")
def get_admin_users(db: Session = Depends(get_db)):
    # Ambil semua data user apa adanya dari database
    users = db.query(models.User).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        })
    return result

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    
    db.delete(user)
    db.commit()
    return {"message": "Pengguna berhasil dihapus"}

class UserUpdate(BaseModel):
    name: str
    email: str
    role: str
    password: Optional[str] = None

@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    
    user.name = user_data.name
    user.email = user_data.email
    user.role = user_data.role
    
    # Jika password diisi dari admin panel, update passwordnya
    if user_data.password and user_data.password.strip():
        user.password = user_data.password
        
    db.commit()
    return {"message": "Pengguna berhasil diperbarui"}

class UserCreate(BaseModel):
    name: str
    email: str
    role: str

@router.post("/users")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Cek apakah email sudah terdaftar
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    # Buat user baru dengan password default '123456'
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        password="123456" # Password default
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Pengguna berhasil ditambahkan", "user_id": new_user.id}