"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, AlertCircle, CheckCircle, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "employee",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Pendaftaran berhasil! Mengalihkan ke halaman login...", type: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        const detail = data.detail;
        const errorText =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail.map((err) => err.msg).join(", ")
            : "Pendaftaran gagal";
        setMessage({ text: errorText, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Gagal terhubung ke server backend", type: "error" });
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
          <h1 className="text-2xl font-bold text-white">Daftar Akun Baru</h1>
          <p className="text-slate-400 text-sm">Buat akun karyawan untuk mengakses sistem absensi</p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-lg text-sm flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/50 border-rose-500/50 text-rose-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">NAMA LENGKAP</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Danar Putera"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
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
              placeholder="••••••••"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" /> {loading ? "Mendaftarkan..." : "Daftar Akun"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
            Login di sini
          </Link>
        </div>
      </div>
    </main>
  );
}