import { z } from "zod";
import { USER_ROLES } from "@hukukai/types";

export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z
    .string()
    .min(10, "Parola en az 10 karakter olmalıdır.")
    .regex(/[A-Z]/, "Parola en az bir büyük harf içermelidir.")
    .regex(/[a-z]/, "Parola en az bir küçük harf içermelidir.")
    .regex(/[0-9]/, "Parola en az bir rakam içermelidir."),
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  role: z.enum(USER_ROLES).exclude(["ADMIN"]),
  acceptedTermsVersion: z.string().min(1, "Kullanım koşulları onayı gerekli."),
  acceptedKvkkVersion: z.string().min(1, "KVKK onayı gerekli."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Parola zorunludur."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(10, "Parola en az 10 karakter olmalıdır.")
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
