import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pengaduan } from "../hooks/usePengaduan";

interface PengaduanCardProps {
  pengaduan: Pengaduan;
  onPress?: () => void;
}

export const PengaduanCard: React.FC<PengaduanCardProps> = ({
  pengaduan,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("diterima") || s.includes("selesai")) return "#34d399"; // emerald
    if (s.includes("ditolak")) return "#f87171"; // red
    if (s.includes("proses")) return "#60a5fa"; // blue
    return "#fbbf24"; // yellow for diajukan
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("diterima") || s.includes("selesai"))
      return "checkmark-circle";
    if (s.includes("ditolak")) return "close-circle";
    if (s.includes("proses")) return "time";
    return "hourglass-outline";
  };

  const statusColor = getStatusColor(pengaduan.status);
  const statusIcon = getStatusIcon(pengaduan.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center p-5 border bg-neutral-900/60 border-neutral-800 rounded-xl"
    >
      {/* Status Indicator */}
      <View
        className="items-center justify-center mr-4 w-14 h-14 rounded-xl"
        style={{ backgroundColor: `${statusColor}15` }}
      >
        <Ionicons name={statusIcon as any} size={28} color={statusColor} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-neutral-100 mb-1.5 text-[16px]"
          numberOfLines={1}
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          {pengaduan.nama_pengaduan}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={14} color="#737373" />
          <Text
            className="text-neutral-500 ml-1.5 text-[13px]"
            numberOfLines={1}
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            {pengaduan.nama_lokasi}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={24} color="#525252" />
    </TouchableOpacity>
  );
};
