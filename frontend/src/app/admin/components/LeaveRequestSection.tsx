"use client";

import { useState, useEffect } from "react";
import { CalendarDays, PlusCircle, Clock, CheckCircle, XCircle } from "lucide-react";

export default function LeaveRequestSection({ userId }: { userId: number }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMyLeaves = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/leaves");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter hanya cuti milik karyawan yang sedang login
        const myLeaves = data.filter((item: any) => item.user_id === userId);
        setLeaves(myLeaves);
      }
    } catch (err) {
      console.error("Gagal memuat data cuti:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchMyLeaves();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Harap isi tanggal mulai dan selesai cuti!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/admin/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason,
        }),
      });

      if (res.ok) {
        alert("Pengajuan cuti berhasil dikirim!");
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchMyLeaves();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Gagal mengajukan cuti");
      }
    } catch (err) {
      console.error("Error submitting leave:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Pengajuan Cuti */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Ajukan Cuti / Izin</h2>
            <p className="text-slate-400 text-xs">Isi form untuk permohonan baru.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-xs">Jenis Pengajuan</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-equal w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-xs">Alasan / Keterangan</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Keperluan keluarga / Surat dokter terlampir"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" /> {loading ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </form>
      </div>

      {/* Riwayat Pengajuan Cuti Karyawan */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 lg:col-span-2">
        <div>
          <h2 className="text-base font-bold text-white">Riwayat Pengajuan Cuti Saya</h2>
          <p className="text-slate-400 text-xs">Pantau status persetujuan cuti atau izin yang telah dikirim.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Alasan</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans text-xs">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Belum ada riwayat pengajuan cuti.
                  </td>
                </tr>
              ) : (
                leaves.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.leave_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.start_date} s/d {item.end_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {item.reason || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                        item.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "Rejected"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {item.status === "Approved" && <CheckCircle className="w-3 h-3" />}
                        {item.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {item.status === "Pending" && <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}