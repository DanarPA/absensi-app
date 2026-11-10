import { X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DetailModalProps {
  selectedPayrollDetail: any;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
}

export default function DetailSalaryModal({ selectedPayrollDetail, isDetailModalOpen, setIsDetailModalOpen }: DetailModalProps) {
  if (!isDetailModalOpen || !selectedPayrollDetail) return null;

const handleDownloadSlipGaji = () => {
    const doc = new jsPDF();
    const item = selectedPayrollDetail;
    const currentDate = new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });

  // --- TAMBAHAN WATERMARK / LOGO PERUSAHAAN DI TENGAH (BLUR/TRANSPARAN) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(45);
    // Warna abu-abu sangat muda (efek samar/transparan)
    doc.setTextColor(230, 235, 245);
    
    // Cetak pas di tengah halaman A4 (X: 105, Y: 148) dengan opsi alignment center
    doc.text("DPA - ATTEND", 105, 148, { angle: 45, align: "center" });
    // -----------------------------------------------------------------------

    // Kembalikan setting font normal untuk isi dokumen
    doc.setFont("helvetica", "normal");

    // Header Slip Gaji
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("SLIP GAJI KARYAWAN", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("DPA-ATTEND & PAYROLL SYSTEM", 14, 26);
    doc.text(`Tanggal Cetak: ${currentDate}`, 14, 32);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, 38, 196, 38);

    // Informasi Karyawan menggunakan Tabel tanpa border agar sejajar rapi
    autoTable(doc, {
      startY: 42,
      body: [
        ["Nama Karyawan", `: ${item.name}`],
        ["Email", `: ${item.email || "-"}`],
        ["Jabatan / Role", `: ${(item.role || "KARYAWAN").toUpperCase()}`],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 35, fontStyle: "bold", textColor: [100, 116, 139] }, 1: { cellWidth: 140, textColor: [15, 23, 42] } },
    });

    const infoFinalY = (doc as any).lastAutoTable.finalY + 4;
    doc.line(14, infoFinalY, 196, infoFinalY);

    // Rincian Komponen Gaji
    let startY = infoFinalY + 8;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Rincian Pendapatan & Potongan", 14, startY);

    const slipData = [
      ["Gaji Pokok (Base Salary)", `Rp ${item.base_salary.toLocaleString("id-ID")}`],
      ["Bonus Tepat Waktu (On-Time)", `+Rp ${(item.bonus_on_time || 0).toLocaleString("id-ID")}`],
      ["Bonus Lembur (Overtime)", `+Rp ${(item.bonus_lembur || 0).toLocaleString("id-ID")}`],
      ["Denda Keterlambatan", `-Rp ${(item.deduction_late || 0).toLocaleString("id-ID")}`],
      ["BPJS Kesehatan (1%)", `-Rp ${(item.bpjs_kesehatan || 0).toLocaleString("id-ID")}`],
      ["BPJS Ketenagakerjaan / JHT (2%)", `-Rp ${(item.bpjs_jht || 0).toLocaleString("id-ID")}`],
    ];

    autoTable(doc, {
      startY: startY + 6,
      head: [["Komponen Gaji", "Jumlah (IDR)"]],
      body: slipData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 4 },
    });

    // Total Gaji Bersih
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(240, 253, 244);
    doc.rect(14, finalY, 182, 16, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52);
    doc.text("TOTAL GAJI BERSIH (NET SALARY):", 18, finalY + 11);
    doc.text(`Rp ${item.net_salary.toLocaleString("id-ID")}`, 145, finalY + 11);

    // Tanda Tangan
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Mengetahui,", 145, finalY + 35);
    doc.text("Finance / HR Department", 138, finalY + 55);
    doc.line(135, finalY + 52, 190, finalY + 52);

    doc.save(`Slip_Gaji_${item.name.replace(/\s+/g, "_")}.pdf`);
  };
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Rincian Komponen Gaji</h3>
            <p className="text-xs text-slate-400">Detail kalkulasi insentif dan potongan karyawan</p>
          </div>
          <button 
            onClick={() => setIsDetailModalOpen(false)} 
            className="text-slate-400 hover:text-slate-200 transition p-1 bg-slate-800/50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">{selectedPayrollDetail.name}</div>
            <div className="text-xs text-slate-400">{selectedPayrollDetail.email}</div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {selectedPayrollDetail.role}
          </span>
        </div>

        <div className="space-y-4 text-sm font-mono">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-400 font-sans tracking-wider border-b border-slate-800 pb-2">Komponen Utama & Kehadiran</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">Gaji Pokok (Base Salary)</span>
              <span className="text-emerald-400 font-bold">Rp {selectedPayrollDetail.base_salary.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">Total Kehadiran / Tepat / Telat</span>
              <span className="text-slate-200">{selectedPayrollDetail.total_hadir} Hadir ({selectedPayrollDetail.tepat_waktu} Tepat, {selectedPayrollDetail.terlambat} Telat)</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase text-emerald-400 font-sans tracking-wider border-b border-slate-800 pb-2">Rincian Pendapatan / Bonus (+)</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">Bonus Tepat Waktu (On-Time)</span>
              <span className="text-emerald-400">+Rp {(selectedPayrollDetail.bonus_on_time || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">Bonus Lembur (Overtime)</span>
              <span className="text-emerald-400">+Rp ${(selectedPayrollDetail.bonus_lembur || 0).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase text-rose-400 font-sans tracking-wider border-b border-slate-800 pb-2">Rincian Potongan (-)</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">Denda Keterlambatan</span>
              <span className="text-rose-400">-Rp {(selectedPayrollDetail.deduction_late || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">BPJS Kesehatan (1%)</span>
              <span className="text-rose-400">-Rp {(selectedPayrollDetail.bpjs_kesehatan || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-sans">BPJS Ketenagakerjaan / JHT (2%)</span>
              <span className="text-rose-400">-Rp {(selectedPayrollDetail.bpjs_jht || 0).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-300 font-sans">Total Gaji Bersih (Net Salary)</span>
            <span className="text-lg font-bold text-emerald-400">Rp {selectedPayrollDetail.net_salary.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadSlipGaji}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Slip Gaji (PDF)
          </button>
          <button
            type="button"
            onClick={() => setIsDetailModalOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}