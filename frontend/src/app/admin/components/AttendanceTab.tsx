import { Search, Filter, Download, RefreshCw, User, Calendar, MapPin, Trash2 } from "lucide-react";

interface AttendanceTabProps {
  attendanceList: any[];
  filteredAttendance: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
  totalUsersCount: number;
  hadirHariIniCount: number;
  onTimeCount: number;
  lateCount: number;
  belumAbsenCount: number;
  handleDownloadPDF: () => void;
  handleDownloadCSV: () => void;
  fetchAttendanceData: () => void;
  handleDeleteAttendance: (id: number) => void;
  formatTimeStr: (str: string | null) => string;
}

export default function AttendanceTab({
  filteredAttendance,
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showFilterDropdown,
  setShowFilterDropdown,
  totalUsersCount,
  hadirHariIniCount,
  onTimeCount,
  lateCount,
  belumAbsenCount,
  handleDownloadPDF,
  handleDownloadCSV,
  fetchAttendanceData,
  handleDeleteAttendance,
  formatTimeStr,
}: AttendanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalUsersCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{hadirHariIniCount} <span className="text-xs font-normal text-slate-400">({onTimeCount} Tepat)</span></div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terlambat</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{lateCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Belum Absen</div>
            <div className="text-2xl font-bold text-rose-400 mt-0.5">{belumAbsenCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari nama karyawan atau status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2.5 rounded-xl border text-sm transition flex items-center gap-1.5 font-medium shrink-0 ${
                startDate || endDate 
                  ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30" 
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Filter Tanggal</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-sm px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-sm px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={fetchAttendanceData}
              className="flex-1 sm:flex-none bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-sm px-3 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilterDropdown && (
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 text-xs">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline px-2 py-1"
                >
                  Reset Filter
                </button>
              )}
              <button
                onClick={() => setShowFilterDropdown(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                <th className="p-4">Karyawan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Clock In</th>
                <th className="p-4">Clock Out</th>
                <th className="p-4">Status</th>
                <th className="p-4">Catatan</th>
                <th className="p-4">Lokasi Maps</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data kehadiran yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-medium text-white flex items-center gap-2.5">
                      <div className="bg-slate-800 p-2 rounded-lg text-indigo-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{item.user_name || "Karyawan"}</div>
                       <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                            {item.role || item.user_role ? (item.role || item.user_role).toUpperCase() : "KARYAWAN"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {item.date}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-emerald-400">
                      {formatTimeStr(item.clock_in)}
                    </td>
                    <td className="p-4 font-mono text-rose-400">
                      {formatTimeStr(item.clock_out)}
                    </td>
                    <td className="p-4">
                      {item.status ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === "On Time" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {item.status}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 text-slate-300 text-xs max-w-xs truncate">
                      {item.notes || "-"}
                    </td>
                    <td className="p-4">
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 text-xs bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 w-fit"
                        >
                          <MapPin className="w-3.5 h-3.5" /> {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteAttendance(item.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/20 transition"
                        title="Hapus Log"
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
    </div>
  );
}