# Changelog

Bu proje [Keep a Changelog](https://keepachangelog.com/) formatını takip eder.

## [Faz 0-2] — Monorepo, Auth, Araç Kataloğu ve Evrensel Arama

### Eklendi

**Faz 0 — Repository ve altyapı**
- pnpm + Turborepo monorepo yapısı (`apps/*`, `packages/*`)
- Ortak `tsconfig` (base/nestjs/react-native/nextjs, strict mode)
- Ortak `eslint-config` (`any` yasak, unused vars hata)
- Docker Compose: PostgreSQL 16, Redis 7, MinIO (+ otomatik bucket init)
- `.env.example`, kök `README.md`

**Faz 1 — Auth ve mobil iskelet**
- `apps/api`: NestJS + Prisma + PostgreSQL
  - Prisma şeması (doküman Bölüm 13 ile birebir): User, ToolDefinition,
    UserFavoriteTool, RefreshToken, CaseFolder, Document, DocumentAnalysis,
    Calculation, Deadline, Notification, GeneratedDocument, RuleSet,
    Holiday, AuditLog
  - AuthModule: register, login, refresh (rotation + reuse detection),
    logout, `/auth/me` (get/update/delete)
  - Argon2id parola hash, kısa ömürlü access token + döndürülen refresh
    token
  - Global `JwtAuthGuard` + `@Public()` decorator (misafir erişimi için)
  - Health endpoint (`GET /health`), Swagger dokümantasyonu (`/docs`)
- `apps/mobile`: Expo Router iskeleti
  - Splash → Onboarding → Rol Seçimi → Kayıt/Giriş/Misafir akışı
  - Ana navigasyon: Ana Sayfa, Araçlar, Dosyalarım, Takvim, Profil
  - Zustand + SecureStore ile auth state yönetimi
  - React Hook Form + Zod ile form doğrulama

**Faz 2 — Araç kataloğu ve evrensel arama**
- `packages/search-engine`:
  - Türkçe karakter-duyarsız normalizasyon (`foldForSearch`)
  - Deterministik anahtar kelime/eş anlamlı eşleştirme motoru
    (`searchTools`)
  - Rol bazlı sıralama, **hiçbir aracı gizlemeyen** `sortToolsForRole`
  - 14 araçlık MVP seed kataloğu (`TOOL_CATALOG_SEED`)
  - Faz 2 kabul kriterlerini doğrulayan unit testler
- `apps/api`: ToolsModule (liste/kategori/favori) ve SearchModule
  (`GET /search/tools`, `POST /search/intent`)
- `apps/mobile`: Ana Sayfa arama alanı, Araçlar ekranı (kategori
  filtreleri + arama), `GlobalSearchBar`/`ToolCard`/`CategoryChip`
  bileşenleri (`packages/ui`)
- `apps/admin`: Faz 9'da genişletilecek minimal Next.js iskeleti

### Kabul kriterleri doğrulaması (Bölüm 25)

- ✅ Bir araç birden fazla kategori ve kullanıcı grubunda görünebilir
- ✅ Rol seçimi hiçbir aracı gizlemez (test: `sortToolsForRole` uzunluk kontrolü)
- ✅ "Kaç yıl yatar?" araması infaz aracını getirir
- ✅ "Radar cezasına itiraz" araması trafik cezası süre aracını getirir
- ✅ "SMM" araması serbest meslek makbuzunu getirir

### Sırada

Faz 3 (Dosya kasası), Faz 4 (OCR ve belge analizi), Faz 5 (Süre motoru),
Faz 6 (Hesaplama motorları) — bkz. doküman Bölüm 25.
