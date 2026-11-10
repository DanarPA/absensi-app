import { LayoutDashboard, Users, BarChart3, CreditCard, ShieldAlert, User, LogOut, CalendarDays } from "lucide-react";

interface SidebarProps {
  session: { name: string; role: string; email: string };
  activeTab: string;
  setActiveTab: (tab: any) => void;
  status: any;
  loading: boolean;
  currentTime: string;
  handleClockIn: () => void;
  handleClockOut: () => void;
  handleLogout: () => void;
  formatTimeStr: (str: string | null) => string;
}

export default function Sidebar({
  session,
  activeTab,
  setActiveTab,
  status,
  loading,
  currentTime,
  handleClockIn,
  handleClockOut,
  handleLogout,
  formatTimeStr,
}: SidebarProps) {
  const isPayroll = session.role.toLowerCase() === "payroll";

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex sticky top-0 h-screen shrink-0">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide">
              {isPayroll ? "Payroll Panel" : "Admin Panel"}
            </h2>
            <span className="text-xs text-slate-400">Sistem Presensi</span>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "attendance" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Data Kehadiran
          </button>

          {!isPayroll && (
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "users" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <Users className="w-4 h-4" /> Daftar Pengguna
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "analytics" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <BarChart3 className="w-4 h-4" /> Analitik & Grafik
          </button>

          <button
            onClick={() => setActiveTab("salary")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "salary" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <CreditCard className="w-4 h-4" /> Penghitungan Gaji
          </button>

          {/* Menu Manajemen Cuti */}
          <button
            onClick={() => setActiveTab("leaves")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "leaves" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <CalendarDays className="w-4 h-4" /> Manajemen Cuti
          </button>
        </nav>
      </div>

      <div className="px-4 py-3 mx-4 mb-2 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Absensi Saya</span>
          {status?.status && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              status.status === "On Time" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {status.status}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800/80">
          <span className="text-xs text-slate-400">Masuk:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatTimeStr(status?.clock_in)}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleClockIn}
            disabled={loading || !!status?.clock_in}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs py-2 rounded-lg font-medium transition"
          >
            {status?.clock_in ? "Sudah In" : "Clock In"}
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !status?.clock_in || !!status?.clock_out}
            className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs py-2 rounded-lg font-medium transition"
          >
            {status?.clock_out ? "Sudah Out" : "Clock Out"}
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 m-4 mt-0 bg-slate-950/40 rounded-xl">
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
  );
}