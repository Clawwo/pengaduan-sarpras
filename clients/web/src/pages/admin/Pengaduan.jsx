import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAppConfig } from "@/lib/useAppConfig";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Filter, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const IconCheck = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-3.5 w-3.5"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconX = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-3.5 w-3.5"
    {...props}
  >
    <path
      d="M18 6 6 18M6 6l12 12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconSpinner = (props) => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" {...props}>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      opacity="0.25"
    />
    <path d="M22 12a10 10 0 0 0-10-10" fill="currentColor" />
  </svg>
);

const renderStatus = (statusRaw) => {
  const s = (statusRaw || "").toLowerCase();
  if (s.includes("selesai") || s.includes("terima")) {
    return (
      <Badge variant="success">
        <IconCheck />
        {statusRaw || "Selesai"}
      </Badge>
    );
  }
  if (s.includes("tolak")) {
    return (
      <Badge variant="destructive">
        <IconX />
        {statusRaw || "Ditolak"}
      </Badge>
    );
  }
  if (s.includes("proses")) {
    return (
      <Badge variant="warning">
        <IconSpinner />
        {statusRaw || "Diproses"}
      </Badge>
    );
  }
  return (
    <Badge variant="info">
      <Clock className="h-3.5 w-3.5" />
      {statusRaw || "Diajukan"}
    </Badge>
  );
};

