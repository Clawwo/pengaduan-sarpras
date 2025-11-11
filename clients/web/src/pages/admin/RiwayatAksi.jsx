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
import {
  Clock,
  Filter,
  Search,
  Printer,
  FileText,
  History,
  Eye,
  X,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Icon spinner
const IconSpinner = () => (
  <svg
    className="h-3.5 w-3.5 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Render status badge
const renderStatus = (statusRaw) => {
  const s = (statusRaw || "").toLowerCase();
  if (s.includes("selesai") || s.includes("terima")) {
    return (
      <Badge variant="success">
        <FileText className="h-3.5 w-3.5" />
        {statusRaw || "Selesai"}
      </Badge>
    );
  }
  if (s.includes("tolak")) {
    return (
      <Badge variant="destructive">
        <FileText className="h-3.5 w-3.5" />
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

const RiwayatAksi = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [petugas, setPetugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [stats, setStats] = useState(null);
  const filterRef = React.useRef(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetch petugas list for filter
  const fetchPetugas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiUrl}/api/petugas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPetugas(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error fetching petugas:", err);
    }
  }, [apiUrl]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${apiUrl}/api/riwayat-aksi/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  }, [apiUrl]);

  // Fetch riwayat aksi with filters
  const fetchRiwayatAksi = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {
        page,
        limit: 20,
        ...(selectedPetugas && { id_petugas: selectedPetugas }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(search && { search }),
      };

      const { data } = await axios.get(`${apiUrl}/api/riwayat-aksi`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRows(data.data || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Gagal memuat riwayat aksi"
      );
      toast.error("Gagal memuat riwayat aksi");
    } finally {
      setLoading(false);
    }
  }, [
    apiUrl,
    page,
    selectedPetugas,
    selectedStatus,
    startDate,
    endDate,
    search,
  ]);

  useEffect(() => {
    fetchPetugas();
    fetchStatistics();
  }, [fetchPetugas, fetchStatistics]);

  useEffect(() => {
    fetchRiwayatAksi();
  }, [fetchRiwayatAksi]);

  // Click outside to close filter
  useEffect(() => {
    const onDocClick = (e) => {
      if (!showFilter) return;
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showFilter]);

  // Reset filters
  const resetFilters = () => {
    setSelectedPetugas("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

  // Export to PDF (simple print)
  const handlePrint = () => {
    window.print();
  };

  // Open detail modal
  const openDetail = (row) => {
    setSelectedDetail(row);
    setDetailOpen(true);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const startItem = (page - 1) * pagination.limit + 1;
  const endItem = Math.min(page * pagination.limit, pagination.total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-neutral-100">
            Riwayat Aksi Petugas
          </h2>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700"
        >
          <Printer className="size-4" />
          Export PDF
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">
                Total Aksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.total_aksi || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Oleh {stats.total_petugas_aktif || 0} petugas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">
                Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-300">
                {stats.total_selesai || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Pengaduan diselesaikan
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">
                Diproses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-300">
                {stats.total_diproses || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Sedang ditangani</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">
                Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300">
                {stats.total_ditolak || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Pengaduan ditolak</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar: Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari pengaduan, petugas, aksi..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-[3px] focus:ring-neutral-700/40 focus:border-neutral-700"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700"
          >
            <Filter className="size-4" />
            Filter
            {(selectedPetugas || selectedStatus || startDate || endDate) && (
              <span className="ml-1 size-2 rounded-full bg-orange-400" />
            )}
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-neutral-800 bg-neutral-900/95 shadow-lg backdrop-blur-sm p-4 space-y-3">
              <div className="text-sm font-medium text-neutral-300">
                Filter Riwayat Aksi
              </div>

              {/* Filter by Petugas */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Petugas
                </label>
                <Select
                  value={selectedPetugas}
                  onValueChange={(val) => {
                    setSelectedPetugas(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full bg-neutral-900/60 border-neutral-800 text-neutral-200">
                    <SelectValue placeholder="Semua Petugas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Petugas</SelectItem>
                    {petugas.map((p) => (
                      <SelectItem
                        key={p.id_petugas}
                        value={String(p.id_petugas)}
                      >
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Status */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full bg-neutral-900/60 border-neutral-800 text-neutral-200">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="Diajukan">Diajukan</SelectItem>
                    <SelectItem value="Diproses">Diproses</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-200 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-200 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <button
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                  onClick={resetFilters}
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

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Pengaduan</TableHead>
            <TableHead>Diubah Oleh</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-neutral-400">
                <IconSpinner className="inline mr-2" />
                Memuat data...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-neutral-500">
                Tidak ada riwayat aksi.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id_riwayat}>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(r.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[220px] truncate font-medium text-neutral-200">
                    {r.nama_pengaduan}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-200">
                    {r.nama_petugas || r.nama_user}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-300">{r.aksi}</div>
                </TableCell>
                <TableCell>{renderStatus(r.status_baru)}</TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => openDetail(r)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
                  >
                    <Eye className="size-3.5" />
                    Lihat
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-400">
          {pagination.total > 0
            ? `Menampilkan ${startItem}–${endItem} dari ${pagination.total} hasil`
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
            {page} / {pagination.totalPages || 1}
          </div>
          <button
            className="px-3 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page >= pagination.totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800 text-neutral-100 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <History className="size-5 text-orange-400" />
              Detail Riwayat Aksi
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Informasi lengkap tentang aksi yang dilakukan
            </DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-4 mt-4">
              {/* Grid 2 Kolom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  {/* Info Pengaduan */}
                  <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                      <FileText className="size-4 text-orange-400" />
                      Informasi Pengaduan
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          ID Pengaduan
                        </span>
                        <span className="text-neutral-200 font-medium">
                          #{selectedDetail.id_pengaduan}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Nama Pengaduan
                        </span>
                        <span className="text-neutral-200 font-medium">
                          {selectedDetail.nama_pengaduan}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Item
                        </span>
                        <span className="text-neutral-200">
                          {selectedDetail.nama_item || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Lokasi
                        </span>
                        <span className="text-neutral-200">
                          {selectedDetail.nama_lokasi || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Petugas/Admin */}
                  <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                      <svg
                        className="size-4 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Dilakukan Oleh
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Nama
                        </span>
                        <span className="text-neutral-200 font-medium">
                          {selectedDetail.nama_petugas ||
                            selectedDetail.nama_user}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Username
                        </span>
                        <span className="text-neutral-200">
                          {selectedDetail.username_user}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Role
                        </span>
                        <Badge
                          variant={
                            selectedDetail.role_user === "admin"
                              ? "default"
                              : "info"
                          }
                          className="text-xs"
                        >
                          {selectedDetail.role_user.charAt(0).toUpperCase() +
                            selectedDetail.role_user.slice(1)}
                        </Badge>
                      </div>
                      {selectedDetail.id_petugas && (
                        <div>
                          <span className="text-neutral-500 text-xs block mb-1">
                            ID Petugas
                          </span>
                          <span className="text-neutral-200">
                            #{selectedDetail.id_petugas}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  {/* Info Aksi */}
                  <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                      <Clock className="size-4 text-blue-400" />
                      Rincian Aksi
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Aksi
                        </span>
                        <span className="text-neutral-200 font-medium">
                          {selectedDetail.aksi}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Status Sebelumnya
                        </span>
                        {selectedDetail.status_sebelumnya ? (
                          renderStatus(selectedDetail.status_sebelumnya)
                        ) : (
                          <span className="text-neutral-500 italic text-xs">
                            Tidak ada
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Status Baru
                        </span>
                        {renderStatus(selectedDetail.status_baru)}
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Status Sekarang
                        </span>
                        {renderStatus(selectedDetail.status_pengaduan_sekarang)}
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs block mb-1">
                          Tanggal & Waktu
                        </span>
                        <span className="text-neutral-200">
                          {new Date(
                            selectedDetail.created_at
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <br />
                        <span className="text-neutral-400 text-xs">
                          {new Date(
                            selectedDetail.created_at
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saran Petugas */}
                  {selectedDetail.saran_petugas && (
                    <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                        <svg
                          className="size-4 text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        Saran/Catatan
                      </h3>
                      <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-md p-3">
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                          {selectedDetail.saran_petugas}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-neutral-800">
                <button
                  onClick={() => setDetailOpen(false)}
                  className="px-4 py-2 text-sm rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors flex items-center gap-2"
                >
                  <X className="size-4" />
                  Tutup
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiwayatAksi;
