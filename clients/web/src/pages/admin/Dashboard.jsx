import React, { useEffect, useMemo, useState } from "react";
import { useAppConfig } from "@/lib/useAppConfig";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

const Dashboard = () => {
  const { apiUrl } = useAppConfig();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pengaduan: 0,
    diajukan: 0,
    proses: 0,
    selesai: 0,
    ditolak: 0,
    items: 0,
    lokasi: 0,
    petugas: 0,
    tempItems: 0,
  });
  const [recentPengaduan, setRecentPengaduan] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const run = async () => {
      try {
        setLoading(true);
        const [pengaduanRes, itemsRes, lokasiRes, petugasRes] =
          await Promise.all([
            axios.get(`${apiUrl}/api/pengaduan`, {
              headers,
              params: { page: 1, limit: 5 },
            }),
            axios.get(`${apiUrl}/api/items`, { headers }),
            axios.get(`${apiUrl}/api/lokasi`, { headers }),
            axios.get(`${apiUrl}/api/petugas`, { headers }),
          ]);
        const pengaduanRows = Array.isArray(pengaduanRes.data)
          ? pengaduanRes.data
          : pengaduanRes.data?.data?.rows || pengaduanRes.data?.data || [];
        const itemsRows = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : itemsRes.data?.data || [];
        const lokasiRows = Array.isArray(lokasiRes.data)
          ? lokasiRes.data
          : lokasiRes.data?.data || [];
        const petugasRows = Array.isArray(petugasRes.data)
          ? petugasRes.data
          : petugasRes.data?.data || [];
        // Aggregate status counts from pengaduan rows
        const agg = pengaduanRows.reduce(
          (acc, r) => {
            const s = (r.status || "").toLowerCase();
            if (s.includes("selesai") || s.includes("terima")) acc.selesai += 1;
            else if (s.includes("tolak")) acc.ditolak += 1;
            else if (s.includes("proses")) acc.proses += 1;
            else acc.diajukan += 1;
            return acc;
          },
          { diajukan: 0, proses: 0, selesai: 0, ditolak: 0 }
        );
        setCounts({
          pengaduan:
            pengaduanRows.length || pengaduanRes.data?.data?.total || 0,
          diajukan: agg.diajukan,
          proses: agg.proses,
          selesai: agg.selesai,
          ditolak: agg.ditolak,
          items: itemsRows.length || 0,
          lokasi: lokasiRows.length || 0,
          petugas: petugasRows.length || 0,
          tempItems: 0,
        });
        setRecentPengaduan(pengaduanRows.slice(0, 5));
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Gagal memuat data dashboard"
        );
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiUrl]);

  // Temporary item moderation handlers removed

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
  const IconClockInline = (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
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
        <IconClockInline />
        {statusRaw || "Diajukan"}
      </Badge>
    );
  };

  const chartData = useMemo(
    () => [
      { name: "Diajukan", value: counts.diajukan },
      { name: "Proses", value: counts.proses },
      { name: "Diterima", value: counts.selesai },
      { name: "Ditolak", value: counts.ditolak },
    ],
    [counts.diajukan, counts.proses, counts.selesai, counts.ditolak]
  );

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-lg md:text-xl font-semibold text-neutral-100">
          Dashboard Admin
        </h1>
        <p className="text-sm text-neutral-400">
          Ringkasan sistem dan aktivitas terbaru.
        </p>
      </div>

      {/* Stat Cards (match Home.jsx style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader>
            <CardAction>
              <div className="size-8 rounded-md border border-neutral-700 bg-neutral-800/70 text-neutral-300 flex items-center justify-center">
                <FileText className="size-4" />
              </div>
            </CardAction>
            <CardTitle className="text-neutral-300 text-sm">
              Total Pengaduan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-100 mb-2">
              {loading ? "-" : counts.pengaduan}
            </div>
            <p className="text-sm text-neutral-400">
              Semua pengaduan yang terdaftar
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader>
            <CardAction>
              <div className="size-8 rounded-md border border-neutral-700 bg-neutral-800/70 text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </CardAction>
            <CardTitle className="text-neutral-300 text-sm">
              Diterima/Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-300 mb-2">
              {loading ? "-" : counts.selesai}
            </div>
            <p className="text-sm text-neutral-400">
              Pengaduan yang sudah diterima/selesai
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader>
            <CardAction>
              <div className="size-8 rounded-md border border-neutral-700 bg-neutral-800/70 text-red-300 flex items-center justify-center">
                <XCircle className="size-4" />
              </div>
            </CardAction>
            <CardTitle className="text-neutral-300 text-sm">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-300 mb-2">
              {loading ? "-" : counts.ditolak}
            </div>
            <p className="text-sm text-neutral-400">Pengaduan yang ditolak</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Chart */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md border border-neutral-700 bg-neutral-800/80 text-neutral-300 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <CardTitle className="text-neutral-100">
              Distribusi Status
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Ringkasan status pengaduan
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-neutral-400">Memuat grafik...</div>
          ) : counts.pengaduan === 0 ? (
            <div className="text-sm text-neutral-400">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0a",
                      border: "1px solid #27272a",
                      borderRadius: "5px",
                      color: "#e5e7eb",
                    }}
                    cursor={{ fill: "#ffffff08" }}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pengaduan Terbaru (full width) */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-sm text-neutral-400">
            Pengaduan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Pengaduan</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPengaduan.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-neutral-400"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
                {recentPengaduan.map((r) => (
                  <TableRow key={r.id_pengaduan}>
                    <TableCell>
                      {new Date(
                        r.created_at || r.tgl_pengajuan || r.tgl_pengaduan
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-[220px]"
                      title={r.nama_pengaduan || r.judul || "-"}
                    >
                      {r.nama_pengaduan || r.judul || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="truncate" title={r.nama_item || "-"}>
                          {r.nama_item || "-"}
                        </span>
                        {r?.id_temporary ? (
                          <span className="shrink-0 text-[11px] text-amber-300/90 italic">
                            (sementara)
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{r.nama_lokasi || "-"}</TableCell>
                    <TableCell
                      className="truncate max-w-[360px]"
                      title={r.deskripsi || "-"}
                    >
                      {r?.deskripsi && r.deskripsi.length > 140
                        ? `${r.deskripsi.slice(0, 140)}...`
                        : r.deskripsi || "-"}
                    </TableCell>
                    <TableCell>{renderStatus(r.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
