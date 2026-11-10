from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, AttendanceLog as Attendance, LeaveRequest

router = APIRouter(prefix="/admin/payroll", tags=["Payroll"])

@router.get("")
def get_admin_payroll(
    month: int = Query(..., description="Bulan aktif"),
    year: int = Query(..., description="Tahun aktif"),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    payroll_results = []

    for user in users:
        # Filter absensi berdasarkan user_id serta bulan dan tahun yang dipilih
        logs = db.query(Attendance).filter(
            Attendance.user_id == user.id,
            extract('month', Attendance.date) == month,
            extract('year', Attendance.date) == year
        ).all()

        total_hadir = len(logs)
        tepat_waktu = 0
        terlambat = 0
        bonus_lembur = 0

        for log in logs:
            if not log.clock_in:
                continue

            # Parsing jam masuk (clock_in)
            try:
                if "T" in str(log.clock_in):
                    in_time = datetime.fromisoformat(str(log.clock_in))
                else:
                    in_time = datetime.strptime(str(log.clock_in), "%H:%M:%S")
                
                # Batas toleransi 08.15
                limit_toleransi = in_time.replace(hour=8, minute=15, second=0, microsecond=0)
                
                if in_time.time() > limit_toleransi.time():
                    terlambat += 1
                else:
                    tepat_waktu += 1
            except Exception:
                if log.status == "On Time":
                    tepat_waktu += 1
                else:
                    terlambat += 1

            # Hitung Lembur dari Clock Out (> 17.00)
            if log.clock_out:
                try:
                    if "T" in str(log.clock_out):
                        out_time = datetime.fromisoformat(str(log.clock_out))
                    else:
                        out_time = datetime.strptime(str(log.clock_out), "%H:%M:%S")

                    log_date = datetime.strptime(str(log.date), "%Y-%m-%d") if log.date else datetime.now()
                    is_weekend = log_date.weekday() == 6 # Hari Minggu

                    standard_end = out_time.replace(hour=17, minute=0, second=0, microsecond=0)

                    if out_time > standard_end:
                        diff_seconds = (out_time - standard_end).total_seconds()
                        hours_overtime = diff_seconds / 3600

                        if is_weekend:
                            bonus_lembur += int(hours_overtime * 25000)
                        else:
                            bonus_lembur += int(hours_overtime * 10000)

                except Exception as e:
                    print("Error parsing overtime:", e)

        # Ambil data cuti/izin user yang statusnya "Approved" pada bulan & tahun aktif
        approved_leaves = db.query(LeaveRequest).filter(
            LeaveRequest.user_id == user.id,
            LeaveRequest.status == "Approved"
        ).all()

        total_cuti = 0
        for leave in approved_leaves:
            try:
                delta = leave.end_date - leave.start_date
                for i in range(delta.days + 1):
                    day = leave.start_date + timedelta(days=i)
                    if day.month == month and day.year == year:
                        total_cuti += 1
            except Exception as e:
                print("Error calculating leave days:", e)

        base_salary = getattr(user, "base_salary", 3000000) or 3000000
        bonus_on_time = tepat_waktu * 25000
        deduction_late = terlambat * 10000

        # Asumsi standar hari kerja efektif dalam sebulan adalah 22 hari
        standard_working_days = 22
        alpha_days = max(0, standard_working_days - (total_hadir + total_cuti))
        deduction_alpha = int(alpha_days * (base_salary / standard_working_days))

        bpjs_kesehatan = base_salary * 0.01
        bpjs_jht = base_salary * 0.02
        total_potongan = deduction_late + deduction_alpha + bpjs_kesehatan + bpjs_jht
        
        net_salary = base_salary + bonus_on_time + bonus_lembur - total_potongan

        payroll_results.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "base_salary": base_salary,
            "total_hadir": total_hadir,
            "total_cuti": total_cuti,
            "tepat_waktu": tepat_waktu,
            "terlambat": terlambat,
            "bonus_on_time": bonus_on_time,
            "bonus_lembur": bonus_lembur,
            "deduction_late": deduction_late,
            "deduction_alpha": deduction_alpha,
            "bpjs_kesehatan": bpjs_kesehatan,
            "bpjs_jht": bpjs_jht,
            "total_potongan": total_potongan,
            "net_salary": max(0, net_salary)
        })

    return payroll_results