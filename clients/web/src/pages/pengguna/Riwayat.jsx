import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppConfig } from "../../lib/useAppConfig";
import { getRiwayatPengaduan } from "../../lib/utils/pengaduan";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  History as HistoryIcon,
  Filter,
  Search,
  Eye,
  X,
  Calendar,
  MapPin,
  Package,
  FileText,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Riwayat = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const filterRef = useRef(null);

  // Close filter popover on outside click
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
    (async () => {
      try {
        const data = await getRiwayatPengaduan(apiUrl);
        setRows(data);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Gagal memuat riwayat"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

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

  // Normalized status for filtering
  const normalizeStatus = (statusRaw) => {
    const s = (statusRaw || "").toLowerCase();
    if (s.includes("selesai") || s.includes("terima")) return "diterima";
    if (s.includes("tolak")) return "ditolak";
    if (s.includes("proses")) return "proses";
    return "diajukan";
  };

  // Compose filters
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      // status filter
      const norm = normalizeStatus(r.status);
      const statusOk =
        selectedStatuses.size === 0 || selectedStatuses.has(norm);

      // text search: search across a few fields
      const hay = `${r.nama_pengaduan || ""} ${r.nama_item || ""} ${
        r.nama_lokasi || ""
      } ${r.deskripsi || ""}`.toLowerCase();
      const searchOk = q === "" || hay.includes(q);

      return statusOk && searchOk;
    });
  }, [rows, search, selectedStatuses]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, selectedStatuses]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  const startItem = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(filteredRows.length, page * pageSize);

  const handleViewDetail = (pengaduan) => {
    setSelectedPengaduan(pengaduan);
    setShowDetail(true);
  };

  if (loading) return <div className="text-neutral-300">Memuat...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-7">
        <div className="size-7 rounded-md border border-neutral-700 bg-neutral-800/80 text-neutral-300 flex items-center justify-center">
          <HistoryIcon className="size-4" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-100">
          Riwayat Pengaduan
        </h2>
      </div>
      {/* Toolbar: Search + Filter + Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left side: Search + Filter */}
        <div className="flex items-center gap-2 w-full sm:max-w-lg">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengaduan, item, lokasi, deskripsi..."
              className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-[3px] focus:ring-neutral-700/40 focus:border-neutral-700"
            />
          </div>
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
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-md border border-neutral-800 bg-neutral-900/95 backdrop-blur p-3 shadow-lg">
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

        {/* Right side: Total */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 px-3 py-2 text-sm">
            <span className="text-neutral-400">Total:</span>
            <span className="font-semibold text-neutral-100">
              {filteredRows.length}
            </span>
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
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedRows.map((r) => (
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
              <TableCell>{renderStatus(r.status)}</TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleViewDetail(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  <Eye className="size-4" />
                  Detail
                </button>
              </TableCell>
            </TableRow>
          ))}
          {!loading && filteredRows.length === 0 && (
            <TableRow>
              <TableCell className="text-neutral-500 text-center" colSpan={6}>
                {rows.length === 0
                  ? "Belum ada pengaduan."
                  : "Tidak ada pengaduan yang cocok dengan pencarian/filters Anda."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
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

      {/* Modal Detail Pengaduan */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Eye className="size-5 text-orange-400" />
              Detail Pengaduan
            </DialogTitle>
          </DialogHeader>

          {selectedPengaduan && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <FileText className="size-4" />
                    Nama Pengaduan
                  </div>
                  <div className="text-neutral-100 font-medium">
                    {selectedPengaduan.nama_pengaduan}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Calendar className="size-4" />
                    Tanggal Pengajuan
                  </div>
                  <div className="text-neutral-100">
                    {new Date(
                      selectedPengaduan.created_at ||
                        selectedPengaduan.tgl_pengajuan
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Package className="size-4" />
                    Item
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-100">
                      {selectedPengaduan.nama_item}
                    </span>
                    {selectedPengaduan.id_temporary && (
                      <Badge variant="warning" className="text-xs">
                        Item Sementara
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <MapPin className="size-4" />
                    Lokasi
                  </div>
                  <div className="text-neutral-100">
                    {selectedPengaduan.nama_lokasi}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Clock className="size-4" />
                    Status
                  </div>
                  <div>{renderStatus(selectedPengaduan.status)}</div>
                </div>

                {selectedPengaduan.nama_petugas && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <User className="size-4" />
                      Petugas
                    </div>
                    <div className="text-neutral-100">
                      {selectedPengaduan.nama_petugas}
                    </div>
                  </div>
                )}
              </div>

              {selectedPengaduan.deskripsi && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <FileText className="size-4" />
                    Deskripsi
                  </div>
                  <div className="text-neutral-200 text-sm bg-neutral-800/40 rounded-lg p-3 whitespace-pre-wrap">
                    {selectedPengaduan.deskripsi}
                  </div>
                </div>
              )}

              {selectedPengaduan.saran_petugas && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <User className="size-4" />
                    Saran dari Petugas
                  </div>
                  <div className="text-neutral-200 text-sm bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 whitespace-pre-wrap">
                    {selectedPengaduan.saran_petugas}
                  </div>
                </div>
              )}

              {selectedPengaduan.foto && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <ImageIcon className="size-4" />
                    Foto Pengaduan
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-neutral-800">
                    <img
                      src={selectedPengaduan.foto}
                      alt="Foto Pengaduan"
                      className="w-full h-auto max-h-96 object-contain bg-neutral-950"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png";
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedPengaduan.tgl_selesai && (
                <div className="space-y-1 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Calendar className="size-4" />
                    Tanggal Selesai
                  </div>
                  <div className="text-neutral-100">
                    {new Date(selectedPengaduan.tgl_selesai).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-800">
            <button
              onClick={() => setShowDetail(false)}
              className="px-4 py-2 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Riwayat;
