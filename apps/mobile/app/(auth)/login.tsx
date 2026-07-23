import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { loginSchema, type LoginInput } from "@hukukai/validation";
import { useLogin } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const loginMutation = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => router.replace("/(tabs)"),
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

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
              placeholder="••••••••"
            />
          )}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        ) : null}
      </View>

      {loginMutation.isError ? (
        <Text style={styles.errorText}>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "Giriş başarısız oldu."}
        </Text>
      ) : null}

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Giriş Yap</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
        <Text style={styles.link}>Parolamı unuttum</Text>
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
  submitButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
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
    marginTop: 8,
  },
});
