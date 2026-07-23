import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { forgotPasswordSchema } from "@hukukai/validation";
import { apiRequest } from "../../src/lib/api-client";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  const onSubmit = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: parsed.data,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parolamı Unuttum</Text>
      <Text style={styles.subtitle}>
        Kayıtlı e-posta adresinizi girin, parola sıfırlama bağlantısı
        gönderelim.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="ornek@eposta.com"
      />

      {status === "sent" ? (
        <Text style={styles.successText}>
          E-postanıza bir bağlantı gönderdik. Gelen kutunuzu kontrol edin.
        </Text>
      ) : null}
      {status === "error" ? (
        <Text style={styles.errorText}>
          Geçerli bir e-posta adresi girin veya tekrar deneyin.
        </Text>
      ) : null}

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Bağlantı Gönder</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Girişe dön</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 80,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#101828",
  },
  subtitle: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#101828",
  },
  successText: {
    color: "#067647",
    fontSize: 13,
  },
  errorText: {
    color: "#B42318",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  link: {
    color: "#175CD3",
    fontSize: 13,
    textAlign: "center",
  },
});
