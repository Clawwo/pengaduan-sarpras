import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "../constants/config";
import * as SecureStore from "expo-secure-store";

export interface Pengaduan {
  nama_pengaduan: ReactNode;
  id_pengaduan: number;
  nama_pengguna: string;
  nama_item: string;
  nama_lokasi: string;
  deskripsi: string;
  tanggal_pengaduan: string;
  status: "Diajukan" | "Proses" | "Diterima" | "Ditolak";
  gambar_url?: string;
}

export interface PengaduanStats {
  total: number;
  diterima: number;
  ditolak: number;
  diajukan: number;
  proses: number;
}

export const usePengaduan = () => {
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>([]);
  const [stats, setStats] = useState<PengaduanStats>({
    total: 0,
    diterima: 0,
    ditolak: 0,
    diajukan: 0,
    proses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPengaduan = useCallback(async (retryCount = 0) => {
    try {
      // Wait a bit for token to be saved if first attempt
      if (retryCount === 0) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        // Retry once after 500ms if no token found
        if (retryCount === 0) {
          console.log("Token not found, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 500));
          return fetchPengaduan(1);
        }
        throw new Error("Silakan login kembali");
      }

      console.log(
        "Fetching pengaduan with token:",
        token.substring(0, 20) + "..."
      );

      const response = await axios.get(
        `${config.apiUrl}/api/pengaduan/pengaduanku`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const data: Pengaduan[] = response.data;
      setPengaduanList(data);

      // Calculate stats with proper logic (matching web version)
      const calculatedStats: PengaduanStats = {
        total: data.length,
        diterima: 0,
        ditolak: 0,
        diajukan: 0,
        proses: 0,
      };

      data.forEach((p) => {
        const status = (p.status || "").toLowerCase();
        if (
          status.includes("selesai") ||
          status.includes("diterima") ||
          status.includes("terima")
        ) {
          calculatedStats.diterima++;
        } else if (status.includes("tolak") || status.includes("ditolak")) {
          calculatedStats.ditolak++;
        } else if (status.includes("proses")) {
          calculatedStats.proses++;
        } else {
          calculatedStats.diajukan++;
        }
      });

      setStats(calculatedStats);

      setError(null);
      console.log("Pengaduan fetched successfully:", data.length, "items");
      console.log("Stats calculated:", calculatedStats);
      console.log(
        "Status breakdown:",
        data.map((p) => ({ id: p.id_pengaduan, status: p.status }))
      );
    } catch (err: any) {
      console.error("Error fetching pengaduan:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (err.response?.status === 404) {
        setError("Endpoint tidak ditemukan. Periksa konfigurasi server.");
      } else if (err.code === "ECONNABORTED") {
        setError("Koneksi timeout. Periksa koneksi internet Anda.");
      } else if (err.message === "Network Error") {
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      } else {
        setError(
          err.response?.data?.message || err.message || "Gagal memuat data"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPengaduan(0);
  }, [fetchPengaduan]);

  useEffect(() => {
    fetchPengaduan(0);
  }, [fetchPengaduan]);

  return {
    pengaduanList,
    stats,
    loading,
    error,
    refreshing,
    refresh,
  };
};
