from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import get_db

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