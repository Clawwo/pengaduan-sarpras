import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppConfig } from "../../lib/useAppConfig";
import { getLokasi, getItems } from "../../lib/utils/reference";
import { createPengaduan } from "../../lib/utils/pengaduan";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Megaphone, ImagePlus, Send, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fieldFocus = "focus-visible:border-orange-500 focus-visible:ring-0";
const textareaBase = `w-full min-w-0 rounded-md border bg-neutral-900/60 border-neutral-700 px-3 py-2 text-sm outline-none text-neutral-100 placeholder:text-neutral-500 ${fieldFocus}`;

const Tambah = () => {
  const { apiUrl } = useAppConfig();
  const [nama_pengaduan, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [id_item, setItem] = useState("");
  const [id_kategori, setKategori] = useState("");
  const [id_lokasi, setLokasi] = useState("");
  const [foto, setFoto] = useState(null);
  const [items, setItems] = useState([]);
  const [kategoriLokasi, setKategoriLokasi] = useState([]);
  const [allLokasi, setAllLokasiList] = useState([]);
  const [filteredLokasi, setFilteredLokasi] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [customItem, setCustomItem] = useState("");
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alerts, setAlerts] = useState([]); // queue of { type, title, description, duration, onClosed }
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const [i, l, kResponse] = await Promise.all([
          getItems(apiUrl),
          getLokasi(apiUrl),
          fetch(`${apiUrl}/api/kategori-lokasi`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);

        // Extract data from response object
        const k = kResponse?.data || kResponse;

        console.log("Kategori Lokasi Response:", kResponse);
        console.log("Kategori Lokasi Data:", k);

        setItems(Array.isArray(i) ? i : []);
        setAllLokasiList(Array.isArray(l) ? l : []);
        setKategoriLokasi(Array.isArray(k) ? k : []);
      } catch (err) {
        console.error("Error loading reference data:", err);
        toast.error(
          err?.response?.data?.message ||
            err.message ||
            "Gagal memuat data referensi"
        );
      }
    })();
  }, [apiUrl]);

  // Filter lokasi by kategori
  useEffect(() => {
    if (!id_kategori) {
      setFilteredLokasi([]);
      setLokasi("");
      setItem("");
      setShowCustomItem(false);
      setCustomItem("");
      return;
    }
    setFilteredLokasi(
      allLokasi.filter((lok) => String(lok.id_kategori) === String(id_kategori))
    );
    setLokasi("");
    setItem("");
    setShowCustomItem(false);
    setCustomItem("");
  }, [id_kategori, allLokasi]);

  // Filter items by lokasi
  useEffect(() => {
    if (!id_lokasi) {
      setFilteredItems([]);
      setItem("");
      setShowCustomItem(false);
      setCustomItem("");
      return;
    }
    setFilteredItems(
      items.filter((it) => String(it.id_lokasi) === String(id_lokasi))
    );
    setItem("");
    setShowCustomItem(false);
    setCustomItem("");
  }, [id_lokasi, items]);

  // Create a preview URL for the selected image (and clean it up when changed)
  const previewUrl = useMemo(
    () => (foto ? URL.createObjectURL(foto) : null),
    [foto]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetForm = () => {
    setNama("");
    setDeskripsi("");
    setKategori("");
    setItem("");
    setLokasi("");
    setFoto(null);
    setCustomItem("");
    setShowCustomItem(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nama_pengaduan || !id_lokasi || (!id_item && !customItem)) {
      const msg = "Nama pengaduan, item, dan lokasi wajib diisi";
      toast.error(msg);
      setAlerts((prev) => [
        ...prev,
        {
          type: "destructive",
          title: "Form belum lengkap",
          description: msg,
          duration: 3000,
        },
      ]);
      return;
    }
    // Open confirmation modal instead of submitting directly
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      setConfirmOpen(false);
      let usedItemId = id_item;
      // For custom items, rely on server to create the temporary item and keep id_item null
      if (showCustomItem && customItem.trim()) {
        usedItemId = null;
      }
      await createPengaduan(apiUrl, {
        nama_pengaduan,
        deskripsi,
        id_item: usedItemId,
        id_lokasi,
        foto,
        nama_item_baru: showCustomItem ? customItem.trim() : undefined,
      });
      const successMsg = showCustomItem
        ? "Pengaduan berhasil diajukan. Item baru akan diverifikasi petugas."
        : "Pengaduan berhasil diajukan";
      toast.success(successMsg);
      setAlerts((prev) => [
        ...prev,
        {
          type: "default",
          title: "Berhasil",
          description: successMsg,
          duration: 3000,
        },
      ]);
      resetForm();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Gagal mengajukan pengaduan";
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {alerts[0] && (
        <Alert
          floating
          position="top-center"
          variant={alerts[0].type}
          onClose={() => {
            const closed = alerts[0];
            setAlerts((prev) => prev.slice(1));
            if (closed && typeof closed.onClosed === "function") {
              closed.onClosed();
            }
          }}
          duration={alerts[0].duration ?? 3000}
        >
          <AlertTitle>{alerts[0].title}</AlertTitle>
          {alerts[0].description && (
            <AlertDescription>{alerts[0].description}</AlertDescription>
          )}
        </Alert>
      )}
      <Card className="bg-neutral-950/50 border-neutral-800">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-neutral-100">Tambah Pengaduan</CardTitle>
          <CardDescription className="text-neutral-400">
            Isi form singkat di bawah untuk mengajukan aduan.
          </CardDescription>
          <CardAction>
            <div className="size-9 rounded-md bg-neutral-800/60 text-neutral-300 grid place-items-center">
              <Megaphone className="size-5" />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left: Upload section */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <ImagePlus className="size-4 text-orange-400" /> Foto
                    (opsional)
                  </label>
                  {foto && (
                    <button
                      type="button"
                      onClick={() => {
                        setFoto(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1"
                      title="Hapus foto"
                    >
                      <X className="size-3.5" /> Hapus
                    </button>
                  )}
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f && f.type?.startsWith("image/")) setFoto(f);
                  }}
                  className="relative grid place-items-center rounded-lg border-2 border-dashed border-neutral-700 hover:border-orange-500/60 hover:bg-neutral-900/60 transition-colors cursor-pointer min-h-64"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-h-72 w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="mx-auto mb-3 size-10 rounded-full bg-neutral-800/70 border border-neutral-700 grid place-items-center text-neutral-300">
                        <ImagePlus className="size-5" />
                      </div>
                      <div className="text-neutral-200 font-medium">
                        Klik untuk unggah
                      </div>
                      <div className="text-sm text-neutral-500">
                        atau seret dan lepas gambar di sini
                      </div>
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-neutral-700"
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  Format gambar .jpg, .png, atau .webp. Maks ~2MB.
                </p>
              </div>
            </div>

            {/* Right: Form fields */}
            <div className="lg:col-span-7 grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-neutral-300">
                  Nama Pengaduan
                </label>
                <Input
                  type="text"
                  value={nama_pengaduan}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="contoh: Kerusakan Kursi di Lab 1"
                  className={`bg-neutral-900/60 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 ${fieldFocus}`}
                  required
                  style={{ boxShadow: "none" }}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-neutral-300">
                  Deskripsi
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className={textareaBase}
                  rows={5}
                  placeholder="Tambahkan detail jika perlu"
                />
              </div>

              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-neutral-300">
                    Kategori Lokasi
                  </label>
                  <Select value={id_kategori} onValueChange={setKategori}>
                    <SelectTrigger
                      className={`w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 ${fieldFocus}`}
                    >
                      <SelectValue placeholder="Pilih kategori lokasi" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="bg-neutral-900/95 border-neutral-700 max-h-60 overflow-y-auto"
                    >
                      {Array.isArray(kategoriLokasi) &&
                        kategoriLokasi.map((k) => (
                          <SelectItem
                            key={k.id_kategori}
                            value={String(k.id_kategori)}
                            className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                          >
                            {k.nama_kategori}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-neutral-300">
                      Lokasi
                    </label>
                    <Select
                      value={id_lokasi}
                      onValueChange={setLokasi}
                      disabled={!id_kategori}
                    >
                      <SelectTrigger
                        className={`w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 ${fieldFocus}`}
                      >
                        <SelectValue
                          placeholder={
                            id_kategori ? "Pilih lokasi" : "Pilih kategori dulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="bg-neutral-900/95 border-neutral-700 max-h-60 overflow-y-auto"
                      >
                        {Array.isArray(filteredLokasi) &&
                          filteredLokasi.map((l) => (
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
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-neutral-300">
                      Item
                    </label>
                    <Select
                      value={id_item}
                      onValueChange={(val) => {
                        setItem(val);
                        setShowCustomItem(val === "CUSTOM");
                      }}
                      disabled={!id_lokasi}
                    >
                      <SelectTrigger
                        className={`w-full bg-neutral-900/60 border-neutral-700 text-neutral-100 data-[placeholder]:text-neutral-500 ${fieldFocus}`}
                      >
                        <SelectValue
                          placeholder={
                            id_lokasi ? "Pilih item" : "Pilih lokasi dulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="bg-neutral-900/95 border-neutral-700 max-h-60 overflow-y-auto"
                      >
                        {Array.isArray(filteredItems) &&
                          filteredItems.map((it) => (
                            <SelectItem
                              key={it.id_item}
                              value={String(it.id_item)}
                              className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
                            >
                              {it.nama_item}
                            </SelectItem>
                          ))}
                        <SelectItem
                          value="CUSTOM"
                          className="text-orange-400 focus:bg-neutral-800 focus:text-orange-400"
                        >
                          Item lainnya...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showCustomItem && (
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-neutral-300">
                      Nama Item Baru
                    </label>
                    <input
                      type="text"
                      value={customItem}
                      onChange={(e) => setCustomItem(e.target.value)}
                      className={`w-full rounded-md border bg-neutral-900/60 border-neutral-700 px-3 py-2 text-sm outline-none text-neutral-100 placeholder:text-neutral-500 ${fieldFocus}`}
                      placeholder="Masukkan nama item baru..."
                      required
                    />
                    <p className="text-xs text-orange-400">
                      Item baru akan diverifikasi petugas sebelum bisa
                      digunakan.
                    </p>
                  </div>
                )}
              </div>

              <CardFooter className="px-0 mt-2 gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 text-sm font-semibold transition-colors"
                >
                  {loading ? "Mengirim..." : "Kirim Pengaduan"}
                </button>
              </CardFooter>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal Konfirmasi */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-neutral-900/95 border-neutral-800 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-neutral-100 flex items-center gap-2">
              <Send className="size-5 text-orange-500" />
              Konfirmasi Pengaduan
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Pastikan data pengaduan Anda sudah benar sebelum mengirim.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-neutral-800/40 rounded-md p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Nama Pengaduan:</span>
                <span className="text-neutral-100 font-medium">{nama_pengaduan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Lokasi:</span>
                <span className="text-neutral-100">
                  {filteredLokasi.find((l) => String(l.id_lokasi) === String(id_lokasi))?.nama_lokasi || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Item:</span>
                <span className="text-neutral-100">
                  {showCustomItem ? (
                    <span>
                      {customItem} <span className="text-amber-400 text-xs italic">(item baru)</span>
                    </span>
                  ) : (
                    filteredItems.find((i) => String(i.id_item) === String(id_item))?.nama_item || "-"
                  )}
                </span>
              </div>
              {deskripsi && (
                <div className="pt-2 border-t border-neutral-700">
                  <span className="text-neutral-400 block mb-1">Deskripsi:</span>
                  <span className="text-neutral-100 text-xs">{deskripsi}</span>
                </div>
              )}
              {foto && (
                <div className="pt-2 border-t border-neutral-700">
                  <span className="text-neutral-400 block mb-1">Foto:</span>
                  <span className="text-green-400 text-xs">✓ Foto terlampir</span>
                </div>
              )}
            </div>

            {showCustomItem && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-md p-3">
                <p className="text-xs text-amber-300">
                  <strong>Catatan:</strong> Item baru yang Anda ajukan akan diverifikasi oleh petugas terlebih dahulu.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Periksa Kembali
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Kirim Pengaduan
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tambah;
