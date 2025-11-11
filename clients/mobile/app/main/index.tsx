import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { usePengaduan } from "../../src/hooks/usePengaduan";
import { StatCard } from "../../src/components/StatCard";
import { StatusChart } from "../../src/components/StatusChart";
import { PengaduanCard } from "../../src/components/PengaduanCard";
import { DetailPengaduanModal } from "../../src/components/DetailPengaduanModal";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { stats, pengaduanList, loading, refreshing, refresh, error } =
    usePengaduan();
  const recentPengaduan = pengaduanList.slice(0, 5);
  const [selectedPengaduanId, setSelectedPengaduanId] = useState<number | null>(
    null
  );
  const [selectedPengaduan, setSelectedPengaduan] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleCardPress = (pengaduan: any) => {
    setSelectedPengaduanId(pengaduan.id_pengaduan);
    setSelectedPengaduan(pengaduan);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPengaduanId(null);
    setSelectedPengaduan(null);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text
            className="text-neutral-400 mt-4 text-[14px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const isAuthError = error.includes("login") || error.includes("Sesi");

    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="items-center justify-center flex-1 px-6">
          <Text
            className="text-red-400 text-center mb-6 text-[14px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            {error}
          </Text>

          <TouchableOpacity
            onPress={refresh}
            className="bg-orange-600 px-8 py-4 rounded-xl mb-3 min-w-[140px] items-center"
          >
            <Text
              className="text-white text-[14px]"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Coba Lagi
            </Text>
          </TouchableOpacity>

          {isAuthError && (
            <TouchableOpacity
              onPress={logout}
              className="bg-neutral-800 px-8 py-4 rounded-xl min-w-[140px] items-center"
            >
              <Text
                className="text-neutral-300 text-[14px]"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
          />
        }
      >
        {/* Header with Avatar & Profile Button */}
        <View className="flex-row items-center px-6 pt-5 pb-6 mb-6">
          <View className="items-center justify-center w-16 h-16 mr-4 bg-orange-600 rounded-full">
            <Text
              className="text-white text-[24px]"
              style={{ fontFamily: "Poppins_700Bold" }}
            >
              {user?.nama_pengguna?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-neutral-100 text-[18px]"
              style={{ fontFamily: "Poppins_700Bold" }}
            >
              {user?.nama_pengguna || "Pengguna"}
            </Text>
            <Text
              className="text-neutral-400 text-[14px]"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Halo, selamat datang kembali! 🙌
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/main/profile")}
            className="items-center justify-center border w-11 h-11 rounded-xl bg-neutral-900 border-neutral-800"
          >
            <Ionicons name="person-outline" size={24} color="#d4d4d8" />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <StatCard
                title="Total Pengaduan"
                value={stats.total}
                icon="document-text-outline"
                iconColor="#d4d4d8"
                valueColor="#f5f5f5"
              />
            </View>
            <View className="flex-1">
              <StatCard
                title="Diterima/Selesai"
                value={stats.diterima}
                icon="checkmark-circle-outline"
                iconColor="#6ee7b7"
                valueColor="#6ee7b7"
              />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard
                title="Ditolak"
                value={stats.ditolak}
                icon="close-circle-outline"
                iconColor="#fca5a5"
                valueColor="#fca5a5"
              />
            </View>
            <View className="flex-1">
              <StatCard
                title="Dalam Proses"
                value={stats.proses}
                icon="time-outline"
                iconColor="#d4d4d8"
                valueColor="#f5f5f5"
              />
            </View>
          </View>
        </View>
        <View className="px-6 mb-6">
          <StatusChart stats={stats} />
        </View>
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-5">
            <Text
              className="text-neutral-100 text-[18px]"
              style={{ fontFamily: "Poppins_700Bold" }}
            >
              Pengaduan Terbaru
            </Text>
            <TouchableOpacity onPress={() => router.push("/main/riwayat")}>
              <Text
                className="text-orange-500 text-[14px]"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>
          {recentPengaduan.length === 0 ? (
            <View className="items-center p-10 border bg-neutral-900 border-neutral-800 rounded-xl">
              <Text
                className="text-neutral-400 text-center text-[13px]"
                style={{ fontFamily: "Poppins_400Regular" }}
              >
                Belum ada pengaduan
              </Text>
            </View>
          ) : (
            <View>
              {recentPengaduan.map((pengaduan, index) => (
                <View
                  key={pengaduan.id_pengaduan}
                  className={index > 0 ? "mt-3" : ""}
                >
                  <PengaduanCard
                    pengaduan={pengaduan}
                    onPress={() => handleCardPress(pengaduan)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <DetailPengaduanModal
        visible={showDetailModal}
        pengaduanId={selectedPengaduanId}
        pengaduanData={selectedPengaduan}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}
