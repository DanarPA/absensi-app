from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from ..database import get_db
from ..models import LeaveRequest, User

router = APIRouter(prefix="/admin/leaves", tags=["Leave Management"])
class LeaveCreateSchema(BaseModel):
    user_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveUpdateStatusSchema(BaseModel):
    status: str  # "Approved" atau "Rejected"

@router.get("")
def get_all_leaves(db: Session = Depends(get_db)):
    leaves = db.query(LeaveRequest).all()
    result = []
    for leave in leaves:
        result.append({
            "id": leave.id,
            "user_id": leave.user_id,
            "user_name": leave.user.name if leave.user else "Karyawan",
            "leave_type": leave.leave_type,
            "start_date": str(leave.start_date),
            "end_date": str(leave.end_date),
            "reason": leave.reason,
            "status": leave.status
        })
    return result

@router.post("")
def create_leave_request(data: LeaveCreateSchema, db: Session = Depends(get_db)):
    new_leave = LeaveRequest(
        user_id=data.user_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status="Pending"
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return {"message": "Pengajuan cuti berhasil dikirim", "id": new_leave.id}

@router.put("/{leave_id}/status")
def update_leave_status(leave_id: int, data: LeaveUpdateStatusSchema, db: Session = Depends(get_db)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Pengajuan cuti tidak ditemukan")
    
    if data.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status tidak valid")

    leave.status = data.status
    db.commit()
    return {"message": f"Pengajuan cuti berhasil diubah menjadi {data.status}"}