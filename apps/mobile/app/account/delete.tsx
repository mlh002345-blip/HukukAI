import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useDeleteAccount } from "../../src/hooks/useAuth";

export default function DeleteAccountScreen() {
  const deleteAccount = useDeleteAccount();
  const [confirmed, setConfirmed] = useState(false);

  const onConfirm = () => {
    Alert.alert(
      "Hesabınızı silmek üzeresiniz",
      "Bu işlem geri alınamaz. Belgeleriniz, hesaplamalarınız ve süreleriniz kalıcı olarak silinecektir.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Kalıcı Olarak Sil",
          style: "destructive",
          onPress: () => {
            deleteAccount.mutate(undefined, {
              onSuccess: () => router.replace("/onboarding"),
              onError: (error) =>
                Alert.alert(
                  "Hata",
                  error instanceof Error ? error.message : "Hesap silinemedi.",
                ),
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesabımı Sil</Text>
      <Text style={styles.body}>
        Hesabınızı sildiğinizde tüm belgeleriniz, hesaplamalarınız, süreleriniz
        ve raporlarınız kalıcı olarak silinir. Bu işlem geri alınamaz.
      </Text>

      <Pressable
        style={styles.confirmRow}
        onPress={() => setConfirmed((prev) => !prev)}
      >
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]} />
        <Text style={styles.confirmText}>
          Hesabımın ve tüm verilerimin kalıcı olarak silineceğini anladım.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.deleteButton, !confirmed && styles.deleteButtonDisabled]}
        disabled={!confirmed || deleteAccount.isPending}
        onPress={onConfirm}
      >
        {deleteAccount.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 24, paddingTop: 64, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  body: { fontSize: 14, color: "#475467", lineHeight: 20 },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  checkboxChecked: { backgroundColor: "#B42318", borderColor: "#B42318" },
  confirmText: { flex: 1, fontSize: 13, color: "#344054" },
  deleteButton: {
    backgroundColor: "#B42318",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonDisabled: { backgroundColor: "#F3A79E" },
  deleteButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
