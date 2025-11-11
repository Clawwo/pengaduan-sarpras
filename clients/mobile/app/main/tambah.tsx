import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import {
  useKategoriLokasi,
  useLokasiByKategori,
  useItemsByLokasi,
} from "../../src/hooks/useTambahPengaduan";
import config from "../../src/constants/config";
import { router } from "expo-router";

export default function TambahScreen() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null);
  const [selectedKategoriNama, setSelectedKategoriNama] = useState<string>("");
  const [selectedLokasi, setSelectedLokasi] = useState<number | null>(null);
  const [selectedLokasiNama, setSelectedLokasiNama] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [useTemporaryItem, setUseTemporaryItem] = useState(false);
  const [temporaryItemName, setTemporaryItemName] = useState("");
  const [namaPengaduan, setNamaPengaduan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

  // Loading & error states
  const [submitting, setSubmitting] = useState(false);

  // Hooks
  const { kategoriList, loading: loadingKategori } = useKategoriLokasi();
  const { lokasiList, loading: loadingLokasi } =
    useLokasiByKategori(selectedKategori);
  const { itemList, loading: loadingItems } = useItemsByLokasi(selectedLokasi);

  // Image picker
  const pickImage = async () => {
    const permissionResult = await requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Izinkan akses ke galeri untuk upload foto"
      );
      return;
    }

    const result = await launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!namaPengaduan.trim()) {
      Alert.alert("Error", "Nama pengaduan harus diisi");
      return;
    }

    if (!selectedLokasi) {
      Alert.alert("Error", "Pilih lokasi terlebih dahulu");
      return;
    }

    // Validate item selection
    if (!useTemporaryItem && !selectedItem) {
      Alert.alert(
        "Error",
        "Pilih item terlebih dahulu atau gunakan opsi Item Baru"
      );
      return;
    }

    if (useTemporaryItem && !temporaryItemName.trim()) {
      Alert.alert("Error", "Nama item baru harus diisi");
      return;
    }

    if (!deskripsi.trim()) {
      Alert.alert("Error", "Deskripsi harus diisi");
      return;
    }

    try {
      setSubmitting(true);

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        Alert.alert("Error", "Sesi Anda telah berakhir");
        return;
      }

      const formData = new FormData();
      formData.append("nama_pengaduan", namaPengaduan);
      formData.append("id_lokasi", selectedLokasi.toString());
      formData.append("deskripsi", deskripsi);

      // Handle item selection (regular or temporary)
      if (useTemporaryItem && temporaryItemName.trim()) {
        // Create temporary item first
        const tempItemResponse = await axios.post(
          `${config.apiUrl}/api/temporary-item`,
          {
            nama_barang_baru: temporaryItemName,
            id_lokasi: selectedLokasi,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          }
        );

        if (tempItemResponse.data.id) {
          formData.append("id_temporary", tempItemResponse.data.id.toString());
        }
      } else if (selectedItem) {
        formData.append("id_item", selectedItem.toString());
      }

      if (foto) {
        const filename = foto.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("foto", {
          uri: Platform.OS === "ios" ? foto.replace("file://", "") : foto,
          name: filename,
          type,
        } as any);
      }

      const response = await axios.post(
        `${config.apiUrl}/api/pengaduan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      console.log("Response from server:", response.data);

      // Check if response is successful (status 200-299 or has success field)
      if (response.status >= 200 && response.status < 300) {
        console.log("Pengaduan berhasil, pindah ke step 4");
        // Go to success page
        setSubmitting(false);
        setCurrentStep(4);
      } else {
        throw new Error("Gagal mengajukan pengaduan");
      }
    } catch (error: any) {
      console.error("Error submitting pengaduan:", error);
      setSubmitting(false);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Gagal mengajukan pengaduan"
      );
    }
  };

  // Step 1: Pilih Kategori Lokasi
  const renderStepKategori = () => (
    <View className="flex-1 px-6 py-6">
      <Text
        className="mb-2 text-neutral-100 text-[22px]"
        style={{ fontFamily: "Poppins_700Bold" }}
      >
        Pilih Kategori Lokasi
      </Text>
      <Text
        className="mb-6 text-neutral-400 text-[13px]"
        style={{ fontFamily: "Poppins_400Regular" }}
      >
        Tentukan kategori lokasi untuk melanjutkan pengaduan
      </Text>

      {loadingKategori ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {kategoriList.map((kategori, index) => (
              <TouchableOpacity
                key={kategori.id_kategori}
                onPress={() => {
                  setSelectedKategori(kategori.id_kategori);
                  setSelectedKategoriNama(kategori.nama_kategori);
                  setSelectedLokasi(null);
                  setSelectedItem(null);
                  setCurrentStep(2);
                }}
                className={`p-5 border rounded-xl ${index > 0 ? "mt-3" : ""} ${
                  selectedKategori === kategori.id_kategori
                    ? "bg-orange-600/20 border-orange-600"
                    : "bg-neutral-900/60 border-neutral-800"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-neutral-100 text-[16px] mb-1"
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                    >
                      {kategori.nama_kategori}
                    </Text>
                    {kategori.jumlah_lokasi !== undefined && (
                      <Text
                        className="text-neutral-400 text-[12px]"
                        style={{ fontFamily: "Poppins_400Regular" }}
                      >
                        {kategori.jumlah_lokasi} lokasi tersedia
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#f97316" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  // Step 2: Pilih Lokasi
  const renderStepLokasi = () => (
    <View className="flex-1 px-6 py-6">
      <TouchableOpacity
        onPress={() => setCurrentStep(1)}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="chevron-back" size={22} color="#f97316" />
        <Text
          className="ml-2 text-orange-500 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Ganti Kategori
        </Text>
      </TouchableOpacity>

      <Text
        className="mb-2 text-neutral-100 text-[22px]"
        style={{ fontFamily: "Poppins_700Bold" }}
      >
        Pilih Lokasi
      </Text>
      <Text
        className="mb-6 text-neutral-400 text-[13px]"
        style={{ fontFamily: "Poppins_400Regular" }}
      >
        Pilih lokasi spesifik dari kategori {selectedKategoriNama}
      </Text>

      {loadingLokasi ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : lokasiList.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <Ionicons name="location-outline" size={64} color="#404040" />
          <Text
            className="mt-4 text-neutral-500 text-[13px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Tidak ada lokasi tersedia
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {lokasiList.map((lokasi, index) => (
              <TouchableOpacity
                key={lokasi.id_lokasi}
                onPress={() => {
                  setSelectedLokasi(lokasi.id_lokasi);
                  setSelectedLokasiNama(lokasi.nama_lokasi);
                  setSelectedItem(null);
                  setCurrentStep(3);
                }}
                className={`p-5 border rounded-xl ${index > 0 ? "mt-3" : ""} ${
                  selectedLokasi === lokasi.id_lokasi
                    ? "bg-orange-600/20 border-orange-600"
                    : "bg-neutral-900/60 border-neutral-800"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-neutral-100 text-[16px] mb-1"
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                    >
                      {lokasi.nama_lokasi}
                    </Text>
                    {lokasi.jumlah_item !== undefined && (
                      <Text
                        className="text-neutral-400 text-[12px]"
                        style={{ fontFamily: "Poppins_400Regular" }}
                      >
                        {lokasi.jumlah_item} item tersedia
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#f97316" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  // Step 3: Pilih Item (Optional) & Form
  const renderStepForm = () => (
    <ScrollView className="flex-1 px-6 py-6">
      <TouchableOpacity
        onPress={() => setCurrentStep(2)}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="chevron-back" size={22} color="#f97316" />
        <Text
          className="ml-2 text-orange-500 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Ganti Lokasi
        </Text>
      </TouchableOpacity>

      <Text
        className="mb-2 text-neutral-100 text-[22px]"
        style={{ fontFamily: "Poppins_700Bold" }}
      >
        Detail Pengaduan
      </Text>
      <Text
        className="mb-6 text-neutral-400 text-[13px]"
        style={{ fontFamily: "Poppins_400Regular" }}
      >
        Lengkapi informasi pengaduan untuk {selectedLokasiNama}
      </Text>

      {/* Item Selection (Optional) */}
      <View className="mb-6">
        <Text
          className="mb-3 text-neutral-300 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Pilih Item (Opsional)
        </Text>

        {/* Toggle between existing item and temporary item */}
        <View className="flex-row mb-3 p-1 bg-neutral-900/60 rounded-xl border border-neutral-800">
          <TouchableOpacity
            onPress={() => {
              setUseTemporaryItem(false);
              setTemporaryItemName("");
            }}
            className={`flex-1 py-2.5 rounded-lg ${
              !useTemporaryItem ? "bg-orange-600" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-[12px] ${
                !useTemporaryItem ? "text-white" : "text-neutral-400"
              }`}
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Item Tersedia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setUseTemporaryItem(true);
              setSelectedItem(null);
            }}
            className={`flex-1 py-2.5 rounded-lg ${
              useTemporaryItem ? "bg-orange-600" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-[12px] ${
                useTemporaryItem ? "text-white" : "text-neutral-400"
              }`}
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Item Baru
            </Text>
          </TouchableOpacity>
        </View>

        {useTemporaryItem ? (
          // Temporary Item Input
          <View>
            <View className="flex-row items-center mb-2 px-1">
              <Ionicons name="information-circle" size={16} color="#60a5fa" />
              <Text
                className="ml-2 text-blue-400 text-[12px] flex-1"
                style={{ fontFamily: "Poppins_400Regular" }}
              >
                Item baru akan ditinjau oleh admin sebelum disetujui
              </Text>
            </View>
            <TextInput
              value={temporaryItemName}
              onChangeText={setTemporaryItemName}
              placeholder="Nama item baru (contoh: Kursi Kantor)"
              placeholderTextColor="#737373"
              className="p-4 text-neutral-100 border bg-neutral-900/60 border-neutral-800 rounded-xl text-[14px]"
              style={{ fontFamily: "Poppins_400Regular" }}
            />
          </View>
        ) : loadingItems ? (
          <ActivityIndicator size="small" color="#f97316" />
        ) : itemList.length === 0 ? (
          <View className="p-4 border bg-neutral-900/60 border-neutral-800 rounded-xl">
            <Text
              className="text-center text-neutral-500 text-[12px]"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Tidak ada item tersedia. Gunakan &quot;Item Baru&quot; untuk
              menambahkan.
            </Text>
          </View>
        ) : (
          <View>
            {itemList.map((item, index) => (
              <TouchableOpacity
                key={item.id_item}
                onPress={() =>
                  setSelectedItem(
                    selectedItem === item.id_item ? null : item.id_item
                  )
                }
                className={`p-4 border rounded-xl ${index > 0 ? "mt-2" : ""} ${
                  selectedItem === item.id_item
                    ? "bg-orange-600/20 border-orange-600"
                    : "bg-neutral-900/60 border-neutral-800"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      selectedItem === item.id_item
                        ? "border-orange-600 bg-orange-600"
                        : "border-neutral-700"
                    }`}
                  >
                    {selectedItem === item.id_item && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text
                    className="text-neutral-100 text-[14px]"
                    style={{ fontFamily: "Poppins_500Medium" }}
                  >
                    {item.nama_item}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Nama Pengaduan */}
      <View className="mb-6">
        <Text
          className="mb-3 text-neutral-300 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Nama Pengaduan <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={namaPengaduan}
          onChangeText={setNamaPengaduan}
          placeholder="Contoh: AC Rusak"
          placeholderTextColor="#737373"
          className="p-4 text-neutral-100 border bg-neutral-900/60 border-neutral-800 rounded-xl text-[14px]"
          style={{ fontFamily: "Poppins_400Regular" }}
        />
      </View>

      {/* Deskripsi */}
      <View className="mb-6">
        <Text
          className="mb-3 text-neutral-300 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Deskripsi <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={deskripsi}
          onChangeText={setDeskripsi}
          placeholder="Jelaskan detail kerusakan atau masalah..."
          placeholderTextColor="#737373"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="p-4 text-neutral-100 border bg-neutral-900/60 border-neutral-800 rounded-xl text-[14px]"
          style={{ fontFamily: "Poppins_400Regular", minHeight: 120 }}
        />
      </View>

      {/* Upload Foto */}
      <View className="mb-6">
        <Text
          className="mb-3 text-neutral-300 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Foto (Opsional)
        </Text>

        {foto ? (
          <View className="relative">
            <Image
              source={{ uri: foto }}
              className="w-full border h-52 bg-neutral-900/60 border-neutral-800 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setFoto(null)}
              className="absolute items-center justify-center w-8 h-8 bg-red-600 rounded-full top-3 right-3"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickImage}
            className="items-center justify-center border border-dashed h-52 bg-neutral-900/60 border-neutral-700 rounded-xl"
          >
            <Ionicons name="camera-outline" size={48} color="#737373" />
            <Text
              className="mt-3 text-neutral-500 text-[13px]"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              Tap untuk upload foto
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className={`p-5 rounded-xl mb-6 ${
          submitting ? "bg-orange-600/50" : "bg-orange-600"
        }`}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            className="text-center text-white text-[15px]"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Ajukan Pengaduan
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Step 4: Success Page
  const renderStepSuccess = () => (
    <View className="flex-1 items-center justify-center px-6">
      {/* Success Icon */}
      <View className="items-center justify-center w-24 h-24 mb-6 bg-green-600/20 rounded-full">
        <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
      </View>

      {/* Success Title */}
      <Text
        className="mb-3 text-center text-neutral-100 text-[24px]"
        style={{ fontFamily: "Poppins_700Bold" }}
      >
        Pengaduan Terkirim!
      </Text>

      {/* Success Message */}
      <Text
        className="mb-8 text-center text-neutral-400 text-[13px] px-4"
        style={{ fontFamily: "Poppins_400Regular" }}
      >
        Pengaduan Anda telah berhasil dikirim dan sedang menunggu respon dari
        petugas. Anda akan mendapat notifikasi jika ada update.
      </Text>

      {/* Summary Card */}
      <View className="w-full p-5 mb-6 border bg-neutral-900/60 border-neutral-800 rounded-xl">
        <Text
          className="mb-3 text-neutral-300 text-[14px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Ringkasan Pengaduan
        </Text>

        <View className="space-y-2">
          <View className="flex-row">
            <Text
              className="text-neutral-500 text-[12px] w-24"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Kategori:
            </Text>
            <Text
              className="flex-1 text-neutral-100 text-[12px]"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              {selectedKategoriNama}
            </Text>
          </View>

          <View className="flex-row">
            <Text
              className="text-neutral-500 text-[12px] w-24"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Lokasi:
            </Text>
            <Text
              className="flex-1 text-neutral-100 text-[12px]"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              {selectedLokasiNama}
            </Text>
          </View>

          <View className="flex-row">
            <Text
              className="text-neutral-500 text-[12px] w-24"
              style={{ fontFamily: "Poppins_400Regular" }}
            >
              Judul:
            </Text>
            <Text
              className="flex-1 text-neutral-100 text-[12px]"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              {namaPengaduan}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        onPress={() => {
          router.push("/main/riwayat");
          // Reset form
          setTimeout(() => {
            setCurrentStep(1);
            setSelectedKategori(null);
            setSelectedKategoriNama("");
            setSelectedLokasi(null);
            setSelectedLokasiNama("");
            setSelectedItem(null);
            setUseTemporaryItem(false);
            setTemporaryItemName("");
            setNamaPengaduan("");
            setDeskripsi("");
            setFoto(null);
          }, 500);
        }}
        className="w-full p-5 mb-3 bg-orange-600 rounded-xl"
      >
        <Text
          className="text-center text-white text-[15px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Lihat Riwayat Pengaduan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          // Reset form untuk pengaduan baru
          setCurrentStep(1);
          setSelectedKategori(null);
          setSelectedKategoriNama("");
          setSelectedLokasi(null);
          setSelectedLokasiNama("");
          setSelectedItem(null);
          setUseTemporaryItem(false);
          setTemporaryItemName("");
          setNamaPengaduan("");
          setDeskripsi("");
          setFoto(null);
        }}
        className="w-full p-5 border bg-neutral-900/60 border-neutral-800 rounded-xl"
      >
        <Text
          className="text-center text-neutral-300 text-[15px]"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          Buat Pengaduan Baru
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      {/* Progress Indicator - Show for all steps including success */}
      <View className="px-6 pt-4 pb-3">
        <View className="flex-row items-center mb-2">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= step
                    ? "bg-orange-600"
                    : "bg-neutral-800 border border-neutral-700"
                }`}
              >
                {currentStep >= step && step === 4 ? (
                  <Ionicons name="checkmark" size={18} color="white" />
                ) : (
                  <Text
                    className={`text-[13px] ${
                      currentStep >= step ? "text-white" : "text-neutral-500"
                    }`}
                    style={{ fontFamily: "Poppins_600SemiBold" }}
                  >
                    {step}
                  </Text>
                )}
              </View>
              {index < 3 && (
                <View
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step ? "bg-orange-600" : "bg-neutral-800"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        <View className="flex-row justify-between px-1">
          <Text
            className="text-neutral-400 text-[10px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Kategori
          </Text>
          <Text
            className="text-neutral-400 text-[10px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Lokasi
          </Text>
          <Text
            className="text-neutral-400 text-[10px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Detail
          </Text>
          <Text
            className="text-neutral-400 text-[10px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Selesai
          </Text>
        </View>
      </View>

      {/* Content */}
      {currentStep === 1 && renderStepKategori()}
      {currentStep === 2 && renderStepLokasi()}
      {currentStep === 3 && renderStepForm()}
      {currentStep === 4 && renderStepSuccess()}
    </SafeAreaView>
  );
}
