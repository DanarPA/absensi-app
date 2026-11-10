"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";

import Sidebar from "./components/Sidebar";
import AttendanceTab from "./components/AttendanceTab";
import UsersTab from "./components/UsersTab";
import AnalyticsTab from "./components/AnalyticsTab";
import SalaryTab from "./components/SalaryTab";
import EditUserModal from "./components/modals/EditUserModal";
import SalaryModal from "./components/modals/SalaryModal";
import DetailSalaryModal from "./components/modals/DetailSalaryModal";

interface AttendanceLogItem {
  id: number;
  user_name?: string;
  user_role?: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  base_salary?: number;
}

interface PayrollItem {
  user_id: number;
  name: string;
  email: string;
  role: string;
  base_salary: number;
  total_hadir: number;
  tepat_waktu: number;
  terlambat: number;
  bonus_on_time: number;
  bonus_lembur: number;
  deduction_late: number;
  bpjs_kesehatan: number;
  bpjs_jht: number;
  total_potongan: number;
  net_salary: number;
}

interface AttendanceStatus {
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: number; name: string; role: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"attendance" | "users" | "analytics" | "salary">("attendance");
  
  const [attendanceList, setAttendanceList] = useState<AttendanceLogItem[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [payrollPeriod, setPayrollPeriod] = useState({ month: 11, year: 2026 });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [currentTime, setCurrentTime] = useState<string>("--:--:--");
  const [status, setStatus] = useState<AttendanceStatus | null>(null);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "", base_salary: 3000000 });

  const [isIndividualSalaryModalOpen, setIsIndividualSalaryModalOpen] = useState(false);
  const [targetUserForSalary, setTargetUserForSalary] = useState<PayrollItem | null>(null);
  const [customBaseSalary, setCustomBaseSalary] = useState<number>(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayrollDetail, setSelectedPayrollDetail] = useState<PayrollItem | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(savedSession);
    if (parsed && parsed.id) {
      setSession(parsed);
      const userRole = parsed.role.toLowerCase();
      if (userRole !== "admin" && userRole !== "payroll") {
        router.push("/dashboard");
        return;
      }
      if (userRole === "payroll" && activeTab === "users") {
        setActiveTab("attendance");
      }

      fetchAttendanceData();
      fetchUserData();
      fetchPayrollData();
      fetchStatus(parsed.id);
    } else {
      router.push("/login");
    }
  }, [router, activeTab]);

  // Otomatis fetch ulang data payroll setiap kali periode bulan atau tahun diubah
  useEffect(() => {
    if (session) {
      fetchPayrollData();
    }
  }, [payrollPeriod]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat("en-GB", options).format(now);
      setCurrentTime(timeString.replace(/:/g, "."));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = (userId: number) => {
    fetch(`${API_URL}/attendance/status/${userId}`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error("Gagal memuat status:", err));
  };

  const fetchAttendanceData = () => {
    fetch(`${API_URL}/admin/attendance`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAttendanceList(data);
        else if (data && Array.isArray(data.logs)) setAttendanceList(data.logs);
        else setAttendanceList([]);
      })
      .catch((err) => console.error("Gagal memuat data kehadiran:", err));
  };

  const fetchUserData = () => {
    fetch(`${API_URL}/admin/users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUserList(data);
        else if (data && Array.isArray(data.users)) setUserList(data.users);
        else setUserList([]);
      })
      .catch((err) => console.error("Gagal memuat data pengguna:", err));
  };

  const fetchPayrollData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/payroll?month=${payrollPeriod.month}&year=${payrollPeriod.year}`);
      const data = await res.json();
      setPayrollData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data payroll", err);
      setPayrollData([]);
    }
  };

  const handleSaveCustomSalary = () => {
    if (!targetUserForSalary) return;

    fetch(`${API_URL}/admin/users/${targetUserForSalary.user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: targetUserForSalary.name,
        email: targetUserForSalary.email,
        role: targetUserForSalary.role,
        base_salary: Number(customBaseSalary),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal memperbarui gaji pokok");
        
        alert("Gaji pokok berhasil diperbarui!");
        setIsIndividualSalaryModalOpen(false);
        fetchPayrollData();
        fetchUserData();
      })
      .catch((err) => alert(err.message));
  };

  const handleDownloadPDF = async () => {
    if (filteredAttendance.length === 0) {
      alert("Tidak ada data kehadiran yang sesuai untuk diexport ke PDF.");
      return;
    }

    const jsPDFModule = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDFModule.default();
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("LAPORAN REKAPITULASI KEHADIRAN KARYAWAN", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode: ${startDate || 'Semua'} s/d ${endDate || 'Hari Ini'}`, 14, 26);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 32);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, 38, 196, 38);

    const tableColumn = ["No", "Nama Karyawan", "Role", "Tanggal", "Clock In", "Clock Out", "Status"];
    const tableRows: any[] = [];

    filteredAttendance.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.user_name || "Karyawan",
        (item.role || item.user_role || "Karyawan").toUpperCase(),
        item.date,
        formatTimeStr(item.clock_in),
        formatTimeStr(item.clock_out),
        item.status || "-",
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 44,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Laporan_Kehadiran_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleDownloadCSV = () => {
    fetch(`${API_URL}/admin/attendance/export-csv`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengunduh CSV");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => {
        if (attendanceList.length === 0) {
          alert("Tidak ada data untuk di-download.");
          return;
        }
        const headers = ["ID", "Nama Karyawan", "Role", "Tanggal", "Clock In", "Clock Out", "Status", "Catatan"];
        const rows = filteredAttendance.map(item => [
          item.id,
          `"${item.user_name || 'Karyawan'}"`,
          `"${item.user_role || 'Packer'}"`,
          item.date,
          item.clock_in || "",
          item.clock_out || "",
          item.status || "",
          `"${item.notes || ''}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "laporan_kehadiran.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const handleDeleteAttendance = (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus log kehadiran ini?")) return;

    fetch(`${API_URL}/admin/attendance/${id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Gagal menghapus data kehadiran");
        }
        alert("Log kehadiran berhasil dihapus");
        fetchAttendanceData();
      })
      .catch((err) => alert(err.message));
  };

  const handleDeleteUser = (id: number) => {
    if (session?.role.toLowerCase() === "payroll") {
      alert("Akses ditolak: Role Payroll tidak memiliki izin menghapus pengguna.");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

    fetch(`${API_URL}/admin/users/${id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Gagal menghapus pengguna");
        }
        alert("Pengguna berhasil dihapus");
        fetchUserData();
        fetchAttendanceData();
      })
      .catch((err) => alert(err.message));
  };

  const handleOpenEditModal = (usr: UserItem) => {
    setEditingUser(usr);
    setEditFormData({ 
      name: usr.name, 
      email: usr.email, 
      role: usr.role, 
      base_salary: usr.base_salary || 3000000 
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const currentRole = session?.role.toLowerCase() || "";
    const payload = currentRole === "payroll" 
      ? editFormData 
      : { name: editFormData.name, email: editFormData.email, role: editFormData.role };

    fetch(`${API_URL}/admin/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal memperbarui pengguna");
        
        alert("Data pengguna berhasil diperbarui!");
        setEditingUser(null);
        fetchUserData();
        fetchPayrollData();
      })
      .catch((err) => alert(err.message));
  };

  const handleOpenResetModal = (usr: UserItem) => {
    if (session?.role.toLowerCase() === "payroll") {
      alert("Akses ditolak: Role Payroll tidak memiliki izin mereset password pengguna.");
      return;
    }
  };

  const handleClockIn = () => {
    if (!session) return;
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          executeClockIn(session.id, position.coords.latitude, position.coords.longitude);
        },
        () => {
          executeClockIn(session.id, null, null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      executeClockIn(session.id, null, null);
    }
  };

  const executeClockIn = (userId: number, lat: number | null, lon: number | null) => {
    fetch(`${API_URL}/attendance/clock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, latitude: lat, longitude: lon }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal melakukan Clock In");
        
        alert(typeof data === "string" ? data : (data.message || "Clock In Berhasil"));
        fetchStatus(userId);
        fetchAttendanceData();
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleClockOut = () => {
    if (!session) return;
    setLoading(true);

    fetch(`${API_URL}/attendance/clock-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal melakukan Clock Out");
        
        alert(typeof data === "string" ? data : (data.message || "Clock Out Berhasil"));
        fetchStatus(session.id);
        fetchAttendanceData();
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  const formatTimeStr = (isoString: string | null) => {
    if (!isoString) return "-";
    if (isoString.includes("T")) {
      return isoString.split("T")[1]?.slice(0, 8).replace(/:/g, ".") || isoString;
    }
    return isoString;
  };

  if (!session) return null;

  const isPayroll = session.role.toLowerCase() === "payroll";

  const filteredAttendance = attendanceList.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.user_name?.toLowerCase().includes(query) || false;
    const statusMatch = item.status?.toLowerCase().includes(query) || false;
    const matchesSearch = nameMatch || statusMatch;

    let matchesDate = true;
    if (startDate && item.date < startDate) matchesDate = false;
    if (endDate && item.date > endDate) matchesDate = false;

    return matchesSearch && matchesDate;
  });

  const filteredUsers = userList.filter((usr) => {
    const query = userSearchQuery.toLowerCase();
    return usr.name.toLowerCase().includes(query) || usr.email.toLowerCase().includes(query) || usr.role.toLowerCase().includes(query);
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = attendanceList.filter(item => item.date === todayStr);
  const totalUsersCount = userList.length;
  const hadirHariIniCount = todayLogs.filter(item => item.clock_in !== null).length;
  const onTimeCount = todayLogs.filter(item => item.status === "On Time").length;
  const lateCount = todayLogs.filter(item => item.status && item.status !== "On Time").length;
  const belumAbsenCount = Math.max(0, totalUsersCount - hadirHariIniCount);

  return (
    <main className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <Sidebar 
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        loading={loading}
        currentTime={currentTime}
        handleClockIn={handleClockIn}
        handleClockOut={handleClockOut}
        handleLogout={handleLogout}
        formatTimeStr={formatTimeStr}
      />

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto p-6 md:p-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "attendance" ? "Manajemen Kehadiran Karyawan" : activeTab === "users" ? "Daftar Pengguna Sistem" : activeTab === "analytics" ? "Analitik & Grafik Kehadiran" : "Penghitungan Gaji Karyawan"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "attendance" 
                ? "Pantau catatan waktu, status, dan titik koordinat GPS secara real-time." 
                : activeTab === "users" 
                ? "Kelola akun dan hak akses pengguna terdaftar." 
                : activeTab === "analytics"
                ? "Visualisasi data rekapitulasi dan performa kehadiran staf."
                : "Hitung rekapitulasi gaji dan insentif berdasarkan data kehadiran."}
            </p>
          </div>

          {/* Jam Realtime di Pojok Kanan Atas Header */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Waktu Indonesia Barat</div>
              <div className="text-lg font-mono font-bold text-amber-400 tracking-wider">{currentTime} WIB</div>
            </div>
          </div>
        </div>
        
        {activeTab === "attendance" && (
          <AttendanceTab 
            attendanceList={attendanceList}
            filteredAttendance={filteredAttendance}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            showFilterDropdown={showFilterDropdown}
            setShowFilterDropdown={setShowFilterDropdown}
            totalUsersCount={totalUsersCount}
            hadirHariIniCount={hadirHariIniCount}
            onTimeCount={onTimeCount}
            lateCount={lateCount}
            belumAbsenCount={belumAbsenCount}
            handleDownloadPDF={handleDownloadPDF}
            handleDownloadCSV={handleDownloadCSV}
            fetchAttendanceData={fetchAttendanceData}
            handleDeleteAttendance={handleDeleteAttendance}
            formatTimeStr={formatTimeStr}
          />
        )}

        {activeTab === "users" && !isPayroll && (
          <UsersTab 
            filteredUsers={filteredUsers}
            userSearchQuery={userSearchQuery}
            setUserSearchQuery={setUserSearchQuery}
            handleOpenEditModal={handleOpenEditModal}
            handleOpenResetModal={handleOpenResetModal}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab 
            attendanceList={attendanceList}
            userList={userList}
          />
        )}

        {activeTab === "salary" && (
          <SalaryTab 
            payrollData={payrollData}
            payrollPeriod={payrollPeriod}
            setPayrollPeriod={setPayrollPeriod}
            fetchPayrollData={fetchPayrollData}
            setSelectedPayrollDetail={setSelectedPayrollDetail}
            setIsDetailModalOpen={setIsDetailModalOpen}
            setTargetUserForSalary={setTargetUserForSalary}
            setCustomBaseSalary={setCustomBaseSalary}
            setIsIndividualSalaryModalOpen={setIsIndividualSalaryModalOpen}
            isPayroll={isPayroll} // <-- Pastikan prop ini dikirim
          />
        )}

      </div>

      {/* MODALS */}
      <DetailSalaryModal 
        selectedPayrollDetail={selectedPayrollDetail}
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
      />

      <EditUserModal 
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleUpdateUser={handleUpdateUser}
      />

      <SalaryModal 
        isModalOpen={isIndividualSalaryModalOpen}
        setIsModalOpen={setIsIndividualSalaryModalOpen}
        targetUserForSalary={targetUserForSalary}
        customBaseSalary={customBaseSalary}
        setCustomBaseSalary={setCustomBaseSalary}
        handleSaveCustomSalary={handleSaveCustomSalary}
        isPayroll={isPayroll}
      />

    </main>
  );
}