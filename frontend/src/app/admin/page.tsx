"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  Users, 
  LayoutDashboard, 
  LogOut, 
  ShieldAlert, 
  User, 
  Search, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Key, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserX,
  Filter,
  BarChart3,
  X 
} from "lucide-react";

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
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: number; name: string; role: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"attendance" | "users" | "analytics">("attendance");
  
  const [attendanceList, setAttendanceList] = useState<AttendanceLogItem[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // State untuk jam digital real-time WIB
  const [currentTime, setCurrentTime] = useState<string>("--:--:--");

  // State untuk status presensi pribadi admin di sidebar
  const [status, setStatus] = useState<{ clock_in: string | null; clock_out: string | null; status: string | null; notes: string | null } | null>(null);

  // State untuk Modal Edit User
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "" });

  // State untuk Modal Reset Password
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

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
      if (parsed.role.toLowerCase() !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchAttendanceData();
      fetchUserData();
      fetchStatus(parsed.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Efek untuk jam digital real-time WIB
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
      .catch((err) => console.error("Gagal memuat status admin:", err));
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

  const handleDownloadPDF = () => {
    if (filteredAttendance.length === 0) {
      alert("Tidak ada data kehadiran yang sesuai untuk diexport ke PDF.");
      return;
    }

    const doc = new jsPDF();

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
      const rowData = [
        index + 1,
        item.user_name || "Karyawan",
        (item.user_role || "Packer").toUpperCase(),
        item.date,
        formatTimeStr(item.clock_in),
        formatTimeStr(item.clock_out),
        item.status || "-",
      ];
      tableRows.push(rowData);
    });

    (doc as any).autoTable({
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

    fetch(`${API_URL}/admin/attendance/${id}`, {
      method: "DELETE",
    })
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
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

    fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
    })
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
    setEditFormData({ name: usr.name, email: usr.email, role: usr.role });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    fetch(`${API_URL}/admin/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFormData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal memperbarui pengguna");
        
        alert("Pengguna berhasil diperbarui!");
        setEditingUser(null);
        fetchUserData();
      })
      .catch((err) => alert(err.message));
  };

  const handleOpenResetModal = (usr: UserItem) => {
    setResettingUser(usr);
    setNewPassword("");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    fetch(`${API_URL}/admin/users/${resettingUser.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newPassword }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Gagal mereset password");
        
        alert("Password pengguna berhasil direset!");
        setResettingUser(null);
        setNewPassword("");
      })
      .catch((err) => alert(err.message));
  };

  const handleClockIn = () => {
    if (!session) return;
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          executeClockIn(session.id, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("GPS Warning:", error.message);
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
        
        const message = typeof data === "string" ? data : (data.message || "Clock In Berhasil");
        alert(message);

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
        
        const message = typeof data === "string" ? data : (data.message || "Clock Out Berhasil");
        alert(message);

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
    const nameMatch = usr.name.toLowerCase().includes(query);
    const emailMatch = usr.email.toLowerCase().includes(query);
    const roleMatch = usr.role.toLowerCase().includes(query);
    return nameMatch || emailMatch || roleMatch;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = attendanceList.filter(item => item.date === todayStr);
  const totalUsersCount = userList.length;
  const hadirHariIniCount = todayLogs.filter(item => item.clock_in !== null).length;
  const onTimeCount = todayLogs.filter(item => item.status === "On Time").length;
  const lateCount = todayLogs.filter(item => item.status && item.status !== "On Time").length;
  const belumAbsenCount = Math.max(0, totalUsersCount - hadirHariIniCount);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex font-sans relative">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide">Admin Panel</h2>
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
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "users" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <Users className="w-4 h-4" /> Daftar Pengguna
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "analytics" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <BarChart3 className="w-4 h-4" /> Analitik & Grafik
            </button>
          </nav>
        </div>
        
        {/* WIDGET ABSENSI PRIBADI ADMIN */}
        <div className="px-4 py-3 mx-4 mb-2 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Absensi Saya</span>
            {status?.status && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs py-2 rounded-lg font-medium transition shadow-md shadow-emerald-600/10"
            >
              {status?.clock_in ? "Sudah In" : "Clock In"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={loading || !status?.clock_in || !!status?.clock_out}
              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs py-2 rounded-lg font-medium transition shadow-md shadow-rose-600/10"
            >
              {status?.clock_out ? "Sudah Out" : "Clock Out"}
            </button>
          </div>
        </div>

        {/* PROFIL & LOGOUT ADMIN */}
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

      {/* KONTEN UTAMA PANEL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-10 space-y-8">
        
        {/* HEADER KONTEN DENGAN JAM DIGITAL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "attendance" ? "Manajemen Kehadiran Karyawan" : activeTab === "users" ? "Daftar Pengguna Sistem" : "Analitik & Grafik Kehadiran"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "attendance" 
                ? "Pantau catatan waktu, status, dan titik koordinat GPS secara real-time." 
                : activeTab === "users" 
                ? "Kelola akun dan hak akses pengguna terdaftar." 
                : "Visualisasi data rekapitulasi dan performa kehadiran staf."}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg shadow-indigo-500/5">
            <div className="bg-indigo-600/10 p-2 rounded-lg text-indigo-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Waktu Saat Ini (WIB)</div>
              <div className="text-lg font-mono font-bold text-indigo-400 tracking-wider">{currentTime}</div>
            </div>
          </div>
        </div>
        
        {activeTab === "attendance" ? (
          <div className="space-y-6">
            
            {/* DASHBOARD STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{totalUsersCount}</div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-0.5">{hadirHariIniCount} <span className="text-xs font-normal text-slate-400">({onTimeCount} Tepat)</span></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terlambat</div>
                  <div className="text-2xl font-bold text-amber-400 mt-0.5">{lateCount}</div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Belum Absen</div>
                  <div className="text-2xl font-bold text-rose-400 mt-0.5">{belumAbsenCount}</div>
                </div>
              </div>
            </div>

            {/* KONTEN TABEL KEHADIRAN */}
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
                    title="Filter Berdasarkan Tanggal"
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
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showFilterDropdown && (
                <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
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
                              <span className="text-[10px] text-slate-500 uppercase">{item.user_role || "Packer"}</span>
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
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
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
        ) : activeTab === "users" ? (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex justify-between items-center">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, atau role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Total: <span className="text-white font-semibold">{filteredUsers.length}</span> pengguna
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                      <th className="p-4">ID</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role Akses</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Tidak ada pengguna yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-mono text-slate-400">#{usr.id}</td>
                          <td className="p-4 font-medium text-white">{usr.name}</td>
                          <td className="p-4 text-slate-300">{usr.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${usr.role.toLowerCase() === "admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(usr)}
                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/20 transition"
                                title="Edit Pengguna"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenResetModal(usr)}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 p-2 rounded-lg border border-amber-500/20 transition"
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/20 transition"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* SUB-HALAMAN ANALITIK & GRAFIK KEHADIRAN */
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Grafik & Tren Kehadiran Karyawan</h2>
                <p className="text-slate-400 text-sm">Visualisasi data rekapitulasi kehadiran berdasarkan catatan sistem.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tingkat Ketepatan Waktu</span>
                  <div className="text-3xl font-bold font-mono text-emerald-400">
                    {attendanceList.length > 0 ? Math.round((attendanceList.filter(i => i.status === "On Time").length / attendanceList.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-slate-500">Dari total seluruh log kehadiran tercatat</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Log Tercatat</span>
                  <div className="text-3xl font-bold font-mono text-indigo-400">
                    {attendanceList.length}
                  </div>
                  <p className="text-xs text-slate-500">Akumulasi seluruh sesi absensi</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Pengguna Aktif</span>
                  <div className="text-3xl font-bold font-mono text-amber-400">
                    {userList.length}
                  </div>
                  <p className="text-xs text-slate-500">Karyawan & Admin terdaftar</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Distribusi Status Kehadiran</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Tepat Waktu (On Time)</span>
                      <span className="font-mono text-emerald-400">{attendanceList.filter(i => i.status === "On Time").length} Log</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${attendanceList.length > 0 ? (attendanceList.filter(i => i.status === "On Time").length / attendanceList.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Terlambat / Catatan Lain</span>
                      <span className="font-mono text-amber-400">{attendanceList.filter(i => i.status && i.status !== "On Time").length} Log</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${attendanceList.length > 0 ? (attendanceList.filter(i => i.status && i.status !== "On Time").length / attendanceList.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MODAL EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Pengguna</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Role Akses
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="admin">Admin</option>
                  <option value="packer">Packer</option>
                  <option value="gudang">Gudang</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Reset Password Pengguna</h3>
              <button 
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400">
              Masukkan password baru untuk akun <span className="text-white font-medium">{resettingUser.name}</span> ({resettingUser.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-600/20"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}