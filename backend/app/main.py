from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
import app.models as models
import app.schemas as schemas

# Import kedua router: attendance dan auth
from app.routers import attendance, auth

# Buat tabel otomatis di PostgreSQL jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Absensi App API",
    description="API Backend untuk Sistem Absensi Karyawan",
    version="1.0.0"
)

# CORS Policy agar Frontend Next.js bisa berkomunikasi dengan FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Auth dan Attendance
app.include_router(auth.router)
app.include_router(attendance.router)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Backend Absensi App Berjalan!"}

@app.get("/health-check")
def health_check(db: Session = Depends(get_db)):
    return {"database": "connected", "status": "ok"}

# Endpoint sementara buat nambah User (jika registrasi manual via Swagger)
@app.post("/users/", response_model=schemas.UserResponse, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=user.password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user