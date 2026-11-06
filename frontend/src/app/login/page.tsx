"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("danar@example.com");
  const [password, setPassword] = useState<string>("password123");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (savedSession) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(
          "user_session",
          JSON.stringify({
            user_id: data.user_id,
            name: data.name,
            role: data.role,
          })
        );
        router.push("/dashboard");
      } else {
        const detail = data.detail;
        const errorText =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail.map((err) => err.msg).join(", ")
            : "Login gagal";
        setMessage(errorText);
      }
    } catch (error) {
      setMessage("Gagal terhubung ke server backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl text-indigo-400 mb-2">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Login Absensi App</h1>
          <p className="text-slate-400 text-sm">Masuk ke akun pengguna untuk presensi</p>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg text-sm bg-rose-950/50 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <Lock className="w-4 h-4" /> {loading ? "Memproses..." : "Masuk Akun"}
          </button>
        </form>
        <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800">
       Belum punya akun?{" "}
       <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
         Daftar di sini
       </Link>
     </div>
      </div>
    </main>
  );
}