import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import config from "../constants/config";
import { KategoriLokasi, Lokasi, Item } from "../types/pengaduan";

export const useKategoriLokasi = () => {
  const [kategoriList, setKategoriList] = useState<KategoriLokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchKategori = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/kategori-lokasi`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      setKategoriList(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching kategori lokasi:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat kategori"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  return { kategoriList, loading, error, refresh: fetchKategori };
};

export const useLokasiByKategori = (idKategori: number | null) => {
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLokasi = useCallback(async () => {
    if (!idKategori) {
      setLokasiList([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const response = await axios.get(
        `${config.apiUrl}/api/kategori-lokasi/${idKategori}/lokasi`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      setLokasiList(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching lokasi:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat lokasi"
      );
    } finally {
      setLoading(false);
    }
  }, [idKategori]);

  useEffect(() => {
    fetchLokasi();
  }, [fetchLokasi]);

  return { lokasiList, loading, error, refresh: fetchLokasi };
};

export const useItemsByLokasi = (idLokasi: number | null) => {
  const [itemList, setItemList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    if (!idLokasi) {
      setItemList([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const response = await axios.get(
        `${config.apiUrl}/api/items?id_lokasi=${idLokasi}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      setItemList(response.data || []);
    } catch (err: any) {
      console.error("Error fetching items:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat item"
      );
    } finally {
      setLoading(false);
    }
  }, [idLokasi]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { itemList, loading, error, refresh: fetchItems };
};
