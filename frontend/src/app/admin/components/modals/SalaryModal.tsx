import { X, User, ShieldCheck } from "lucide-react";

export default function SalaryModal({ 
  isModalOpen, 
  setIsModalOpen, 
  targetUserForSalary, 
  customBaseSalary, 
  setCustomBaseSalary, 
  handleSaveCustomSalary, 
  isPayroll 
}: any) {
  if (!isModalOpen || !targetUserForSalary) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Atur Gaji Pokok
            </h3>
            <p className="text-xs text-slate-400">Perbarui nominal gaji dasar untuk perhitungan payroll bulanan</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-slate-200 transition p-1 bg-slate-800/50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Karyawan */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{targetUserForSalary.name}</div>
              <div className="text-xs text-slate-400">{targetUserForSalary.email || "-"}</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {targetUserForSalary.role}
          </span>
        </div>

        {/* Input Gaji Pokok */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Nominal Gaji Pokok (Rp)</span>
            {!isPayroll && (
              <span className="text-amber-400 text-[10px] normal-case">
                🔒 Khusus Role Payroll
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-sm font-mono text-slate-400">Rp</span>
            <input
              type="number"
              disabled={!isPayroll}
              value={customBaseSalary}
              onChange={(e) => setCustomBaseSalary(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-base text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Batal
          </button>
          {isPayroll && (
            <button
              type="button"
              onClick={handleSaveCustomSalary}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          )}
        </div>

      </div>
    </div>
  );
}