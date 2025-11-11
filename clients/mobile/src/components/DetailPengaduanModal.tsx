import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import config from "../constants/config";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PengaduanDetail {
  id_pengaduan: number;
  nama_pengaduan?: string;
  nama_pengguna: string;
  nama_item: string;
  nama_lokasi: string;
  deskripsi: string;
  tanggal_pengaduan: string;
  status: string;
  gambar_url?: string;
  foto?: string;
  created_at?: string;
  saran_petugas?: string;
  id_temporary?: number;
}

interface DetailPengaduanModalProps {
  visible: boolean;
  pengaduanId: number | null;
  pengaduanData?: PengaduanDetail | null;
  onClose: () => void;
}

export const DetailPengaduanModal: React.FC<DetailPengaduanModalProps> = ({
  visible,
  pengaduanId,
  pengaduanData,
  onClose,
}) => {
  const [pengaduan, setPengaduan] = useState<PengaduanDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      // Animate slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 25,
        stiffness: 120,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate slide down
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const fetchDetail = useCallback(async () => {
    // Jika data sudah diberikan langsung, gunakan itu
    if (pengaduanData) {
      setPengaduan(pengaduanData);
      setLoading(false);
      setError("");
      return;
    }

    if (!pengaduanId) return;

    try {
      setLoading(true);
      setError("");
      setImageError(false);

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("Token autentikasi tidak ditemukan");
        return;
      }

      const response = await axios.get(
        `${config.apiUrl}/api/pengaduan/${pengaduanId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      setPengaduan(response.data.data);
    } catch (err: any) {
      console.error("Error fetching pengaduan detail:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat detail pengaduan"
      );
    } finally {
      setLoading(false);
    }
  }, [pengaduanId, pengaduanData]);

  useEffect(() => {
    if (visible && (pengaduanId || pengaduanData)) {
      fetchDetail();
    }
  }, [visible, pengaduanId, pengaduanData, fetchDetail]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("diterima") || s.includes("selesai")) return "#34d399";
    if (s.includes("tolak")) return "#f87171";
    if (s.includes("proses")) return "#60a5fa";
    return "#fbbf24";
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("diterima") || s.includes("selesai"))
      return "checkmark-circle";
    if (s.includes("tolak")) return "close-circle";
    if (s.includes("proses")) return "time";
    return "hourglass-outline";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPengaduan(null);
      setError("");
      setImageError(false);
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/70" onPress={handleClose}>
        {/* Modal Content */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
          }}
          className="absolute bottom-0 left-0 right-0 border-t-2 bg-neutral-950 rounded-t-3xl border-neutral-800"
        >
          <Pressable>
            {/* Handle Bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1.5 bg-neutral-700 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b-2 border-neutral-700">
              <Text
                className="text-neutral-100 text-[20px]"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Detail Pengaduan
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="items-center justify-center w-10 h-10 rounded-full bg-neutral-800"
              >
                <Ionicons name="close" size={24} color="#d4d4d4" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              className="max-h-[85vh]"
              showsVerticalScrollIndicator={false}
            >
              <View className="p-6">
                {loading ? (
                  <View className="items-center py-20">
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text
                      className="text-neutral-400 mt-4 text-[16px]"
                      style={{ fontFamily: "Poppins_400Regular" }}
                    >
                      Memuat detail...
                    </Text>
                  </View>
                ) : error ? (
                  <View className="items-center py-16">
                    <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-red-900/20">
                      <Ionicons
                        name="alert-circle-outline"
                        size={40}
                        color="#f87171"
                      />
                    </View>
                    <Text
                      className="text-neutral-300 mb-2 text-[17px]"
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                    >
                      Terjadi Kesalahan
                    </Text>
                    <Text
                      className="text-neutral-500 text-center mb-4 text-[15px]"
                      style={{ fontFamily: "Poppins_400Regular" }}
                    >
                      {error}
                    </Text>
                    <TouchableOpacity
                      onPress={fetchDetail}
                      className="px-6 py-3 bg-orange-600 rounded-xl"
                    >
                      <Text
                        className="text-white text-[16px]"
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                      >
                        Coba Lagi
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : pengaduan ? (
                  <View className="space-y-4">
                    {/* Header Info Card */}
                    <View className="p-5 border-2 rounded-xl bg-neutral-900/60 border-neutral-700">
                      {pengaduan.nama_pengaduan && (
                        <Text
                          className="text-neutral-100 text-[19px] mb-2"
                          style={{ fontFamily: "Poppins_700Bold" }}
                        >
                          {pengaduan.nama_pengaduan}
                        </Text>
                      )}

                      <View className="flex-row flex-wrap items-center gap-2 mb-3">
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons
                            name="cube-outline"
                            size={16}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-300 text-[15px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            {pengaduan.nama_item}
                          </Text>
                          {pengaduan.id_temporary && (
                            <Text
                              className="text-amber-400 text-[12px] italic"
                              style={{ fontFamily: "Poppins_400Regular" }}
                            >
                              (sementara)
                            </Text>
                          )}
                        </View>
                        <Text className="text-neutral-600">•</Text>
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-300 text-[15px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            {pengaduan.nama_lokasi}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View
                          className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: `${getStatusColor(pengaduan.status)}15`,
                          }}
                        >
                          <Ionicons
                            name={getStatusIcon(pengaduan.status) as any}
                            size={20}
                            color={getStatusColor(pengaduan.status)}
                          />
                          <Text
                            className="text-[15px]"
                            style={{
                              color: getStatusColor(pengaduan.status),
                              fontFamily: "Poppins_600SemiBold",
                            }}
                          >
                            {pengaduan.status}
                          </Text>
                        </View>
                        <Text
                          className="text-neutral-500 text-[13px]"
                          style={{ fontFamily: "Poppins_400Regular" }}
                        >
                          ID: #{pengaduan.id_pengaduan}
                        </Text>
                      </View>
                    </View>

                    {/* Deskripsi */}
                    {pengaduan.deskripsi && (
                      <View className="p-5 border-2 rounded-xl bg-neutral-900/60 border-neutral-700">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Ionicons
                            name="document-text-outline"
                            size={20}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-400 text-[14px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            Deskripsi
                          </Text>
                        </View>
                        <Text
                          className="text-neutral-300 leading-6 text-[15px]"
                          style={{ fontFamily: "Poppins_400Regular" }}
                        >
                          {pengaduan.deskripsi}
                        </Text>
                      </View>
                    )}

                    {/* Foto */}
                    {(pengaduan.gambar_url || pengaduan.foto) && (
                      <View className="p-5 border-2 rounded-xl bg-neutral-900/60 border-neutral-700">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Ionicons
                            name="image-outline"
                            size={20}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-400 text-[14px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            Foto Pengaduan
                          </Text>
                        </View>

                        {pengaduan.status?.toLowerCase().includes("tolak") ? (
                          <View className="items-center p-6 border-2 border-red-800 bg-red-950/30 rounded-xl">
                            <View className="items-center justify-center mb-2 border-2 rounded-full w-14 h-14 bg-red-900/30 border-red-700">
                              <Ionicons
                                name="close-circle"
                                size={28}
                                color="#f87171"
                              />
                            </View>
                            <Text
                              className="text-red-300 text-[15px] mb-1"
                              style={{ fontFamily: "Poppins_600SemiBold" }}
                            >
                              Foto Tidak Tersedia
                            </Text>
                            <Text
                              className="text-red-400/80 text-[13px] text-center"
                              style={{ fontFamily: "Poppins_400Regular" }}
                            >
                              Pengaduan ini telah ditolak
                            </Text>
                          </View>
                        ) : imageError ? (
                          <View className="items-center p-6 border-2 border-neutral-700 bg-neutral-950/50 rounded-xl">
                            <Ionicons
                              name="alert-circle-outline"
                              size={40}
                              color="#737373"
                            />
                            <Text
                              className="text-neutral-400 text-[14px] mt-2 text-center"
                              style={{ fontFamily: "Poppins_400Regular" }}
                            >
                              Gagal memuat gambar
                            </Text>
                          </View>
                        ) : (
                          <View className="overflow-hidden border-2 rounded-lg border-neutral-600 bg-neutral-950/50">
                            <Image
                              source={{
                                uri: pengaduan.gambar_url || pengaduan.foto,
                              }}
                              className="w-full h-56"
                              resizeMode="contain"
                              onError={() => setImageError(true)}
                            />
                          </View>
                        )}
                      </View>
                    )}

                    {/* Saran Petugas */}
                    {pengaduan.saran_petugas && (
                      <View className="p-5 border-2 rounded-xl bg-blue-950/30 border-blue-800">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Ionicons
                            name="bulb-outline"
                            size={20}
                            color="#60a5fa"
                          />
                          <Text
                            className="text-blue-400 text-[14px]"
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                          >
                            Saran dari Petugas
                          </Text>
                        </View>
                        <Text
                          className="text-blue-200 leading-6 text-[15px]"
                          style={{ fontFamily: "Poppins_400Regular" }}
                        >
                          {pengaduan.saran_petugas}
                        </Text>
                      </View>
                    )}

                    {/* Info Tambahan */}
                    <View className="space-y-2">
                      <View className="flex-row items-center justify-between p-4 border-2 rounded-lg bg-neutral-900/60 border-neutral-700">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-400 text-[14px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            Tanggal Pengajuan
                          </Text>
                        </View>
                        <Text
                          className="text-neutral-100 text-[14px]"
                          style={{ fontFamily: "Poppins_600SemiBold" }}
                        >
                          {formatDate(
                            pengaduan.tanggal_pengaduan ||
                              pengaduan.created_at ||
                              ""
                          )}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between p-4 border-2 rounded-lg bg-neutral-900/60 border-neutral-700">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="person-outline"
                            size={18}
                            color="#a3a3a3"
                          />
                          <Text
                            className="text-neutral-400 text-[14px]"
                            style={{ fontFamily: "Poppins_500Medium" }}
                          >
                            Pelapor
                          </Text>
                        </View>
                        <Text
                          className="text-neutral-100 text-[14px]"
                          style={{ fontFamily: "Poppins_600SemiBold" }}
                        >
                          {pengaduan.nama_pengguna}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
