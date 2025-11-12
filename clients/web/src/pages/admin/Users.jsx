import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useAppConfig } from "@/lib/useAppConfig";
import { toast } from "react-hot-toast";
import { Trash2, Users, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminUsers = () => {
  const { apiUrl } = useAppConfig();
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [alerts, setAlerts] = useState([]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState({
    admin: false,
    petugas: false,
    pengguna: false,
  });
  const filterRef = useRef(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${apiUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => setPage(1), [search]);

  // Click outside filter
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/user/${selectedUser.id_pengguna}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User berhasil dihapus");
      setDeleteDialogOpen(false);
      setSelectedUser(null);

      setAlerts((prev) => [
        ...prev,
        {
          type: "default",
          title: "Dihapus",
          description: "User berhasil dihapus",
          duration: 2500,
        },
      ]);

      // Refresh data
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal menghapus user";
      toast.error(errMsg);

      setAlerts((prev) => [
        ...prev,
        {
          type: "destructive",
          title: "Gagal",
          description: errMsg,
          duration: 3500,
        },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const badges = {
      admin: (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          Admin
        </Badge>
      ),
      petugas: (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Petugas
        </Badge>
      ),
      pengguna: (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          Pengguna
        </Badge>
      ),
    };
    return badges[role] || <Badge variant="outline">{role}</Badge>;
  };

  // Handle search
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // Filter and search
  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    let arr = users.filter((user) => {
      // Search filter
      const searchMatch =
        !q ||
        `${user.nama_pengguna || ""} ${user.username || ""}`
          .toLowerCase()
          .includes(q);

      // Role filter
      const activeRoles = Object.keys(filterRole).filter((k) => filterRole[k]);
      const roleMatch =
        activeRoles.length === 0 || activeRoles.includes(user.role);

      return searchMatch && roleMatch;
    });
    return arr;
  }, [users, search, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const startItem = filtered.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + pageSize, filtered.length);

  if (loading) return <div className="text-neutral-300">Memuat...</div>;

  return (
    <div className="space-y-4">
      {alerts[0] && (
        <Alert
          floating
          position="top-center"
          variant={alerts[0].type}
          onClose={() => setAlerts((prev) => prev.slice(1))}
          duration={alerts[0].duration ?? 3000}
        >
          <AlertTitle>{alerts[0].title}</AlertTitle>
          {alerts[0].description && (
            <AlertDescription>{alerts[0].description}</AlertDescription>
          )}
        </Alert>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className="size-7 rounded-md border border-neutral-700 bg-neutral-800/80 text-neutral-300 flex items-center justify-center">
          <Users className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            Kelola Users
          </h2>
          <p className="text-sm text-neutral-400">
            Lihat dan kelola data pengguna sistem.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-0 focus:border-neutral-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                Object.values(filterRole).some((v) => v)
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              <Filter className="size-4" />
              <span>Filter</span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-md border border-neutral-800 bg-neutral-900/95 backdrop-blur-sm shadow-lg p-3">
                <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                  Role
                </div>
                <div className="space-y-2">
                  {["admin", "petugas", "pengguna"].map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 cursor-pointer hover:text-neutral-100"
                    >
                      <Checkbox
                        checked={filterRole[role]}
                        onCheckedChange={(checked) =>
                          setFilterRole((prev) => ({
                            ...prev,
                            [role]: checked,
                          }))
                        }
                      />
                      <span className="text-sm text-neutral-300 capitalize">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
                {Object.values(filterRole).some((v) => v) && (
                  <button
                    onClick={() =>
                      setFilterRole({
                        admin: false,
                        petugas: false,
                        pengguna: false,
                      })
                    }
                    className="mt-3 w-full text-xs text-orange-400 hover:text-orange-300 py-1"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Total: {filtered.length}
          </button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">No.</TableHead>
            <TableHead>Nama Pengguna</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow>
              <TableCell className="text-neutral-500 text-center" colSpan={5}>
                {search
                  ? "Tidak ada data yang sesuai dengan pencarian"
                  : "Belum ada data users"}
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((user, index) => (
              <TableRow key={user.id_pengguna}>
                <TableCell className="text-neutral-400">
                  {start + index + 1}
                </TableCell>
                <TableCell className="font-medium text-neutral-100">
                  {user.nama_pengguna}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <button
                    className="px-2 py-1 text-xs rounded-md border border-red-900/60 text-red-300 hover:bg-red-950/30"
                    onClick={() => openDeleteDialog(user)}
                  >
                    <Trash2 className="inline size-3.5 mr-1" /> Hapus
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-400">
          {filtered.length > 0
            ? `Menampilkan ${startItem}–${endItem} dari ${filtered.length} hasil`
            : `Tidak ada hasil`}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Sebelumnya
          </button>
          <div className="text-sm text-neutral-300">
            {page} / {totalPages}
          </div>
          <button
            className="px-3 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">Hapus User</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span className="text-neutral-400">Nama:</span>
                <span className="font-medium text-neutral-100">
                  {selectedUser.nama_pengguna}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Username:</span>
                <span className="font-medium text-neutral-100">
                  {selectedUser.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Role:</span>
                {getRoleBadge(selectedUser.role)}
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              onClick={deleteUser}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
