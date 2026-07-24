import { z } from "zod";

/**
 * apps/api için ortam değişkeni şeması.
 * Mevzuat oranları veya gizli anahtarlar asla koda gömülmez; bunlar
 * yalnızca ortam değişkenleri veya veritabanı (RuleSet) üzerinden gelir.
 */
export const apiEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url().or(z.string().min(1)),

  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  AI_PROVIDER: z.enum(["anthropic", "mock"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),

  // OCR sağlayıcısı değiştirilebilir olmalıdır (Faz 4 / OCR üretim entegrasyonu)
  OCR_PROVIDER: z.enum(["tesseract", "mock"]).default("mock"),
  OCR_TESSERACT_LANGUAGES: z.string().default("tur+eng"),
  // Self-hosted traineddata dizini (belirtilmezse tesseract.js varsayılan
  // uzak CDN'den indirir — üretimde self-hosted bir yol önerilir).
  OCR_TESSERACT_LANG_PATH: z.string().optional(),

  // Ödeme sağlayıcısı değiştirilebilir olmalıdır (Faz 8 — Bölüm 23)
  PAYMENT_PROVIDER: z.enum(["mock"]).default("mock"),

  // OCR metninin şifrelenmesi (Bölüm 20 — Güvenlik ve KVKK)
  DOCUMENT_TEXT_ENCRYPTION_KEY: z.string().min(32),

  CORS_ORIGINS: z.string().default("*"),

  // Hata izleme (Sentry) — belirtilmezse Sentry SDK'sı no-op çalışır,
  // hiçbir hata raporlanmaz (geliştirme/test ortamları için güvenlidir).
  SENTRY_DSN: z.string().optional(),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function parseApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = apiEnvSchema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Geçersiz ortam değişkenleri:\n${formatted}`);
  }
  return result.data;
}
