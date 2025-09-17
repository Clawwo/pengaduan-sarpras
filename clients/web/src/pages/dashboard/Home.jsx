import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppConfig } from "@/lib/useAppConfig";
import { getRiwayatPengaduan } from "@/lib/utils/pengaduan";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  PlusSquare,
  History as HistoryIcon,
  LogOut,
} from "lucide-react";
import { CardAction } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Home = () => {
  const { apiUrl } = useAppConfig();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null); // {type, title, description}
  // recent rows count to display
  const displayCount = 5;

  useEffect(() => {
    (async () => {
      try {
        const data = await getRiwayatPengaduan(apiUrl);
        setRows(data);
      } catch (err) {
        setAlert({
          type: "destructive",
          title: "Gagal memuat data",
          description:
            err?.response?.data?.message ||
            err.message ||
            "Terjadi kesalahan saat memuat data.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  const { total, diterima, ditolak, proses, diajukan } = useMemo(() => {
    const t = rows.length;
    const acc = rows.reduce(
      (a, r) => {
        const status = (r.status || "").toLowerCase();
        if (
          status.includes("selesai") ||
          status.includes("diterima") ||
          status.includes("terima")
        )
          a.diterima++;
        if (status.includes("tolak") || status.includes("ditolak")) a.ditolak++;
        else if (status.includes("proses")) a.proses++;
        else a.diajukan++;
        return a;
      },
      { diterima: 0, ditolak: 0, proses: 0, diajukan: 0 }
    );
    return { total: t, ...acc };
  }, [rows]);

  const recentRows = useMemo(() => rows.slice(0, displayCount), [rows]);

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
  const IconClock = (props) => (
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
    // default: diajukan/menunggu
    return (
      <Badge variant="info">
        <IconClock />
        {statusRaw || "Diajukan"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          floating
          position="top-center"
          variant={alert.type}
          onClose={() => setAlert(null)}
          duration={3500}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.description && (
            <AlertDescription>{alert.description}</AlertDescription>
          )}
        </Alert>
      )}
      {/* Stat Cards */}
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
              {loading ? "-" : total}
            </div>
            <CardDescription>Semua pengaduan yang Anda ajukan</CardDescription>
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
              {loading ? "-" : diterima}
            </div>
            <CardDescription>
              Pengaduan yang sudah diterima/selesai
            </CardDescription>
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
              {loading ? "-" : ditolak}
            </div>
            <CardDescription>Pengaduan yang ditolak</CardDescription>
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
            <CardDescription>Ringkasan status pengaduan Anda</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-neutral-400">Memuat grafik...</div>
          ) : total === 0 ? (
            <div className="text-sm text-neutral-400">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Diajukan", value: diajukan },
                    { name: "Proses", value: proses },
                    { name: "Diterima", value: diterima },
                    { name: "Ditolak", value: ditolak },
                  ]}
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

      {/* Recent History */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-md border border-neutral-700 bg-neutral-800/80 text-neutral-300 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div className="flex items-center gap-4 justify-between">
              <div className="flex flex-col">
                <CardTitle className="text-neutral-100">
                  Riwayat Terbaru
                </CardTitle>
                <CardDescription>
                  {Math.min(displayCount, rows.length) || 0} pengaduan terbaru
                  Anda
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {(loading ? [] : recentRows).map((r) => (
                <TableRow key={r.id_pengaduan}>
                  <TableCell>
                    {new Date(
                      r.created_at || r.tgl_pengajuan
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[220px]"
                    title={r.nama_pengaduan || "-"}
                  >
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
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    className="text-neutral-500 text-center"
                    colSpan={6}
                  >
                    Belum ada pengaduan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
