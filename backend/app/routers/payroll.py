from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, AttendanceLog as Attendance

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.get("/calculate")
def calculate_payroll(db: Session = Depends(get_db)):
    users = db.query(User).all()
    payroll_results = []

    for user in users:
        logs = db.query(Attendance).filter(
            Attendance.user_id == user.id
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

                    # Deteksi hari (0 = Senin, ..., 5 = Sabtu, 6 = Minggu)
                    log_date = datetime.strptime(str(log.date), "%Y-%m-%d") if log.date else datetime.now()
                    is_weekend = log_date.weekday() == 6 # Hari Minggu

                    # Standar pulang jam 17.00
                    standard_end = out_time.replace(hour=17, minute=0, second=0, microsecond=0)

                    if out_time > standard_end:
                        diff_seconds = (out_time - standard_end).total_seconds()
                        hours_overtime = diff_seconds / 3600  # Dikonversi ke jam

                        if is_weekend:
                            # Tarif lembur Minggu / Weekend: +Rp 25.000 / jam
                            tarif_per_jam_weekend = 25000
                            bonus_lembur += int(hours_overtime * tarif_per_jam_weekend)
                        else:
                            # Tarif lembur Senin - Sabtu / Weekday: +Rp 10.000 / jam
                            tarif_per_jam_weekday = 10000
                            bonus_lembur += int(hours_overtime * tarif_per_jam_weekday)

                except Exception as e:
                    print("Error parsing overtime:", e)

        base_salary = getattr(user, "base_salary", 3000000) or 3000000
        bonus_on_time = tepat_waktu * 25000
        deduction_late = terlambat * 10000
        bpjs_kesehatan = base_salary * 0.01
        bpjs_jht = base_salary * 0.02
        total_potongan = deduction_late + bpjs_kesehatan + bpjs_jht
        
        # Total Gaji Bersih
        net_salary = base_salary + bonus_on_time + bonus_lembur - total_potongan

        payroll_results.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "base_salary": base_salary,
            "total_hadir": total_hadir,
            "tepat_waktu": tepat_waktu,
            "terlambat": terlambat,
            "bonus_on_time": bonus_on_time,
            "bonus_lembur": bonus_lembur,
            "deduction_late": deduction_late,
            "bpjs_kesehatan": bpjs_kesehatan,
            "bpjs_jht": bpjs_jht,
            "total_potongan": total_potongan,
            "net_salary": net_salary
        })

    return {"payroll_data": payroll_results}