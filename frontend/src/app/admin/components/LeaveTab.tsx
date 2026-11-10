import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Clock, User, RefreshCw, AlertCircle } from "lucide-react";

export default function LeaveTab() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/admin/leaves");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeaves(data);
      }
    } catch (err) {
      console.error("Gagal memuat data cuti:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/leaves/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeaves();
      } else {
        alert("Gagal memperbarui status cuti");
      }
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Manajemen Pengajuan Cuti & Izin</h2>
            <p className="text-slate-400 text-sm">Setujui atau tolak permohonan cuti dan izin dari karyawan.</p>
          </div>
          <button
            onClick={fetchLeaves}
            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-medium cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                <th className="py-4 px-5">Karyawan</th>
                <th className="py-4 px-5">Jenis Cuti</th>
                <th className="py-4 px-5">Tanggal Mulai - Selesai</th>
                <th className="py-4 px-5">Alasan</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans text-sm">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    Belum ada pengajuan cuti atau izin.
                  </td>
                </tr>
              ) : (
                leaves.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition group">
                    <td className="py-4 px-5 font-medium text-white flex items-center gap-3">
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-400 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">{item.user_name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {item.user_id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.leave_type}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono text-xs text-slate-300">
                      {item.start_date} s/d {item.end_date}
                    </td>

                    <td className="py-4 px-5 text-slate-300 text-xs max-w-xs truncate">
                      {item.reason || "-"}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                        item.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "Rejected"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {item.status === "Approved" && <CheckCircle className="w-3.5 h-3.5" />}
                        {item.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {item.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      {item.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(item.id, "Approved")}
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, "Rejected")}
                            className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/30 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Selesai</span>
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
  );
}