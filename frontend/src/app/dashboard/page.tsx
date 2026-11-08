"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, LogOut, CheckCircle, AlertCircle, Calendar, History } from "lucide-react";

interface AttendanceLogItem {
  id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: number; name: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ clock_in: string | null; clock_out: string | null; status: string | null; notes: string | null } | null>(null);
  const [history, setHistory] = useState<AttendanceLogItem[]>([]);
  
  // State untuk jam digital real-time WIB
  const [currentTime, setCurrentTime] = useState<string>("--:--:--");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(savedSession);
    
    if (parsed && parsed.id) {
      setSession(parsed);
      fetchStatus(parsed.id);
      fetchHistory(parsed.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Efek untuk jam digital real-time WIB
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat("en-GB", options).format(now);
      setCurrentTime(timeString.replace(/:/g, "."));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = (userId: number) => {
    fetch(`${API_URL}/attendance/status/${userId}`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error("Gagal memuat status:", err));
  };

  const fetchHistory = (userId: number) => {
    fetch(`${API_URL}/attendance/history/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data && Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat riwayat:", err);
        setHistory([]);
      });
  };

  const handleClockIn = () => {
    if (!session) return;
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          executeClockIn(session.id, lat, lon);
        },
        (error) => {
          console.warn("GPS Warning:", error.message);
          executeClockIn(session.id, null, null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      executeClockIn(session.id, null, null);
    }
  };

  const executeClockIn = (userId: number, lat: number | null, lon: number | null) => {
    fetch(`${API_URL}/attendance/clock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        latitude: lat,
        longitude: lon,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal melakukan Clock In");
        
        const successMessage = typeof data === "string" 
          ? data 
          : (data.message || data.msg || "Clock In Berhasil");
        alert(successMessage);

        fetchStatus(userId);
        fetchHistory(userId);
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoading(false));
  };

  const handleClockOut = () => {
    if (!session) return;
    setLoading(true);

    fetch(`${API_URL}/attendance/clock-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal melakukan Clock Out");
        
        const successMessage = typeof data === "string" 
          ? data 
          : (data.message || data.msg || "Clock Out Berhasil");
        alert(successMessage);

        fetchStatus(session.id);
        fetchHistory(session.id);
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  const formatTimeStr = (isoString: string | null) => {
    if (!isoString) return "-";
    if (isoString.includes("T")) {
      return isoString.split("T")[1]?.slice(0, 8).replace(/:/g, ".") || isoString;
    }
    return isoString;
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Presensi</h1>
            <p className="text-slate-400 text-sm">Selamat datang, <span className="text-amber-400 font-semibold">{session.name}</span> ({session.role.toUpperCase()})</p>
          </div>
          <div className="flex items-center gap-3">
            {session.role.toLowerCase() === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
              >
                Panel Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm px-4 py-2 rounded-lg transition flex items-center gap-1.5 font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Status Presensi Hari Ini */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> Status Kehadiran Hari Ini
            </h2>
            {status?.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                {status.status}
              </span>
            )}
          </div>

          {/* JAM DIGITAL REAL-TIME WIB */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-center">
            <div className="text-xs text-indigo-300 font-medium uppercase tracking-widest mb-1">Waktu Saat Ini (WIB)</div>
            <div className="text-3xl font-mono font-bold text-indigo-400 tracking-wider">
              {currentTime}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block mb-1">Jam Clock In</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {formatTimeStr(status?.clock_in)}
              </span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block mb-1">Jam Clock Out</span>
              <span className="text-xl font-mono font-bold text-rose-400">
                {formatTimeStr(status?.clock_out)}
              </span>
            </div>
          </div>

          {status?.notes && (
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Catatan: {status.notes}</span>
            </div>
          )}

          {/* Tombol Aksi Clock In / Clock Out */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleClockIn}
              disabled={loading || !!status?.clock_in}
              className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                status?.clock_in
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {status?.clock_in ? "Sudah Clock In" : "Clock In Sekarang"}
            </button>

            <button
              onClick={handleClockOut}
              disabled={loading || !status?.clock_in || !!status?.clock_out}
              className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                !status?.clock_in || status?.clock_out
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
              }`}
            >
              <LogOut className="w-5 h-5" />
              {status?.clock_out ? "Sudah Clock Out" : "Clock Out"}
            </button>
          </div>
        </div>

        {/* Riwayat Kehadiran Saya */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Riwayat Kehadiran Saya
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 text-xs uppercase tracking-wider">
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan</th>
                  <th className="p-3">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Belum ada riwayat kehadiran.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-300 flex items-center gap-1 pt-4">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{item.date}</span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400">
                        {formatTimeStr(item.clock_in)}
                      </td>
                      <td className="p-3 font-mono text-rose-400">
                        {formatTimeStr(item.clock_out)}
                      </td>
                      <td className="p-3">
                        {item.status ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {item.status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-slate-300 text-xs max-w-xs truncate">
                        {item.notes || "-"}
                      </td>
                      <td className="p-3">
                        {item.latitude && item.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 text-xs bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 w-fit"
                          >
                            <MapPin className="w-3 h-3" /> Cek Peta
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}