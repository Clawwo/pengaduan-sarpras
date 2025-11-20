import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Calendar,
  MapPin,
  Package,
  FileText,
  User,
  Image as ImageIcon,
  Clock,
  X,
  ZoomIn,
} from "lucide-react";

const DetailPengaduanModal = ({ open, onOpenChange, pengaduan }) => {
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState({ url: "", title: "" });

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

  const handleZoomImage = (url, title) => {
    setZoomedImage({ url, title });
    setImageZoomOpen(true);
  };

  if (!pengaduan) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-neutral-900 border-neutral-800 text-neutral-100 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Eye className="text-orange-400 size-5" />
              Detail Pengaduan
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Alert: Ada Bukti Foto dari Petugas */}
            {pengaduan.gambar_bukti_selesai && (
              <div className="p-4 border-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500 rounded-lg shrink-0">
                    <svg
                      className="text-white size-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-1 font-semibold text-green-300">
                      Pengaduan Selesai dengan Bukti Foto!
                    </h4>
                    <p className="text-sm text-green-200">
                      Petugas telah mengirimkan foto bukti penyelesaian.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Horizontal Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column - Informasi Pengaduan */}
              <div className="space-y-4">
                <h3 className="pb-2 text-lg font-semibold border-b text-neutral-200 border-neutral-800">
                  Informasi Pengaduan
                </h3>

                {/* Info Grid */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <FileText className="size-3.5" />
                      Nama Pengaduan
                    </div>
                    <div className="text-sm font-medium text-neutral-100">
                      {pengaduan.nama_pengaduan}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Package className="size-3.5" />
                        Item
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-neutral-100">
                          {pengaduan.nama_item}
                        </span>
                        {pengaduan.id_temporary && (
                          <Badge
                            variant="warning"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Sementara
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <MapPin className="size-3.5" />
                        Lokasi
                      </div>
                      <div className="text-sm text-neutral-100">
                        {pengaduan.nama_lokasi}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Calendar className="size-3.5" />
                        Tanggal
                      </div>
                      <div className="text-sm text-neutral-100">
                        {new Date(
                          pengaduan.created_at || pengaduan.tgl_pengajuan
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Clock className="size-3.5" />
                        Status
                      </div>
                      <div>{renderStatus(pengaduan.status)}</div>
                    </div>
                  </div>

                  {pengaduan.nama_petugas && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <User className="size-3.5" />
                        Petugas
                      </div>
                      <div className="text-sm text-neutral-100">
                        {pengaduan.nama_petugas}
                      </div>
                    </div>
                  )}

                  {pengaduan.tgl_selesai && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Calendar className="size-3.5" />
                        Tanggal Selesai
                      </div>
                      <div className="text-sm text-neutral-100">
                        {new Date(pengaduan.tgl_selesai).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Deskripsi */}
                {pengaduan.deskripsi && (
                  <div className="pt-2 space-y-2 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <FileText className="size-3.5" />
                      Deskripsi Pengaduan
                    </div>
                    <div className="p-3 overflow-y-auto text-sm whitespace-pre-wrap rounded-lg text-neutral-200 bg-neutral-800/40 max-h-32">
                      {pengaduan.deskripsi}
                    </div>
                  </div>
                )}

                {/* Saran Petugas */}
                {pengaduan.saran_petugas && (
                  <div className="pt-2 space-y-2 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <User className="size-3.5" />
                      Saran dari Petugas
                    </div>
                    <div className="p-3 overflow-y-auto text-sm whitespace-pre-wrap border rounded-lg text-neutral-200 bg-orange-500/10 border-orange-500/20 max-h-32">
                      {pengaduan.saran_petugas}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Gambar */}
              <div className="space-y-4">
                <h3 className="pb-2 text-lg font-semibold border-b text-neutral-200 border-neutral-800">
                  Dokumentasi Foto
                </h3>

                {/* Foto Pengaduan */}
                {pengaduan.foto && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                      <ImageIcon className="text-orange-400 size-4" />
                      Foto Pengaduan Awal
                    </div>
                    <div className="p-3 border rounded-lg bg-neutral-800/40 border-neutral-800">
                      <div className="relative w-full mb-3 overflow-hidden rounded-lg aspect-video bg-neutral-950">
                        <img
                          src={pengaduan.foto}
                          alt="Foto Pengaduan"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent hover:opacity-100">
                          <button
                            onClick={() =>
                              handleZoomImage(
                                pengaduan.foto,
                                "Foto Pengaduan Awal"
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/90 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
                          >
                            <ZoomIn className="size-4" />
                            Perbesar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Foto Bukti Penyelesaian */}
                {pengaduan.gambar_bukti_selesai && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                      <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Bukti Penyelesaian dari Petugas
                    </div>
                    <div className="p-3 border-2 rounded-lg bg-green-500/10 border-green-500/30">
                      <div className="relative w-full mb-3 overflow-hidden rounded-lg aspect-video bg-neutral-950">
                        <img
                          src={pengaduan.gambar_bukti_selesai}
                          alt="Bukti Penyelesaian"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-4 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent hover:opacity-100">
                          <button
                            onClick={() =>
                              handleZoomImage(
                                pengaduan.gambar_bukti_selesai,
                                "Bukti Penyelesaian"
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/90 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                          >
                            <ZoomIn className="size-4" />
                            Perbesar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placeholder jika tidak ada gambar */}
                {!pengaduan.foto && !pengaduan.gambar_bukti_selesai && (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-neutral-800/40 border-neutral-700">
                    <div className="text-center text-neutral-500">
                      <ImageIcon className="mx-auto mb-2 opacity-50 size-12" />
                      <p className="text-sm">Tidak ada foto tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-neutral-800">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 transition-colors border rounded-md border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Zoom Gambar - Lightbox Style */}
      <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black/95 border-neutral-700 p-0 overflow-hidden">
          <div className="relative w-full h-full">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <ImageIcon className="text-orange-400 size-5" />
                  {zoomedImage.title}
                </h3>
                <button
                  onClick={() => setImageZoomOpen(false)}
                  className="p-2 text-white transition-colors rounded-lg bg-neutral-800/80 hover:bg-neutral-700"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Gambar */}
            <div className="flex items-center justify-center w-full h-[85vh] p-8">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-neutral-300">
                  Klik di luar gambar atau tombol X untuk menutup
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetailPengaduanModal;
