import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppConfig } from "@/lib/useAppConfig";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Trash2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminPetugas = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // form fields for create
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaPengguna, setNamaPengguna] = useState("");
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("");
  const [telp, setTelp] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/petugas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Gagal memuat petugas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line

  useEffect(() => setPage(1), [search]);

  const openCreate = () => {
    setUsername("");
    setPassword("");
    setNamaPengguna("");
    setNama("");
    setGender("");
    setTelp("");
    setOpen(true);
  };

  const submitCreate = async (e) => {
    e?.preventDefault?.();
    if (!username || !password || !namaPengguna || !nama || !gender) {
      return toast.error("Lengkapi semua field bertanda *");
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/auth/register-petugas`,
        {
          username,
          password,
          nama_pengguna: namaPengguna,
          nama,
          gender,
          telp,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Petugas ditambahkan");
      setAlerts((p) => [
        ...p,
        {
          type: "default",
          title: "Berhasil",
          description: "Petugas baru telah ditambahkan",
          duration: 2500,
        },
      ]);
      setOpen(false);
      fetchAll();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menambah petugas";
      toast.error(errMsg);
      setAlerts((p) => [
        ...p,
        {
          type: "destructive",
          title: "Gagal",
          description: errMsg,
          duration: 3500,
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (row) => {
    if (!row) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/petugas/${row.id_petugas}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Petugas dihapus");
      setAlerts((p) => [
        ...p,
        {
          type: "default",
          title: "Dihapus",
          description: "Petugas berhasil dihapus",
          duration: 2500,
        },
      ]);
      fetchAll();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menghapus";
      toast.error(errMsg);
      setAlerts((p) => [
        ...p,
        {
          type: "destructive",
          title: "Gagal",
          description: errMsg,
          duration: 3500,
        },
      ]);
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    return rows.filter((r) => {
      const hay = `${r.username || ""} ${r.nama_pengguna || ""} ${
        r.nama || ""
      } ${r.gender || ""} ${r.telp || ""}`.toLowerCase();
      return !q || hay.includes(q);
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const startItem = filtered.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + pageSize, filtered.length);

  if (loading) return <div className="text-neutral-300">Memuat...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

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
            Kelola Petugas
          </h2>
          <p className="text-sm text-neutral-400">Tambah atau hapus petugas.</p>
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username, nama, telp..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-0 focus:border-neutral-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Total: {rows.length}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 text-white px-3 py-2 text-sm hover:bg-orange-600"
          >
            <Plus className="size-4" />
            Tambah Petugas
          </button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Nama Pengguna</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Telp</TableHead>
            <TableHead className="w-[180px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r) => (
            <TableRow key={r.id_petugas}>
              <TableCell className="font-medium text-neutral-100">
                {r.username}
              </TableCell>
              <TableCell>{r.nama_pengguna}</TableCell>
              <TableCell>{r.nama}</TableCell>
              <TableCell className="uppercase">{r.gender}</TableCell>
              <TableCell>{r.telp || "-"}</TableCell>
              <TableCell className="whitespace-nowrap">
                {/* Edit profile deferred due to missing route on server */}
                {/* <button className="px-2 py-1 text-xs rounded-md border border-neutral-700 hover:bg-neutral-800 mr-1.5" onClick={() => openEdit(r)}>Kelola</button> */}
                <button
                  className="px-2 py-1 text-xs rounded-md border border-red-900/60 text-red-300 hover:bg-red-950/30"
                  onClick={() => {
                    setDeleteTarget(r);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="inline size-3.5 mr-1" /> Hapus
                </button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell className="text-neutral-500 text-center" colSpan={6}>
                Tidak ada petugas.
              </TableCell>
            </TableRow>
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
            disabled={page <= 1}
          >
            Sebelumnya
          </button>
          <div className="text-sm text-neutral-300">
            {page} / {totalPages}
          </div>
          <button
            className="px-3 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* Dialog konfirmasi hapus */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              Hapus Petugas
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menghapus petugas{" "}
              <span className="text-neutral-200 font-medium">
                "{deleteTarget?.nama}" (username: {deleteTarget?.username})
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              onClick={() => setDeleteOpen(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                await deleteRow(deleteTarget);
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tambah Petugas Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800 sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              Tambah Petugas
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-sm">
              Buat akun baru untuk petugas lapangan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4 text-[13.5px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Username *
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-neutral-700 px-3 py-2.5"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-neutral-700 px-3 py-2.5"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Nama Pengguna *
                </label>
                <input
                  value={namaPengguna}
                  onChange={(e) => setNamaPengguna(e.target.value)}
                  className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-neutral-700 px-3 py-2.5"
                  placeholder="Nama tampilan akun"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-neutral-700 px-3 py-2.5"
                  placeholder="Nama lengkap petugas"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Gender *
                </label>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "l"}
                      onChange={() => setGender("l")}
                    />
                    Laki-laki
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "p"}
                      onChange={() => setGender("p")}
                    />
                    Perempuan
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  No. Telp
                </label>
                <input
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                  className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-neutral-700 px-3 py-2.5"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <button
                type="button"
                className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3.5 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Tambah"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPetugas;
