import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, Plus, Search, Trash2 } from "lucide-react";

const AdminItems = () => {
  const { apiUrl } = useAppConfig();
  const [items, setItems] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // manage sheet
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [current, setCurrent] = useState(null);
  const [namaItem, setNamaItem] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [idLokasi, setIdLokasi] = useState(""); // string value for Select
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // removed filter UI/state
  const fileZoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastObjectUrl = useRef(null);

  // removed filter click-outside handler

  const fetchLokasi = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/lokasi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLokasi(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Gagal memuat items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLokasi();
    fetchItems();
  }, []); // eslint-disable-line

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setNamaItem("");
    setDeskripsi("");
    setIdLokasi("");
    setImageFile(null);
    setImagePreview("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setMode("edit");
    setCurrent(item);
    setNamaItem(item?.nama_item || "");
    setDeskripsi(item?.deskripsi || "");
    setIdLokasi(item?.id_lokasi ? String(item.id_lokasi) : "");
    setImageFile(null);
    setImagePreview(item?.foto || "");
    setOpen(true);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
      const url = URL.createObjectURL(file);
      lastObjectUrl.current = url;
      setImageFile(file);
      setImagePreview(url);
    } else {
      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
        lastObjectUrl.current = null;
      }
      setImageFile(null);
      setImagePreview("");
    }
  };

  const clearImage = () => {
    if (lastObjectUrl.current) {
      URL.revokeObjectURL(lastObjectUrl.current);
      lastObjectUrl.current = null;
    }
    setImageFile(null);
    setImagePreview("");
  };

  const submitItem = async (e) => {
    e?.preventDefault?.();
    if (!namaItem || !idLokasi) {
      toast.error("Nama item dan lokasi wajib diisi");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("nama_item", namaItem);
      if (deskripsi) fd.append("deskripsi", deskripsi);
      fd.append("id_lokasi", idLokasi);
      if (imageFile) {
        fd.append("foto", imageFile);
      } else if (mode === "edit" && imagePreview) {
        // keep existing url if not uploading new file
        fd.append("foto", imagePreview);
      }

      if (mode === "create") {
        await axios.post(`${apiUrl}/api/items`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item berhasil ditambahkan");
        setAlerts((prev) => [
          ...prev,
          {
            type: "default",
            title: "Berhasil",
            description: "Item baru telah ditambahkan",
            duration: 2500,
          },
        ]);
      } else if (mode === "edit" && current) {
        await axios.put(`${apiUrl}/api/items/${current.id_item}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item berhasil diperbarui");
        setAlerts((prev) => [
          ...prev,
          {
            type: "default",
            title: "Berhasil",
            description: "Perubahan item telah disimpan",
            duration: 2500,
          },
        ]);
      }
      setOpen(false);
      fetchItems();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menyimpan";
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
      setSaving(false);
    }
  };

  const deleteItem = async (row) => {
    if (!row) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/items/${row.id_item}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item dihapus");
      setAlerts((prev) => [
        ...prev,
        {
          type: "default",
          title: "Dihapus",
          description: "Item berhasil dihapus",
          duration: 2500,
        },
      ]);
      fetchItems();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menghapus";
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
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    let arr = items.filter((it) => {
      const hay = `${it.nama_item || ""} ${it.deskripsi || ""} ${
        it.nama_lokasi || ""
      }`.toLowerCase();
      return !q || hay.includes(q);
    });
    arr.sort((a, b) => {
      const A = (a.nama_item || "").toLowerCase();
      const B = (b.nama_item || "").toLowerCase();
      return A.localeCompare(B);
    });
    return arr;
  }, [items, search]);

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
          <ImageIcon className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            Kelola Items
          </h2>
          <p className="text-sm text-neutral-400">
            Tambah, ubah, dan hapus item.
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari item, lokasi, deskripsi..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-0 focus:border-neutral-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 text-white px-3 py-2 text-sm hover:bg-orange-600"
          >
            <Plus className="size-4" />
            Tambah Item
          </button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">No.</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((it, idx) => (
            <TableRow key={it.id_item}>
              <TableCell className="text-neutral-400">
                {start + idx + 1}
              </TableCell>
              <TableCell>
                {it.foto ? (
                  <img
                    src={it.foto}
                    alt={it.nama_item}
                    className="w-12 h-12 object-cover rounded border border-neutral-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                    Tidak ada
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-neutral-100">
                {it.nama_item}
              </TableCell>
              <TableCell>{it.nama_lokasi || "-"}</TableCell>
              <TableCell
                className="truncate max-w-[360px]"
                title={it.deskripsi || "-"}
              >
                {it?.deskripsi && it.deskripsi.length > 140
                  ? `${it.deskripsi.slice(0, 140)}...`
                  : it.deskripsi || "-"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <button
                  className="px-2 py-1 text-xs rounded-md border border-neutral-700 hover:bg-neutral-800 mr-1.5"
                  onClick={() => openEdit(it)}
                >
                  Kelola
                </button>
                <button
                  className="px-2 py-1 text-xs rounded-md border border-red-900/60 text-red-300 hover:bg-red-950/30"
                  onClick={() => {
                    setDeleteTarget(it);
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
                Tidak ada item.
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
            <DialogTitle className="text-neutral-100">Hapus Item</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menghapus item{" "}
              <span className="text-neutral-200 font-medium">
                "{deleteTarget?.nama_item}"
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
                await deleteItem(deleteTarget);
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="border-neutral-800 bg-neutral-900/95 w-[95vw] sm:w-[700px] lg:w-[840px]"
        >
          <SheetHeader>
            <SheetTitle className="text-neutral-100">
              {mode === "create" ? "Tambah Item" : "Kelola Item"}
            </SheetTitle>
            <SheetDescription className="text-neutral-400 text-sm">
              {mode === "create"
                ? "Tambahkan item baru beserta lokasi. Foto opsional."
                : "Ubah detail item, lokasi, atau fotonya."}
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={submitItem}
            className="px-4 pb-4 space-y-4 text-[13.5px]"
          >
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Nama Item
              </label>
              <input
                value={namaItem}
                onChange={(e) => setNamaItem(e.target.value)}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 px-3 py-2.5"
                placeholder="Masukkan nama item"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Lokasi
              </label>
              <Select value={idLokasi || undefined} onValueChange={setIdLokasi}>
                <SelectTrigger className="w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 focus-visible:border-orange-500 focus-visible:ring-0">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-neutral-900/95 border-neutral-700 max-h-60 overflow-y-auto"
                >
                  {lokasi.map((l) => (
                    <SelectItem
                      key={l.id_lokasi}
                      value={String(l.id_lokasi)}
                      className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                    >
                      {l.nama_lokasi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Deskripsi (opsional)
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={4}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 px-3 py-2.5 resize-y"
                placeholder="Tuliskan deskripsi atau detail tambahan item..."
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Foto (opsional)
              </label>
              <div
                ref={fileZoneRef}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f && f.type?.startsWith("image/")) {
                    if (lastObjectUrl.current)
                      URL.revokeObjectURL(lastObjectUrl.current);
                    const url = URL.createObjectURL(f);
                    lastObjectUrl.current = url;
                    setImageFile(f);
                    setImagePreview(url);
                  }
                }}
                className="relative grid place-items-center rounded-lg border-2 border-dashed border-neutral-700 hover:border-orange-500/60 hover:bg-neutral-900/60 transition-colors cursor-pointer min-h-40"
              >
                {imagePreview ? (
                  <div className="flex items-center gap-3 p-3 w-full">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded border border-neutral-800"
                    />
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        className="px-2.5 py-1.5 text-xs rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1.5 text-xs rounded-md border border-red-900/60 text-red-300 hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="mx-auto mb-3 size-10 rounded-full bg-neutral-800/70 border border-neutral-700 grid place-items-center text-neutral-300">
                      <ImageIcon className="size-5" />
                    </div>
                    <div className="text-neutral-200 font-medium">
                      Klik untuk unggah
                    </div>
                    <div className="text-sm text-neutral-500">
                      atau seret dan lepas gambar di sini
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Pilih Gambar
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Biarkan kosong untuk tidak mengunggah.
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

export default AdminItems;