const AdminPengaduan = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState("");
  const [saran, setSaran] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filterRef = React.useRef(null);
  const [alerts, setAlerts] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/pengaduan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Gagal memuat pengaduan"
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    }
    if (showFilter) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedStatuses]);

  const mapToSelectStatus = (statusRaw) => {
    const s = (statusRaw || "").toLowerCase();
    if (s.includes("proses")) return "Diproses";
    if (s.includes("tolak")) return "Ditolak";
    if (s.includes("selesai") || s.includes("terima")) return "Selesai";
    return "Diajukan";
  };

  const openManage = (row) => {
    setCurrent(row);
    setStatus(mapToSelectStatus(row?.status));
    setSaran(row?.saran_petugas || "");
    setOpen(true);
  };

  const submitManage = async (e) => {
    e?.preventDefault?.();
    if (!current) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      let backendStatus = status;
      if (status === "Diajukan") backendStatus = "Diajukan";
      else if (status === "Diproses") backendStatus = "Diproses";
      else if (status === "Selesai") backendStatus = "Selesai";
      else if (status === "Ditolak") backendStatus = "Ditolak";
      await axios.patch(
        `${apiUrl}/api/pengaduan/${current.id_pengaduan}/status`,
        { status: backendStatus, saran_petugas: saran },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status & feedback diperbarui");
      setAlerts((prev) => [
        ...prev,
        {
          type: "default",
          title: "Berhasil",
          description: "Status pengaduan berhasil diperbarui.",
          duration: 2500,
        },
      ]);
      setOpen(false);
      fetchAll();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal memperbarui";
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

  if (loading) return <div className="text-neutral-300">Memuat...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  const normalized = (v) => (v || "").toString().toLowerCase();
  const normalizeStatus = (statusRaw) => {
    const s = normalized(statusRaw);
    if (s.includes("selesai") || s.includes("terima")) return "diterima";
    if (s.includes("tolak")) return "ditolak";
    if (s.includes("proses")) return "proses";
    return "diajukan";
  };
  const filteredRows = rows.filter((r) => {
    const q = normalized(search.trim());
    const hay = `${r.nama_pengaduan || ""} ${r.nama_item || ""} ${
      r.nama_lokasi || ""
    } ${r.deskripsi || ""}`.toLowerCase();
    const searchOk = !q || hay.includes(q);
    const norm = normalizeStatus(r.status);
    const statusOk = selectedStatuses.size === 0 || selectedStatuses.has(norm);
    return searchOk && statusOk;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);
  const startItem = filteredRows.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + pageSize, filteredRows.length);

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
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-md border border-neutral-700 bg-neutral-800/80 text-neutral-300 flex items-center justify-center">
          <ClipboardListIcon />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            Daftar Semua Pengaduan
          </h2>
          <p className="text-sm text-neutral-400">
            Kelola status pengaduan dan berikan saran.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengaduan, item, lokasi, deskripsi..."
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
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              <Filter className="size-4" />
              Filter
              {selectedStatuses.size > 0 && (
                <span className="ml-1 rounded-full bg-neutral-800 px-1.5 text-xs text-neutral-300 border border-neutral-700">
                  {selectedStatuses.size}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-neutral-800 bg-neutral-900/95 backdrop-blur p-3 shadow-lg">
                <div className="mb-2 text-xs font-medium text-neutral-400">
                  Status
                </div>
                <div className="space-y-2">
                  {[
                    { key: "diajukan", label: "Diajukan" },
                    { key: "proses", label: "Diproses" },
                    { key: "diterima", label: "Diterima/Selesai" },
                    { key: "ditolak", label: "Ditolak" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 text-sm text-neutral-300"
                    >
                      <Checkbox
                        checked={selectedStatuses.has(opt.key)}
                        onCheckedChange={(checked) => {
                          setSelectedStatuses((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(opt.key);
                            else next.delete(opt.key);
                            return next;
                          });
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                    onClick={() => setSelectedStatuses(new Set())}
                  >
                    Reset
                  </button>
                  <button
                    className="text-xs text-neutral-300 hover:text-neutral-100"
                    onClick={() => setShowFilter(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Pengaduan</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r) => (
            <TableRow key={r.id_pengaduan}>
              <TableCell>
                {new Date(r.created_at || r.tgl_pengajuan).toLocaleDateString()}
              </TableCell>
              <TableCell className="truncate max-w-[220px]">
                {r.nama_pengaduan}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate" title={r.nama_item || "-"}>
                    {r.nama_item}
                  </span>
                  {r?.id_temporary ? (
                    <span className="shrink-0 text-[11px] text-amber-300/90 italic">
                      (sementara)
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{r.nama_lokasi}</TableCell>
              <TableCell
                title={r.deskripsi || "-"}
                className="truncate max-w-[360px]"
              >
                {r?.deskripsi && r.deskripsi.length > 140
                  ? `${r.deskripsi.slice(0, 140)}...`
                  : r.deskripsi || "-"}
              </TableCell>
              <TableCell>{renderStatus(r.status)}</TableCell>
              <TableCell className="whitespace-nowrap">
                <button
                  className="px-2 py-1 text-xs rounded-md border border-neutral-700 hover:bg-neutral-800"
                  onClick={() => openManage(r)}
                >
                  Kelola
                </button>
              </TableCell>
            </TableRow>
          ))}
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell className="text-neutral-500 text-center" colSpan={7}>
                Tidak ada pengaduan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-400">
          {filteredRows.length > 0
            ? `Menampilkan ${startItem}–${endItem} dari ${filteredRows.length} hasil`
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="border-neutral-800 bg-neutral-900/95 w-[95vw] sm:w-[700px] lg:w-[840px]"
        >
          <SheetHeader>
            <SheetTitle className="text-neutral-100">
              Kelola Pengaduan
            </SheetTitle>
            <SheetDescription className="text-neutral-400 text-sm">
              Ubah status dan berikan saran untuk pengguna.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={submitManage}
            className="px-4 pb-4 space-y-4 text-[13.5px]"
          >
            {current && (
              <div className="text-sm text-neutral-300 bg-neutral-900/60 border border-neutral-800 rounded-md p-3">
                <div className="font-medium text-neutral-100">
                  {current.nama_pengaduan}
                </div>
                <div className="text-neutral-400">
                  {current.nama_item} • {current.nama_lokasi}
                </div>
                {current.deskripsi ? (
                  <div className="mt-2 text-neutral-300 whitespace-pre-wrap">
                    {current.deskripsi}
                  </div>
                ) : null}
              </div>
            )}
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Status
              </label>
              <Select value={status || undefined} onValueChange={setStatus}>
                <SelectTrigger
                  className={`w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 focus-visible:border-orange-500 focus-visible:ring-0`}
                >
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-neutral-900/95 border-neutral-700 max-h-60 overflow-y-auto"
                >
                  <SelectItem
                    value="Diajukan"
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                  >
                    Diajukan
                  </SelectItem>
                  <SelectItem
                    value="Diproses"
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                  >
                    Diproses
                  </SelectItem>
                  <SelectItem
                    value="Selesai"
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                  >
                    Selesai
                  </SelectItem>
                  <SelectItem
                    value="Ditolak"
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                  >
                    Ditolak
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-neutral-500">
                Pilih "Selesai" atau "Ditolak" untuk menutup pengaduan.
              </p>
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1.5">
                Saran/Feedback (opsional)
              </label>
              <textarea
                value={saran}
                onChange={(e) => setSaran(e.target.value)}
                rows={5}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 px-3 py-2.5 resize-y text-[13.5px]"
                placeholder="Berikan saran untuk pengguna..."
              />
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
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const ClipboardListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4"
  >
    <path d="M9 2a1 1 0 0 0-1 1v1H7a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 0 0-1-1H9zm1 2h4v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V4z" />
  </svg>
);

export default AdminPengaduan;
