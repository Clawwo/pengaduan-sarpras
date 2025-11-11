import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  colors,
  spacing,
  borderRadius,
  fontWeight,
} from "../../src/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CustomAlert } from "../../src/components/CustomAlert";

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [nama, setNama] = useState(user?.nama_pengguna || "");
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error" | "info" | "warning",
    title: "",
    message: "",
    showCancel: false,
    onConfirm: undefined as (() => void) | undefined,
  });

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    const namaChanged = nama.trim() !== (user?.nama_pengguna || "");
    const usernameChanged = username.trim() !== (user?.username || "");
    return namaChanged || usernameChanged;
  }, [nama, username, user]);

  const showAlert = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string,
    showCancel: boolean = false,
    onConfirm?: () => void
  ) => {
    setAlertConfig({ type, title, message, showCancel, onConfirm });
    setAlertVisible(true);
  };

  const handleLogout = () => {
    showAlert(
      "warning",
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari akun Anda?",
      true,
      async () => {
        await logout();
        router.replace("/auth/login");
      }
    );
  };

  const handleSave = async () => {
    // Check if there are changes
    if (!hasChanges) {
      showAlert("info", "Info", "Tidak ada perubahan untuk disimpan");
      return;
    }

    // Validation
    if (nama.trim().length < 3) {
      showAlert("error", "Validasi Gagal", "Nama minimal 3 karakter");
      return;
    }

    if (username.trim().length < 3) {
      showAlert("error", "Validasi Gagal", "Username minimal 3 karakter");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        nama_pengguna: nama.trim() || undefined,
        username: username.trim() || undefined,
      });

      showAlert(
        "success",
        "Berhasil! 🎉",
        "Profil Anda berhasil diperbarui dengan data terbaru"
      );
    } catch (error: any) {
      showAlert(
        "error",
        "Gagal Menyimpan",
        error.message || "Gagal memperbarui profil. Silakan coba lagi"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { fontFamily: "Poppins_700Bold" }]}>
          Profil
        </Text>

        {/* Avatar Section */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text
              style={[styles.avatarText, { fontFamily: "Poppins_700Bold" }]}
            >
              {user?.nama_pengguna?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text
              style={[styles.badgeText, { fontFamily: "Poppins_600SemiBold" }]}
            >
              Pengguna
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formCard}>
          <Text
            style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}
          >
            Informasi Profil
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: "Poppins_500Medium" }]}>
              Nama Pengguna
            </Text>
            <TextInput
              value={nama}
              onChangeText={setNama}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
            />
            <Text style={[styles.hint, { fontFamily: "Poppins_400Regular" }]}>
              Nama yang ditampilkan di profil Anda
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: "Poppins_500Medium" }]}>
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
            />
            <Text style={[styles.hint, { fontFamily: "Poppins_400Regular" }]}>
              Username untuk login
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !hasChanges}
            style={[
              styles.saveButton,
              (saving || !hasChanges) && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text
                  style={[
                    styles.saveButtonText,
                    { fontFamily: "Poppins_600SemiBold" },
                  ]}
                >
                  Simpan Perubahan
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text
            style={[styles.logoutText, { fontFamily: "Poppins_600SemiBold" }]}
          >
            Keluar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.showCancel ? "Ya, Keluar" : "OK"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.primary + "20",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error + "40",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.error,
  },
});
