"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Ambil data user, antisipasi jika dibungkus dalam key 'user' atau langsung
        const sessionData = data.user || data.data || data;

        // Pastikan properti id tersedia (mengantisipasi jika properti bernama user_id)
        if (!sessionData.id && sessionData.user_id) {
          sessionData.id = sessionData.user_id;
        }

        // Simpan sesi user yang valid ke localStorage
        localStorage.setItem("user_session", JSON.stringify(sessionData));

        // Redirect berdasarkan role (Admin dan Payroll masuk ke /admin)
        const userRole = sessionData.role ? sessionData.role.toLowerCase() : "";

        if (userRole === "admin" || userRole === "payroll") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.detail || "Email atau password salah");
      }
    } catch (err) {
      setError("Gagal terhubung ke server backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Login Sistem Presensi</h1>
          <p className="text-xs text-slate-400">Silakan masuk menggunakan akun terdaftar</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" /> {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

      </div>
    </main>
  );
}