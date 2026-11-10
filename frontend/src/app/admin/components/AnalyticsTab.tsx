interface AnalyticsTabProps {
  attendanceList: any[];
  userList: any[];
}

export default function AnalyticsTab({ attendanceList, userList }: AnalyticsTabProps) {
  const onTimeRatio = attendanceList.length > 0 
    ? Math.round((attendanceList.filter(i => i.status === "On Time").length / attendanceList.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Grafik & Tren Kehadiran Karyawan</h2>
          <p className="text-slate-400 text-sm">Visualisasi data rekapitulasi, performa kedisiplinan, dan jam operasional staf.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tingkat Ketepatan Waktu</span>
            <div className="text-3xl font-bold font-mono text-emerald-400">{onTimeRatio}%</div>
            <p className="text-xs text-slate-500">Dari total seluruh log kehadiran tercatat</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Log Tercatat</span>
            <div className="text-3xl font-bold font-mono text-indigo-400">{attendanceList.length}</div>
            <p className="text-xs text-slate-500">Akumulasi seluruh sesi absensi</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Pengguna Aktif</span>
            <div className="text-3xl font-bold font-mono text-amber-400">{userList.length}</div>
            <p className="text-xs text-slate-500">Karyawan terdaftar dalam sistem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Visualisasi Kehadiran (Senin - Jumat)</h3>
            <div className="space-y-3 pt-2">
              {[
                { day: "Senin", hadir: 3, total: 3 },
                { day: "Selasa", hadir: 2, total: 3 },
                { day: "Rabu", hadir: 3, total: 3 },
                { day: "Kamis", hadir: 1, total: 3 },
                { day: "Jumat", hadir: 0, total: 3 },
              ].map((item, idx) => {
                const percentage = (item.hadir / item.total) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-300">{item.day}</span>
                      <span className="font-mono text-emerald-400">{item.hadir} / {item.total} Hadir</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Peak Late Hours (Jam Sering Telat)</h3>
            <div className="space-y-2.5">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                <span className="text-amber-400 font-mono font-bold">08:30 - 09:00</span>
                <span className="text-slate-300">Jam Rawan Pagi</span>
                <span className="font-bold text-amber-400">65%</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                <span className="text-indigo-400 font-mono font-bold">09:00 - 09:30</span>
                <span className="text-slate-300">Menengah</span>
                <span className="font-bold text-indigo-400">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}