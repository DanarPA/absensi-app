"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, MapPin, Search, RefreshCw, Calendar, User, Trash2, LayoutDashboard, Users, ArrowLeft } from "lucide-react";

interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name: string;
  role: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: number; name: string; role: string; email: string } | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(savedSession);
    if (parsed.role.toLowerCase() !== "admin") {
      router.push("/dashboard");
      return;
    }
    setSession(parsed);
    fetchAdminAttendance();
  }, [router]);

  const fetchAdminAttendance = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/attendance`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data presensi admin");
        const data = await res.json();
        setRecords(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Yakin ingin menghapus data presensi ini?")) return;

    fetch(`${API_URL}/admin/attendance/${id}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal menghapus data");
        fetchAdminAttendance();
      })
      .catch((err) => alert(err.message));
  };

  const filteredRecords = records.filter(
    (item) =>
      item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* SIDEBAR DI KIRI */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide">Admin Panel</h2>
              <span className="text-xs text-slate-400">Sistem Presensi</span>
            </div>
          </div>

          {/* Menu Navigasi Sidebar */}
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-sm font-medium transition">
              <LayoutDashboard className="w-4 h-4" /> Data Kehadiran
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" /> Ke Dashboard User
            </button>
          </nav>
        </div>

        {/* User Profile di Bawah Sidebar */}
        <div className="p-4 border-t border-slate-800 m-4 bg-slate-950/40 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-800 p-2 rounded-full text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{session.name}</div>
              <span className="text-xs text-amber-400 uppercase font-semibold">{session.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* KONTROL & KONTEN UTAMA DI KANAN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-10 space-y-8">
        
        {/* Header Atas */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Manajemen Kehadiran Karyawan</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Pantau catatan waktu, status, dan titik koordinat GPS secara real-time.
            </p>
          </div>

          {/* Tombol kembali versi mobile (muncul jika layar kecil) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 text-rose-300 text-xs px-3 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Toolbar (Pencarian & Refresh) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={fetchAdminAttendance}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {/* Tabel Data Presensi */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 text-xs uppercase tracking-wider">
                  <th className="p-4">Karyawan</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4">Lokasi Maps</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Memuat data presensi...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada catatan presensi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      
                      {/* Karyawan */}
                      <td className="p-4 font-medium text-white flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-xl text-amber-400 shrink-0 border border-slate-700">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{item.user_name}</div>
                          <span className="text-xs text-slate-400 uppercase">({item.role})</span>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="p-4 text-slate-300 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> 
                          <span>{item.date}</span>
                        </div>
                      </td>

                      {/* Clock In */}
                      <td className="p-4 font-mono text-emerald-400 text-sm">
                        {item.clock_in ? item.clock_in.split("T")[1]?.slice(0, 8).replace(/:/g, ".") || item.clock_in : "-"}
                      </td>

                      {/* Clock Out */}
                      <td className="p-4 font-mono text-rose-400 text-sm">
                        {item.clock_out ? item.clock_out.split("T")[1]?.slice(0, 8).replace(/:/g, ".") || item.clock_out : "-"}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {item.status ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {item.status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Catatan */}
                      <td className="p-4 text-slate-300 text-xs max-w-xs truncate">
                        {item.notes || "-"}
                      </td>

                      {/* Lokasi Maps */}
                      <td className="p-4">
                        {item.latitude && item.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1.5 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 w-fit transition"
                          >
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs italic">
                            - (Tanpa GPS)
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/20 transition flex items-center gap-1 text-xs"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}