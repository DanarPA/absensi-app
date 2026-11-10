import { Search, Edit, Key, Trash2 } from "lucide-react";

interface UsersTabProps {
  filteredUsers: any[];
  userSearchQuery: string;
  setUserSearchQuery: (q: string) => void;
  handleOpenEditModal: (usr: any) => void;
  handleOpenResetModal: (usr: any) => void;
  handleDeleteUser: (id: number) => void;
}

export default function UsersTab({
  filteredUsers,
  userSearchQuery,
  setUserSearchQuery,
  handleOpenEditModal,
  handleOpenResetModal,
  handleDeleteUser,
}: UsersTabProps) {
  return (
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
  );
}