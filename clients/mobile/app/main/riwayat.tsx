import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePengaduan } from "../../src/hooks/usePengaduan";
import { PengaduanCard } from "../../src/components/PengaduanCard";
import { DetailPengaduanModal } from "../../src/components/DetailPengaduanModal";

type StatusFilter = "all" | "Diajukan" | "Proses" | "Diterima" | "Ditolak";

export default function RiwayatScreen() {
  const { pengaduanList, loading, error, refreshing, refresh } = usePengaduan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedPengaduanId, setSelectedPengaduanId] = useState<number | null>(
    null
  );
  const [selectedPengaduan, setSelectedPengaduan] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter data
  const filteredData = useMemo(() => {
    let result = pengaduanList;

    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter((item) => {
        const status = item.status.toLowerCase();
        const filter = selectedStatus.toLowerCase();

        if (filter === "diterima") {
          return status.includes("diterima") || status.includes("selesai");
        }
        return status.includes(filter);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const namaItem = (item.nama_item || "").toLowerCase();
        const namaLokasi = (item.nama_lokasi || "").toLowerCase();
        const deskripsi = (item.deskripsi || "").toLowerCase();
        return (
          namaItem.includes(query) ||
          namaLokasi.includes(query) ||
          deskripsi.includes(query)
        );
      });
    }

    return result;
  }, [pengaduanList, selectedStatus, searchQuery]);

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: pengaduanList.length },
    {
      key: "Diajukan",
      label: "Diajukan",
      count: pengaduanList.filter((item) => {
        const s = item.status.toLowerCase();
        return (
          !s.includes("proses") &&
          !s.includes("diterima") &&
          !s.includes("selesai") &&
          !s.includes("tolak")
        );
      }).length,
    },
    {
      key: "Proses",
      label: "Diproses",
      count: pengaduanList.filter((item) =>
        item.status.toLowerCase().includes("proses")
      ).length,
    },
    {
      key: "Diterima",
      label: "Diterima",
      count: pengaduanList.filter((item) => {
        const s = item.status.toLowerCase();
        return s.includes("diterima") || s.includes("selesai");
      }).length,
    },
    {
      key: "Ditolak",
      label: "Ditolak",
      count: pengaduanList.filter((item) =>
        item.status.toLowerCase().includes("tolak")
      ).length,
    },
  ];

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

  const renderHeader = () => (
    <View className="px-6 pt-6 pb-4 space-y-5">
      {/* Page Title */}
      <View className="flex-row items-center gap-4 mb-2">
        <View className="items-center justify-center border w-11 h-11 rounded-xl border-neutral-700 bg-neutral-800/80">
          <Ionicons name="time-outline" size={22} color="#d4d4d4" />
        </View>
        <View className="flex-1">
          <Text
            className="text-neutral-100 text-[22px]"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            Riwayat Pengaduan
          </Text>
          <Text
            className="text-neutral-400 text-[13px] mt-0.5"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Lihat semua pengaduan Anda
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center gap-3">
        <View className="relative flex-1">
          <View className="absolute z-10 left-4 top-1/2 -translate-y-2.5">
            <Ionicons name="search-outline" size={22} color="#737373" />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari pengaduan..."
            placeholderTextColor="#737373"
            style={{ fontFamily: "Poppins_400Regular" }}
            className="flex-1 pl-12 pr-4 border rounded-xl h-14 border-neutral-800 bg-neutral-900/60 text-neutral-200 text-[14px]"
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilterMenu(!showFilterMenu)}
          className="flex-row items-center gap-2 px-4 border rounded-xl h-14 border-neutral-800 bg-neutral-900/60"
        >
          <Ionicons name="filter-outline" size={22} color="#d4d4d4" />
          {selectedStatus !== "all" && (
            <View className="items-center justify-center w-6 h-6 bg-orange-600 rounded-full">
              <Text
                className="text-xs text-white"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                1
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View className="p-4 space-y-3 border rounded-xl border-neutral-800 bg-neutral-900/95">
          <Text
            className="mb-1 text-neutral-400 text-[12px]"
            style={{ fontFamily: "Poppins_500Medium" }}
          >
            Status
          </Text>
          {statusOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => {
                setSelectedStatus(option.key);
                setShowFilterMenu(false);
              }}
              className={`flex-row items-center justify-between p-3.5 rounded-lg ${
                selectedStatus === option.key
                  ? "bg-orange-600/20 border border-orange-600/40"
                  : "bg-neutral-800/50"
              }`}
            >
              <Text
                style={{
                  fontFamily:
                    selectedStatus === option.key
                      ? "Poppins_600SemiBold"
                      : "Poppins_400Regular",
                }}
                className={`text-[14px] ${
                  selectedStatus === option.key
                    ? "text-orange-500"
                    : "text-neutral-300"
                }`}
              >
                {option.label}
              </Text>
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className={`text-[12px] ${
                  selectedStatus === option.key
                    ? "text-orange-500"
                    : "text-neutral-400"
                }`}
              >
                {option.count}
              </Text>
            </Pressable>
          ))}
          <TouchableOpacity
            onPress={() => setShowFilterMenu(false)}
            className="pt-3 mt-2 border-t border-neutral-800"
          >
            <Text
              className="text-center text-neutral-400 text-[12px]"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Tutup
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count & Reset */}
      <View className="flex-row items-center justify-between pt-1">
        <Text
          className="text-neutral-400 text-[13px]"
          style={{ fontFamily: "Poppins_400Regular" }}
        >
          {filteredData.length > 0
            ? `${filteredData.length} hasil ditemukan`
            : "Tidak ada hasil"}
        </Text>
        {selectedStatus !== "all" && (
          <TouchableOpacity
            onPress={() => setSelectedStatus("all")}
            className="flex-row items-center gap-1.5"
          >
            <Text
              className="text-orange-500 text-[12px]"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              Reset Filter
            </Text>
            <Ionicons name="close-circle" size={14} color="#f97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View className="items-center justify-center flex-1 px-6 py-24">
        <View className="items-center justify-center mb-5 rounded-full w-28 h-28 bg-neutral-900/60">
          <Ionicons name="folder-open-outline" size={56} color="#737373" />
        </View>
        <Text
          className="mb-2 text-neutral-300 text-[16px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          {pengaduanList.length === 0
            ? "Belum Ada Pengaduan"
            : "Tidak Ada Hasil"}
        </Text>
        <Text
          className="text-center text-neutral-500 text-[13px]"
          style={{ fontFamily: "Poppins_400Regular" }}
        >
          {pengaduanList.length === 0
            ? "Anda belum memiliki riwayat pengaduan."
            : "Tidak ada pengaduan yang cocok dengan pencarian Anda."}
        </Text>
      </View>
    );
  };

  const renderErrorState = () => (
    <View className="items-center justify-center flex-1 px-6">
      <View className="items-center justify-center mb-5 rounded-full w-28 h-28 bg-red-900/20">
        <Ionicons name="alert-circle-outline" size={56} color="#f87171" />
      </View>
      <Text
        className="mb-2 text-neutral-300 text-[16px]"
        style={{ fontFamily: "Poppins_600SemiBold" }}
      >
        Terjadi Kesalahan
      </Text>
      <Text
        className="mb-6 text-center text-neutral-500 text-[13px]"
        style={{ fontFamily: "Poppins_400Regular" }}
      >
        {error}
      </Text>
      <TouchableOpacity
        onPress={refresh}
        className="px-8 py-4 bg-orange-600 rounded-xl active:bg-orange-700"
      >
        <Text
          className="text-white text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Coba Lagi
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (error && pengaduanList.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id_pengaduan.toString()}
        renderItem={({ item }) => (
          <View className="px-6 mb-3">
            <PengaduanCard
              pengaduan={item}
              onPress={() => handleCardPress(item)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#f97316"
            colors={["#f97316"]}
          />
        }
        contentContainerStyle={
          filteredData.length === 0 ? { flexGrow: 1 } : undefined
        }
      />

      {/* Loading Overlay (initial load) */}
      {loading && pengaduanList.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-neutral-950">
          <ActivityIndicator size="large" color="#f97316" />
          <Text
            className="mt-4 text-neutral-400 text-[14px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Memuat pengaduan...
          </Text>
        </View>
      )}

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
