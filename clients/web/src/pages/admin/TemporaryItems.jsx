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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Search, Filter, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Icons untuk badge status (sama dengan Pengaduan.jsx)
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

const AdminTemporaryItems = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState({
    Diproses: false,
    Disetujui: false,
    Ditolak: false,
  });
  const [alerts, setAlerts] = useState([]);
  const filterRef = useRef(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/temporary-item`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Gagal memuat temporary items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line

  useEffect(() => setPage(1), [search]);

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

  const handleApprove = async () => {
    if (!targetItem) return;
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/temporary-item/approve/${targetItem.id_temporary}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item berhasil disetujui");
      setAlerts((p) => [
        ...p,
        {
          type: "default",
          title: "Berhasil",
          description: `Item "${targetItem.nama_barang_baru}" telah dipromosikan ke item resmi`,
          duration: 3000,
        },
      ]);
      setApproveOpen(false);
      setTargetItem(null);
      fetchAll();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menyetujui item";
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
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!targetItem) return;
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/temporary-item/reject/${targetItem.id_temporary}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item berhasil ditolak");
      setAlerts((p) => [
        ...p,
        {
          type: "default",
          title: "Ditolak",
          description: `Item "${targetItem.nama_barang_baru}" telah ditolak`,
          duration: 3000,
        },
      ]);
      setRejectOpen(false);
      setTargetItem(null);
      fetchAll();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Gagal menolak item";
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
      setProcessing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    const anyStatusFilter =
      filterStatus.Diproses || filterStatus.Disetujui || filterStatus.Ditolak;
    return rows.filter((r) => {
      // Filter by search
      const hay = `${r.nama_barang_baru || ""} ${
        r.nama_lokasi || ""
      }`.toLowerCase();
      if (q && !hay.includes(q)) return false;

      // Filter by status
      if (anyStatusFilter) {
        if (!filterStatus[r.status]) return false;
      }

      return true;
    });
  }, [rows, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const startItem = filtered.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + pageSize, filtered.length);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Diproses":
        return (
          <Badge variant="warning">
            <IconSpinner />
            Diproses
          </Badge>
        );
      case "Disetujui":
        return (
          <Badge variant="success">
            <IconCheck />
            Disetujui
          </Badge>
        );
      case "Ditolak":
        return (
          <Badge variant="destructive">
            <IconX />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
          <Clock className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            Moderasi Item Temporary
          </h2>
          <p className="text-sm text-neutral-400">
            Setujui atau tolak item temporary yang diajukan pengguna.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:max-w-lg">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama item, lokasi..."
              className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-0 focus:border-neutral-700"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 px-3 py-2 text-sm hover:bg-neutral-800 whitespace-nowrap"
            >
              <Filter className="size-4" />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute left-0 top-full mt-2 z-20 w-56 rounded-md border border-neutral-800 bg-neutral-900 shadow-lg">
                <div className="p-3 space-y-3">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    Status
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                      <Checkbox
                        checked={filterStatus.Diproses}
                        onCheckedChange={(checked) =>
                          setFilterStatus((p) => ({
                            ...p,
                            Diproses: !!checked,
                          }))
                        }
                      />
                      <span>Pending</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                      <Checkbox
                        checked={filterStatus.Disetujui}
                        onCheckedChange={(checked) =>
                          setFilterStatus((p) => ({
                            ...p,
                            Disetujui: !!checked,
                          }))
                        }
                      />
                      <span>Disetujui</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                      <Checkbox
                        checked={filterStatus.Diproses}
                        onCheckedChange={(checked) =>
                          setFilterStatus((p) => ({
                            ...p,
                            Diproses: !!checked,
                          }))
                        }
                      />
                      <span>Diproses</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <TableHead className="w-[60px]">No</TableHead>
            <TableHead>Nama Item</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Jumlah Pengaduan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[200px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r, idx) => (
            <TableRow key={r.id_temporary}>
              <TableCell className="text-neutral-400">
                {start + idx + 1}
              </TableCell>
              <TableCell className="font-medium text-neutral-100">
                {r.nama_barang_baru}
              </TableCell>
              <TableCell>{r.nama_lokasi || "-"}</TableCell>
              <TableCell>
                <span className="text-orange-400 font-medium">
                  {r.jumlah_pengaduan || 0}
                </span>{" "}
                pengaduan
              </TableCell>
              <TableCell>{getStatusBadge(r.status)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {r.status === "Diproses" && (
                  <>
                    <button
                      className="px-2 py-1 text-xs rounded-md border border-emerald-900/60 text-emerald-300 hover:bg-emerald-950/30 mr-1.5"
                      onClick={() => {
                        setTargetItem(r);
                        setApproveOpen(true);
                      }}
                    >
                      <CheckCircle className="inline size-3.5 mr-1" /> Setujui
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded-md border border-red-900/60 text-red-300 hover:bg-red-950/30"
                      onClick={() => {
                        setTargetItem(r);
                        setRejectOpen(true);
                      }}
                    >
                      <XCircle className="inline size-3.5 mr-1" /> Tolak
                    </button>
                  </>
                )}
                {r.status !== "Diproses" && (
                  <span className="text-xs text-neutral-500">
                    Sudah diproses
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell className="text-neutral-500 text-center" colSpan={6}>
                Tidak ada item temporary.
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

      {/* Dialog Approve */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              Setujui Item Temporary
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menyetujui item{" "}
              <span className="text-neutral-200 font-medium">
                "{targetItem?.nama_barang_baru}"
              </span>
              ? Item ini akan dipromosikan menjadi item resmi dan semua
              pengaduan terkait akan diupdate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              onClick={() => setApproveOpen(false)}
              disabled={processing}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? "Memproses..." : "Setujui"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">
              Tolak Item Temporary
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Apakah Anda yakin ingin menolak item{" "}
              <span className="text-neutral-200 font-medium">
                "{targetItem?.nama_barang_baru}"
              </span>
              ? Item ini tidak akan menjadi item resmi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              onClick={() => setRejectOpen(false)}
              disabled={processing}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3.5 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? "Memproses..." : "Tolak"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemporaryItems;
