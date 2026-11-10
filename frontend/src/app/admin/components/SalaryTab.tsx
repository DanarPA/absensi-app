import { useState } from "react";
import { CreditCard, Users, Calendar, RefreshCw, User, Eye, Search, Settings, FileText } from "lucide-react";

interface SalaryTabProps {
  payrollData: any;
  payrollPeriod: { month: number; year: number };
  setPayrollPeriod: (period: { month: number; year: number }) => void;
  fetchPayrollData: () => void;
  setSelectedPayrollDetail: (item: any) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  setTargetUserForSalary: (item: any) => void;
  setCustomBaseSalary: (val: number) => void;
  setIsIndividualSalaryModalOpen: (open: boolean) => void;
  isPayroll: boolean; // Mengetahui apakah user yang login adalah role payroll
}

export default function SalaryTab({
  payrollData = [],
  payrollPeriod,
  setPayrollPeriod,
  fetchPayrollData,
  setSelectedPayrollDetail,
  setIsDetailModalOpen,
  setTargetUserForSalary,
  setCustomBaseSalary,
  setIsIndividualSalaryModalOpen,
  isPayroll,
}: SalaryTabProps) {
  // Sub-menu internal di dalam tab Gaji: "monthly" (Rincian Bulanan) atau "master" (Atur Gaji Pokok)
  const [subActiveTab, setSubActiveTab] = useState<"monthly" | "master">("monthly");
  const [salarySearchQuery, setSalarySearchQuery] = useState("");

  const safePayrollData = Array.isArray(payrollData) 
    ? payrollData 
    : (payrollData?.data || payrollData?.payrolls || []);

  const totalPengeluaranGaji = safePayrollData.reduce((acc: number, curr: any) => acc + (curr.net_salary || 0), 0);

  const filteredPayrollData = safePayrollData.filter((item: any) => {
    const query = salarySearchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query) || false;
    const emailMatch = item.email?.toLowerCase().includes(query) || false;
    const roleMatch = item.role?.toLowerCase().includes(query) || false;
    return nameMatch || emailMatch || roleMatch;
  });

  const monthsList = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  return (
    <div className="space-y-6">
      {/* NAVIGASI SUB-MENU KECIL */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setSubActiveTab("monthly")}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            subActiveTab === "monthly"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Rincian Gaji Bulanan & Slip Gaji
        </button>
        <button
          onClick={() => setSubActiveTab("master")}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            subActiveTab === "master"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" /> Atur Gaji Pokok (Master Gaji)
          {!isPayroll && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Read Only</span>}
        </button>
      </div>

      {/* KONTEN SUB-MENU 1: RINCIAN GAJI BULANAN */}
      {subActiveTab === "monthly" && (
        <div className="space-y-6">
          {/* KARTU STATISTIK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran Gaji</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  Rp {totalPengeluaranGaji.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Penerima Gaji</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">{safePayrollData.length} Karyawan</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode Aktif</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                  {monthsList.find(m => m.value === payrollPeriod.month)?.label || `Bulan ${payrollPeriod.month}`} {payrollPeriod.year}
                </div>
              </div>
            </div>
          </div>

          {/* TABEL REKAPITULASI BULANAN */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Rekapitulasi & Slip Gaji Bulanan</h2>
                <p className="text-slate-400 text-sm">Pilih periode bulan untuk melihat rincian kehadiran dan mengunduh slip gaji.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <select
                  value={payrollPeriod.month}
                  onChange={(e) => setPayrollPeriod({ ...payrollPeriod, month: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                <select
                  value={payrollPeriod.year}
                  onChange={(e) => setPayrollPeriod({ ...payrollPeriod, year: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari karyawan..."
                    value={salarySearchQuery}
                    onChange={(e) => setSalarySearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <button
                  onClick={fetchPayrollData}
                  className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-medium cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                    <th className="py-4 px-5">Karyawan</th>
                    <th className="py-4 px-5">Gaji Pokok (Bulan Ini)</th>
                    <th className="py-4 px-5">Ringkasan Kehadiran</th>
                    <th className="py-4 px-5">Gaji Bersih (Net)</th>
                    <th className="py-4 px-5 text-center">Aksi Slip Gaji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-sm">
                  {filteredPayrollData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-500 font-sans">
                        Tidak ada data rekapitulasi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPayrollData.map((item: any) => (
                      <tr key={item.user_id} className="hover:bg-slate-800/20 transition group">
                        <td className="py-4 px-5 font-sans font-medium text-white flex items-center gap-3">
                          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition">{item.name}</div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{item.role}</span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-5 text-slate-300 font-medium">
                          Rp {(item.base_salary || 0).toLocaleString("id-ID")}
                        </td>
                        
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2 text-xs font-medium font-sans">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {item.total_hadir || 0} Hadir
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.tepat_waktu || 0} Tepat
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {item.terlambat || 0} Telat
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-bold text-emerald-400 text-base">
                          Rp {(item.net_salary || 0).toLocaleString("id-ID")}
                        </td>

                        <td className="py-4 px-5 text-center font-sans">
                          <button
                            onClick={() => {
                              setSelectedPayrollDetail(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-xl border border-indigo-500/30 transition text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Rincian & PDF
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
      )}

      {/* KONTEN SUB-MENU 2: ATUR GAJI POKOK (MASTER GAJI KARYAWAN) */}
      {subActiveTab === "master" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Master Gaji Pokok Karyawan</h2>
              <p className="text-slate-400 text-sm">
                {isPayroll 
                  ? "Atur dan perbarui nominal gaji pokok berkala untuk setiap staf." 
                  : "Daftar nominal gaji pokok master karyawan (Mode Lihat untuk Admin)."}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={salarySearchQuery}
                onChange={(e) => setSalarySearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                  <th className="py-4 px-5">Karyawan</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Jabatan / Role</th>
                  <th className="py-4 px-5">Gaji Pokok Master (Base Salary)</th>
                  <th className="py-4 px-5 text-center">Aksi Pengaturan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-sm">
                {filteredPayrollData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 font-sans">
                      Tidak ada data master karyawan.
                    </td>
                  </tr>
                ) : (
                  filteredPayrollData.map((item: any) => (
                    <tr key={item.user_id} className="hover:bg-slate-800/20 transition group">
                      <td className="py-4 px-5 font-sans font-medium text-white flex items-center gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition">{item.name}</div>
                      </td>

                      <td className="py-4 px-5 text-slate-400 font-sans text-xs">
                        {item.email}
                      </td>

                      <td className="py-4 px-5 font-sans">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.role}
                        </span>
                      </td>
                      
                      <td className="py-4 px-5 text-emerald-400 font-bold text-base">
                        Rp {(item.base_salary || 0).toLocaleString("id-ID")}
                      </td>

                      <td className="py-4 px-5 text-center font-sans">
                        {isPayroll ? (
                          <button
                            onClick={() => {
                              setTargetUserForSalary(item);
                              setCustomBaseSalary(item.base_salary || 0);
                              setIsIndividualSalaryModalOpen(true);
                            }}
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 transition text-xs font-semibold shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Settings className="w-3.5 h-3.5" /> Ubah Gaji Pokok
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Khusus Role Payroll</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}