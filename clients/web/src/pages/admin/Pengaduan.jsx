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
  ImageIcon,
  X,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  if (s.includes("setuju")) {
    return (
      <Badge variant="success">
        <IconCheck />
        {statusRaw || "Disetujui"}
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
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");
  const [reportStatuses, setReportStatuses] = useState(new Set());
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

  const openManage = (row) => {
    setCurrent(row);
    setStatus(""); // Start with empty to show placeholder
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
      if (status === "Disetujui") backendStatus = "Disetujui";
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

  const generateReport = () => {
    let dataToReport = rows;

    // Filter by date range
    if (reportDateFrom) {
      dataToReport = dataToReport.filter((r) => {
        const dateStr = new Date(r.created_at || r.tgl_pengajuan)
          .toISOString()
          .split("T")[0];
        return dateStr >= reportDateFrom;
      });
    }
    if (reportDateTo) {
      dataToReport = dataToReport.filter((r) => {
        const dateStr = new Date(r.created_at || r.tgl_pengajuan)
          .toISOString()
          .split("T")[0];
        return dateStr <= reportDateTo;
      });
    }

    // Filter by status
    if (reportStatuses.size > 0) {
      dataToReport = dataToReport.filter((r) => {
        const norm = normalizeStatus(r.status);
        return reportStatuses.has(norm);
      });
    }

    return dataToReport;
  };

  const printReport = () => {
    const dataToReport = generateReport();

    if (dataToReport.length === 0) {
      toast.error("Tidak ada data untuk dicetak");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup diblokir. Izinkan popup untuk mencetak.");
      return;
    }

    const dateFromStr = reportDateFrom
      ? new Date(reportDateFrom).toLocaleDateString("id-ID")
      : "-";
    const dateToStr = reportDateTo
      ? new Date(reportDateTo).toLocaleDateString("id-ID")
      : "-";

    const statusLabels = {
      diajukan: "Diajukan",
      proses: "Diproses",
      diterima: "Selesai/Diterima",
      ditolak: "Ditolak",
    };
    const selectedStatusText =
      reportStatuses.size > 0
        ? Array.from(reportStatuses)
            .map((s) => statusLabels[s])
            .join(", ")
        : "Semua Status";

    const now = new Date().toLocaleString("id-ID");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan Pengaduan Sarana & Prasarana</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20mm;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #f97316;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #1a1a1a;
          }
          .header h2 {
            font-size: 18px;
            font-weight: normal;
            color: #666;
          }
          .meta {
            margin-bottom: 20px;
            font-size: 13px;
            color: #555;
            line-height: 1.6;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .meta-label {
            font-weight: 600;
            min-width: 150px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          th {
            background-color: #f97316;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e5e5e5;
            vertical-align: top;
          }
          tr:hover {
            background-color: #f9f9f9;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-diajukan { background-color: #e0f2fe; color: #0369a1; }
          .status-proses { background-color: #fef3c7; color: #b45309; }
          .status-selesai { background-color: #d1fae5; color: #065f46; }
          .status-ditolak { background-color: #fee2e2; color: #991b1b; }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #e5e5e5;
            font-size: 11px;
            color: #666;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .signature {
            margin-top: 60px;
            text-align: right;
            font-size: 12px;
          }
          .signature-line {
            margin-top: 80px;
            border-top: 1px solid #333;
            width: 200px;
            display: inline-block;
          }
          @media print {
            body { padding: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN PENGADUAN</h1>
          <h2>Sistem Pengaduan Sarana & Prasarana</h2>
        </div>
        
        <div class="meta">
          <div class="meta-row">
            <div><span class="meta-label">Periode:</span> ${dateFromStr} s/d ${dateToStr}</div>
          </div>
          <div class="meta-row">
            <div><span class="meta-label">Status:</span> ${selectedStatusText}</div>
          </div>
          <div class="meta-row">
            <div><span class="meta-label">Total Data:</span> ${
              dataToReport.length
            } pengaduan</div>
          </div>
          <div class="meta-row">
            <div><span class="meta-label">Dicetak:</span> ${now}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 3%;">No</th>
              <th style="width: 10%;">Tanggal</th>
              <th style="width: 18%;">Nama Pengaduan</th>
              <th style="width: 12%;">Item</th>
              <th style="width: 12%;">Lokasi</th>
              <th style="width: 30%;">Deskripsi</th>
              <th style="width: 10%;">Status</th>
              <th style="width: 5%;">Petugas</th>
            </tr>
          </thead>
          <tbody>
            ${dataToReport
              .map((r, idx) => {
                const date = new Date(
                  r.created_at || r.tgl_pengajuan
                ).toLocaleDateString("id-ID");
                const statusNorm = normalizeStatus(r.status);
                let statusClass = "status-diajukan";
                let statusText = r.status || "Diajukan";
                if (statusNorm === "proses") {
                  statusClass = "status-proses";
                } else if (statusNorm === "diterima") {
                  statusClass = "status-selesai";
                } else if (statusNorm === "ditolak") {
                  statusClass = "status-ditolak";
                }
                const saranPetugas = r.saran_petugas
                  ? `<br/><small style="color: #666;">Saran: ${r.saran_petugas}</small>`
                  : "";
                return `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${date}</td>
                    <td><strong>${r.nama_pengaduan || "-"}</strong></td>
                    <td>${r.nama_item || "-"}${
                  r.id_temporary
                    ? ' <em style="color: #d97706;">(temp)</em>'
                    : ""
                }</td>
                    <td>${r.nama_lokasi || "-"}</td>
                    <td style="font-size: 10px;">${r.deskripsi || "-"}</td>
                    <td>
                      <span class="status-badge ${statusClass}">${statusText}</span>
                      ${saranPetugas}
                    </td>
                    <td style="text-align: center;">${
                      r.nama_petugas || "-"
                    }</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="signature">
          <p>Mengetahui,</p>
          <p style="margin-top: 5px; font-weight: 600;">Administrator</p>
          <div class="signature-line"></div>
          <p style="margin-top: 5px;">(__________________)</p>
        </div>

        <div class="footer">
          <div>Sistem Pengaduan Sarana & Prasarana</div>
          <div>Halaman 1 dari 1</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
        <div className="flex items-center justify-center border rounded-md size-7 border-neutral-700 bg-neutral-800/80 text-neutral-300">
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* Left side: Search + Filter */}
        <div className="flex items-center w-full gap-2 sm:max-w-lg">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 flex items-center pointer-events-none left-3 text-neutral-500">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengaduan, item, lokasi, deskripsi..."
              className="w-full py-2 pr-3 text-sm border rounded-md outline-none border-neutral-800 bg-neutral-900/60 pl-9 text-neutral-200 placeholder:text-neutral-500 focus:ring-0 focus:border-neutral-700"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800"
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
              <div className="absolute left-0 z-20 w-56 p-3 mt-2 border rounded-md shadow-lg border-neutral-800 bg-neutral-900/95 backdrop-blur">
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
                <div className="flex items-center justify-between pt-2 mt-3 border-t border-neutral-800">
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

        {/* Right side: Print Report + Total */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportDialog(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors bg-orange-500 border border-orange-600 rounded-md hover:bg-orange-600"
          >
            <Printer className="size-4" />
            Cetak Laporan
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md border-neutral-800 bg-neutral-900/60 text-neutral-300">
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
                <div className="flex items-center min-w-0 gap-1">
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
                  className="px-2 py-1 text-xs border rounded-md border-neutral-700 hover:bg-neutral-800"
                  onClick={() => openManage(r)}
                >
                  Kelola
                </button>
              </TableCell>
            </TableRow>
          ))}
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-neutral-500" colSpan={7}>
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
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-neutral-100">
              Kelola Pengaduan
            </SheetTitle>
            <SheetDescription className="text-sm text-neutral-400">
              Ubah status dan berikan saran untuk pengguna.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={submitManage}
            className="flex flex-col h-[calc(100vh-140px)]"
          >
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-[13.5px]">
              {current && (
                <div className="p-3 text-sm border rounded-md text-neutral-300 bg-neutral-900/60 border-neutral-800">
                  <div className="font-medium text-neutral-100">
                    {current.nama_pengaduan}
                  </div>
                  <div className="text-neutral-400">
                    {current.nama_item} • {current.nama_lokasi}
                  </div>
                  {current.deskripsi ? (
                    <div className="mt-2 whitespace-pre-wrap text-neutral-300">
                      {current.deskripsi}
                    </div>
                  ) : null}

                  {/* Foto Pengaduan */}
                  {current.foto && (
                    <div className="pt-3 mt-3 border-t border-neutral-700">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="size-4 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-400">
                          Foto Pengaduan
                        </span>
                      </div>

                      {/* Check if status is Ditolak */}
                      {current.status?.toLowerCase().includes("tolak") ? (
                        <div className="w-full p-6 text-center border-2 rounded-md border-red-900/50 bg-red-950/30">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 border rounded-full bg-red-900/30 border-red-800/50">
                              <svg
                                className="text-red-400 size-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-300">
                                Foto Tidak Tersedia
                              </p>
                              <p className="mt-1 text-xs text-red-400/80">
                                Pengaduan ini telah ditolak
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative cursor-pointer group"
                          onClick={() => {
                            setSelectedImage(current.foto);
                            setImageModalOpen(true);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedImage(current.foto);
                              setImageModalOpen(true);
                            }
                          }}
                        >
                          <img
                            src={current.foto}
                            alt="Foto pengaduan"
                            className="w-full h-auto max-h-[300px] object-contain rounded-md border-2 border-neutral-700 bg-neutral-950/50 group-hover:border-orange-500 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23262626" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23737373" font-size="14"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E';
                              e.target.className =
                                "w-full h-auto max-h-[200px] object-contain rounded-md border-2 border-neutral-800 bg-neutral-950/50";
                            }}
                          />
                          <div className="absolute inset-0 flex items-end justify-center pb-4 transition-opacity duration-200 rounded-md opacity-0 pointer-events-none bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:opacity-100">
                            <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md shadow-lg">
                              <svg
                                className="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              > 
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                              </svg>
                              Klik untuk memperbesar
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm text-neutral-300 mb-1.5">
                  Status
                </label>
                <Select value={status || ""} onValueChange={setStatus}>
                  <SelectTrigger
                    className={`w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 focus-visible:border-orange-500 focus-visible:ring-0`}
                  >
                    <SelectValue placeholder="Pilih status pengaduan" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="overflow-y-auto bg-neutral-900/95 border-neutral-700 max-h-60"
                  >
                    <SelectItem
                      value="Disetujui"
                      className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                    >
                      Disetujui
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
                  Pilih status sesuai progres pengaduan. "Disetujui" = diterima
                  untuk diproses.
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
            </div>
            <div className="px-4 py-4 mt-auto border-t border-neutral-800 bg-neutral-900/60">
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 font-medium"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                  >
                    Batal
                  </button>
                </SheetClose>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="border-neutral-800 bg-neutral-900/95 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-100">
              <FileText className="text-orange-500 size-5" />
              Cetak Laporan Pengaduan
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Pilih periode dan status untuk laporan yang akan dicetak.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Date Range */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-300">
                Periode Tanggal
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">
                    Dari
                  </label>
                  <input
                    type="date"
                    value={reportDateFrom}
                    onChange={(e) => setReportDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none border-neutral-800 bg-neutral-900/60 text-neutral-200 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">
                    Sampai
                  </label>
                  <input
                    type="date"
                    value={reportDateTo}
                    onChange={(e) => setReportDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none border-neutral-800 bg-neutral-900/60 text-neutral-200 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Kosongkan untuk menampilkan semua data
              </p>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-300">
                Filter Status
              </label>
              <div className="p-3 space-y-2 border rounded-md border-neutral-800 bg-neutral-900/60">
                {[
                  { key: "diajukan", label: "Diajukan" },
                  { key: "proses", label: "Diproses" },
                  { key: "diterima", label: "Diterima/Selesai" },
                  { key: "ditolak", label: "Ditolak" },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 text-sm cursor-pointer text-neutral-300 hover:text-neutral-100"
                  >
                    <Checkbox
                      checked={reportStatuses.has(opt.key)}
                      onCheckedChange={(checked) => {
                        setReportStatuses((prev) => {
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
              <p className="text-xs text-neutral-500">
                Kosongkan untuk menampilkan semua status
              </p>
            </div>

            {/* Preview Info */}
            <div className="p-3 border rounded-md bg-orange-500/10 border-orange-500/20">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <svg
                    className="text-orange-500 size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-orange-200">
                  <p className="mb-1 font-medium">Info Laporan</p>
                  <p>
                    Total data yang akan dicetak:{" "}
                    <strong>{generateReport().length} pengaduan</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowReportDialog(false)}
              className="px-4 py-2 text-sm transition-colors border rounded-md border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                printReport();
                setShowReportDialog(false);
              }}
              disabled={generateReport().length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="size-4" />
              Cetak Laporan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onOpenChange={(open) => {
          setImageModalOpen(open);
          if (!open) {
            setImageLoading(true);
            setImageError(false);
          }
        }}
      >
        <DialogContent className="border-neutral-800 bg-neutral-900/95 sm:max-w-[90vw] md:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-neutral-800">
            <DialogTitle className="flex items-center gap-2 text-neutral-100">
              <ImageIcon className="text-orange-500 size-5" />
              Foto Pengaduan
            </DialogTitle>
          </DialogHeader>

          <div className="relative bg-neutral-950 flex items-center justify-center min-h-[300px] max-h-[70vh]">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 rounded-full animate-spin border-neutral-700 border-t-orange-500"></div>
                  <p className="text-sm text-neutral-400">Memuat gambar...</p>
                </div>
              </div>
            )}

            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <svg
                    className="size-16 text-neutral-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="font-medium text-neutral-300">
                      Gagal memuat gambar
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      URL gambar mungkin tidak valid atau sudah dihapus
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedImage && (
              <img
                src={selectedImage}
                alt="Foto pengaduan detail"
                className={`w-full h-full max-h-[70vh] object-contain transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            )}

            {/* Close button overlay */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute z-10 p-2 transition-colors border rounded-full shadow-lg top-4 right-4 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700"
              aria-label="Tutup"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-neutral-900/60 border-neutral-800">
            <p className="text-xs text-neutral-400">
              Klik tombol X atau tekan ESC untuk menutup
            </p>
            {!imageError && (
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors"
              >
                <svg
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Buka di tab baru
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
