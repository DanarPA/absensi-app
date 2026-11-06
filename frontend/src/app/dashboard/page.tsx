"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle, History, UserCheck } from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  notes: string | null;
}

interface UserSession {
  user_id: number;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession) {
      router.push("/login");
    } else {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
      fetchHistory(parsedSession.user_id);
    }
  }, [router]);

  const fetchHistory = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/attendance/history/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat absensi:", error);
    }
  };

  const parseErrorMessage = (detail: any): string => {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((err) => err.msg || "Terjadi kesalahan").join(", ");
    }
    return "Gagal memproses request";
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  const handleClockIn = async () => {
    if (!session) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/attendance/clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user_id, notes: notes || null }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Clock In berhasil!", type: "success" });
        setNotes("");
        fetchHistory(session.user_id);
      } else {
        setMessage({ text: parseErrorMessage(data.detail), type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Gagal terhubung ke server backend", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!session) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/attendance/clock-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user_id }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Clock Out berhasil!", type: "success" });
        fetchHistory(session.user_id);
      } else {
        setMessage({ text: parseErrorMessage(data.detail), type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Gagal terhubung ke server backend", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="text-indigo-500" /> System Absensi Online
            </h1>
            <p className="text-slate-400 text-sm mt-1">Portfolio Full-Stack (FastAPI + Next.js)</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{session.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm px-3.5 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/50 border-rose-500/50 text-rose-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Action Panel */}
        <section className="bg-slate-800/50 border border-slate-800 rounded-xl p-6 space-y-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-200">Presensi Hari Ini</h2>
          
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Catatan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: WFH / Meeting Klien..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
            >
              <LogIn className="w-5 h-5" /> Clock In
            </button>

            <button
              onClick={handleClockOut}
              disabled={loading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-5 h-5" /> Clock Out
            </button>
          </div>
        </section>

        {/* History Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <History className="text-indigo-400" /> Riwayat Absensi Saya
          </h2>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 text-sm">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Belum ada riwayat absensi.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
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
          </div>
        </section>

      </div>
    </main>
  );
}