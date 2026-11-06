"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Search, RefreshCw, Calendar, FileSpreadsheet } from "lucide-react";

interface AdminAttendanceRecord {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  notes: string | null;
}

export default function AdminAttendanceHistoryPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  const [attendanceList, setAttendanceList] = useState<AdminAttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(savedSession);
    
    // Proteksi Hak Akses: Jika BUKAN admin, kunci halaman ini!
    if (parsed.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setSession(parsed);
    fetchAttendanceHistory(parsed.role);
  }, [router]);

  const fetchAttendanceHistory = async (role: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/attendance/all?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data);
      } else if (res.status === 403) {
        alert("Akses ditolak! Anda tidak memiliki wewenang admin.");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat absensi:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = attendanceList.filter(
    (item) =>
      item.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery)
  );

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Dashboard
          </button>
          
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Mode Akses Terproteksi (Admin Only)
          </span>
        </div>

        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Calendar className="text-indigo-400 w-8 h-8" /> Sub-Menu: Riwayat Absensi Karyawan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Daftar lengkap rekaman kehadiran seluruh anggota tim. Menu ini hanya dapat diakses oleh Role Admin.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan, email, atau tanggal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => session && fetchAttendanceHistory(session.role)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {/* Tabel Data Absensi */}
        <section className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 text-sm">
                <th className="p-4">Karyawan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Clock In</th>
                <th className="p-4">Clock Out</th>
                <th className="p-4">Status</th>
                <th className="p-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    {loading ? "Memuat data presensi..." : "Tidak ada data riwayat absensi ditemukan."}
                  </td>
                </tr>
              ) : (
                filteredList.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-semibold text-white">{row.user_name}</div>
                      <div className="text-xs text-slate-400">{row.user_email}</div>
                    </td>
                    <td className="p-4 font-mono">{row.date}</td>
                    <td className="p-4 font-mono text-emerald-400">
                      {row.clock_in ? new Date(row.clock_in).toLocaleTimeString("id-ID") : "-"}
                    </td>
                    <td className="p-4 font-mono text-rose-400">
                      {row.clock_out ? new Date(row.clock_out).toLocaleTimeString("id-ID") : "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === "On Time"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{row.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}