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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Plus, Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// removed radio-group usage along with filter UI

const AdminLokasi = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [current, setCurrent] = useState(null);
  const [nama, setNama] = useState("");
  const [saving, setSaving] = useState(false);
  // removed filter UI and related states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${apiUrl}/api/lokasi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Gagal memuat lokasi"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [apiUrl]);

  useEffect(() => setPage(1), [search]);
  // removed filter dependencies; only reset on search change

  // removed click-outside handler for filter popover

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setNama("");
    setOpen(true);
  };
  const openEdit = (row) => {
    setMode("edit");
    setCurrent(row);
    setNama(row?.nama_lokasi || "");
    setOpen(true);
  };

  const submitLokasi = async (e) => {
    e?.preventDefault?.();
    if (!nama.trim()) return toast.error("Nama lokasi wajib diisi");
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (mode === "create") {
        await axios.post(
          `${apiUrl}/api/lokasi`,
          { nama_lokasi: nama.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Lokasi ditambahkan");
        setAlerts((p) => [
          ...p,
          {
            type: "default",
            title: "Berhasil",
            description: "Lokasi baru telah ditambahkan",
            duration: 2500,
          },
        ]);
      } else if (mode === "edit" && current) {
        await axios.put(
          `${apiUrl}/api/lokasi/${current.id_lokasi}`,
          { nama_lokasi: nama.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Lokasi diperbarui");
        setAlerts((p) => [
          ...p,
          {
            type: "default",
            title: "Berhasil",
            description: "Perubahan lokasi telah disimpan",
            duration: 2500,
          },
        ]);
      }
      setOpen(false);
      // refresh list
      const { data } = await axios.get(`${apiUrl}/api/lokasi`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menyimpan";
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

  const deleteLokasi = async (row) => {
    if (!row) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/lokasi/${row.id_lokasi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Lokasi dihapus");
      setAlerts((p) => [
        ...p,
        {
          type: "default",
          title: "Dihapus",
          description: "Lokasi berhasil dihapus",
          duration: 2500,
        },
      ]);
      const { data } = await axios.get(`${apiUrl}/api/lokasi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(data) ? data : data?.data || []);
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
    let arr = rows.filter((r) => {
      const name = (r.nama_lokasi || "").toLowerCase();
      if (!q) return true;
      return name.includes(q);
    });
    // default sort A -> Z
    arr.sort((a, b) => {
      const A = (a.nama_lokasi || "").toLowerCase();
      const B = (b.nama_lokasi || "").toLowerCase();
      return A.localeCompare(B);
    });
    return arr;
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
          <MapPin className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            Kelola Lokasi
          </h2>
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
            placeholder="Cari nama lokasi..."
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
            Tambah Lokasi
          </button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">No.</TableHead>
            <TableHead>Nama Lokasi</TableHead>
            <TableHead className="w-[180px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r, idx) => (
            <TableRow key={r.id_lokasi}>
              <TableCell className="text-neutral-400">
                {start + idx + 1}
              </TableCell>
              <TableCell className="font-medium text-neutral-100">
                {r.nama_lokasi}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <button
                  className="px-2 py-1 text-xs rounded-md border border-neutral-700 hover:bg-neutral-800 mr-1.5"
                  onClick={() => openEdit(r)}
                >
                  Kelola
                </button>
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
              <TableCell className="text-neutral-500 text-center" colSpan={3}>
                Tidak ada lokasi.
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
            <DialogTitle className="text-neutral-100">Hapus Lokasi</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menghapus lokasi{" "}
              <span className="text-neutral-200 font-medium">
                "{deleteTarget?.nama_lokasi}"
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
                await deleteLokasi(deleteTarget);
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi tambah */}
      <Dialog open={confirmAddOpen} onOpenChange={setConfirmAddOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              Konfirmasi Tambah
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Tambahkan lokasi baru dengan nama{" "}
              <span className="text-neutral-200 font-medium">
                "{nama || "(kosong)"}"
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              onClick={() => setConfirmAddOpen(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600"
              onClick={async () => {
                await submitLokasi();
                setConfirmAddOpen(false);
              }}
            >
              Tambah
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="border-neutral-800 bg-neutral-900/95 w-[95vw] sm:w-[520px]"
        >
          <SheetHeader>
            <SheetTitle className="text-neutral-100">
              {mode === "create" ? "Tambah Lokasi" : "Kelola Lokasi"}
            </SheetTitle>
            <SheetDescription className="text-neutral-400 text-sm">
              {mode === "create"
                ? "Tambahkan lokasi baru ke daftar. Lokasi ini akan tersedia saat pengguna membuat pengaduan."
                : "Perbarui nama lokasi. Perubahan nama akan diterapkan di seluruh tampilan tanpa mengubah referensi data."}
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              if (mode === "create") {
                e.preventDefault();
                if (!nama.trim()) {
                  toast.error("Nama lokasi wajib diisi");
                  return;
                }
                setConfirmAddOpen(true);
              } else {
                submitLokasi(e);
              }
            }}
            className="px-4 pb-4 space-y-4 text-[13.5px]"
          >
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Nama Lokasi <span className="text-red-400">*</span>
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 px-3 py-2.5"
                placeholder="Masukkan nama lokasi"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Gunakan nama yang jelas dan konsisten. Hindari duplikasi jika
                memungkinkan.
              </p>
            </div>
            <SheetFooter className="mt-4">
              <SheetClose asChild>
                <button
                  type="button"
                  className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                >
                  Batal
                </button>
              </SheetClose>
              <button
                type="submit"
                disabled={saving}
                className="px-3.5 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : mode === "create"
                  ? "Tambah"
                  : "Simpan"}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLokasi;
