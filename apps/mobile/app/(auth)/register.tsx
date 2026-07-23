import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { registerSchema, type RegisterInput } from "@hukukai/validation";
import type { UserRole } from "@hukukai/types";
import { useRegister } from "../../src/hooks/useAuth";

const TERMS_VERSION = "1.0.0";
const KVKK_VERSION = "1.0.0";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const registrableRoles: Array<Exclude<UserRole, "ADMIN">> = [
    "CITIZEN",
    "LAWYER",
    "ACCOUNTANT",
  ];
  const initialRole = registrableRoles.includes(
    params.role as Exclude<UserRole, "ADMIN">,
  )
    ? (params.role as Exclude<UserRole, "ADMIN">)
    : "CITIZEN";
  const registerMutation = useRegister();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: initialRole,
      acceptedTermsVersion: "",
      acceptedKvkkVersion: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!termsAccepted) return;
    registerMutation.mutate(
      {
        ...values,
        acceptedTermsVersion: TERMS_VERSION,
        acceptedKvkkVersion: KVKK_VERSION,
      },
      { onSuccess: () => router.replace("/(tabs)") },
    );
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Hesap Oluştur</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Ad Soyad</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              placeholder="Ad Soyad"
            />
          )}
        />
        {errors.fullName ? (
          <Text style={styles.errorText}>{errors.fullName.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-posta</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="ornek@eposta.com"
            />
          )}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Parola</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              secureTextEntry
              placeholder="En az 10 karakter"
            />
          )}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        ) : null}
      </View>

      <View style={styles.termsRow}>
        <Switch value={termsAccepted} onValueChange={setTermsAccepted} />
        <Text style={styles.termsText}>
          Kullanım Koşulları'nı ve KVKK Aydınlatma Metni'ni okudum, kabul
          ediyorum.
        </Text>
      </View>

      {registerMutation.isError ? (
        <Text style={styles.errorText}>
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : "Kayıt başarısız oldu."}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.submitButton,
          !termsAccepted && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!termsAccepted || registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Kayıt Ol</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 64,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#344054",
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
  errorText: {
    color: "#B42318",
    fontSize: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#475467",
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#A6C4F0",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
