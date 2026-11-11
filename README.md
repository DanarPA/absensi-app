# 🏢 DPA-Attend: Employee Attendance, Leave Management & Payroll System

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Backend-FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</p>

Aplikasi manajemen kehadiran (*attendance*), pengajuan cuti mandiri (*self-service leave*), dan rekapitulasi gaji otomatis (*automated payroll*) berbasis web dengan arsitektur *full-stack*. Dibangun untuk mencakup logika bisnis dunia nyata secara *end-to-end*, mulai dari validasi geolokasi GPS hingga sinkronisasi otomatis status cuti terhadap potongan gaji.

---

## 🚀 Tech Stack

### Frontend
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State & Networking:** Fetch API, React Hooks

### Backend
* **Framework:** FastAPI (Python)
* **ORM:** SQLAlchemy
* **Database:** PostgreSQL
* **Utilities:** Datetime / Timezone management (WIB)

---

## ✨ Key Features

1. **Real-Time Attendance & Geolocation**
   * Fitur *Clock In* dan *Clock Out* harian dilengkapi validasi waktu otomatis (zona waktu WIB) serta tangkapan titik koordinat GPS (*Latitude & Longitude*) yang terintegrasi langsung dengan Google Maps.
2. **Employee Leave & Permission Management**
   * Karyawan dapat mengajukan cuti tahunan, sakit, atau izin secara mandiri melalui *dashboard* dengan memilih rentang tanggal dan alasan.
   * Panel *approval* khusus Admin/Payroll untuk menyetujui (*Approved*) atau menolak (*Rejected*) pengajuan cuti secara *real-time*.
3. **Automated Payroll Engine**
   * Kalkulasi slip gaji bulanan otomatis yang transparan mencakup: Gaji Pokok, Bonus Tepat Waktu, Bonus Lembur (*Overtime*), Potongan Keterlambatan, hingga iuran BPJS (Kesehatan & JHT).
   * **Smart Leave Integration:** Hari-hari cuti yang berstatus *Approved* secara otomatis mengecualikan karyawan dari potongan alfa/ketidakhadiran secara adil.
4. **Multi-Role Access Control**
   * Hak akses berbasis peran terpisah antara **Karyawan** (Dashboard mandiri) dan **Admin/Payroll** (Manajemen data & rekapitulasi gaji).

---

## 📂 Project Structure

```text
absensi-app/
│
├── backend/                  # FastAPI Backend Server
│   ├── app/
│   │   ├── routers/          # Endpoint API (attendance, payroll, leaves, dll)
│   │   ├── models.py         # SQLAlchemy Database Models
│   │   └── database.py       # DB Connection Setup
│   └── requirements.txt      # Python Dependencies
│
├── frontend/                 # Next.js Frontend Application
│   ├── src/app/              # App Router Pages (dashboard, admin, login)
│   └── package.json          # Node Dependencies
│
├── docker-compose.yml        # Docker orchestration config
└── .gitignore