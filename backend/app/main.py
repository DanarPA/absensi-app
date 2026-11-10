from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, attendance, admin, payroll

# Membuat tabel database jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Absensi App API")

# Konfigurasi CORS untuk Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan Router
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(admin.router)
app.include_router(payroll.router)  # Pastikan baris ini aktif tanpa komentar!

@app.get("/")
def read_root():
    return {"message": "API Absensi Berjalan Normal"}