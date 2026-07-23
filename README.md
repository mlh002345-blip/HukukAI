# HukukAI

AI destekli hukuki/mali profesyonel asistan — belge yükleme, süre hesaplama,
mali/hukuki hesaplama araçları ve rapor üretimi sunan Türkiye pazarına özel
mobil uygulama.

Bu doküman, `HukukAI_Nihai_Urun_Kodlama_Dokumani_v2.md` esas alınarak
oluşturulan monorepo'nun kurulum ve geliştirme rehberidir.

## Temel ürün ilkesi

> Kullanıcı rolü (Vatandaş / Avukat / Mali Müşavir) bir erişim duvarı
> değildir. Tüm kullanıcılar tüm araçları görebilir; rol yalnızca sıralama
> ve önerileri kişiselleştirir.

## Monorepo yapısı

```text
hukukai/
  apps/
    mobile/   — React Native + Expo Router (Android öncelikli)
    api/      — NestJS + Prisma + PostgreSQL
    admin/    — Next.js yönetim paneli (Faz 9'da genişletilecek)
  packages/
    types/               — Paylaşılan domain tipleri
    validation/           — Zod şemaları (auth, arama)
    config/                — Ortam değişkeni şeması ve sabitler
    search-engine/         — Deterministik anahtar kelime arama motoru + araç kataloğu
    ui/                    — Paylaşılan React Native bileşenleri
    calculation-engine/    — Hesaplama motorları (Faz 6'da doldurulacak)
    deadline-engine/       — Süre motoru (Faz 5'te doldurulacak)
    rule-engine/           — Kural motoru (Faz 5'te doldurulacak)
    ai-provider/           — AI sağlayıcı soyutlaması (Faz 4'te doldurulacak)
    tsconfig/, eslint-config/ — Ortak geliştirme araçları yapılandırması
  infrastructure/
    docker/   — docker-compose.yml (PostgreSQL, Redis, MinIO)
```

## Ön koşullar

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Docker ve Docker Compose
- Expo Go uygulaması (fiziksel cihazda test için) veya Android Studio emülatörü

## Kurulum

```bash
# 1. Bağımlılıkları kurun
pnpm install

# 2. Ortam değişkenlerini kopyalayın
cp .env.example .env
# apps/api içinde ayrı bir .env gerekebilir; kök .env'i referans alın

# 3. Altyapı servislerini başlatın (PostgreSQL, Redis, MinIO)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Veritabanı migration'larını çalıştırın
pnpm --filter @hukukai/api prisma:generate
pnpm --filter @hukukai/api prisma:migrate

# 5. Araç kataloğunu seed edin
pnpm --filter @hukukai/api prisma:seed
```

## Geliştirme

```bash
# API'yi başlatın (http://localhost:3000/api/v1, Swagger: /docs)
pnpm --filter @hukukai/api dev

# Mobil uygulamayı başlatın (Expo)
pnpm --filter @hukukai/mobile dev

# Admin panelini başlatın
pnpm --filter @hukukai/admin dev

# Tüm workspace için build/lint/typecheck/test
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

## Mevcut durum (Faz 0-2 tamamlandı)

- ✅ **Faz 0** — Monorepo, Docker Compose, TypeScript/ESLint yapılandırması
- ✅ **Faz 1** — Auth (kayıt/giriş/refresh/logout/hesap silme), mobil
  onboarding + rol seçimi + ana navigasyon iskeleti
- ✅ **Faz 2** — Araç kataloğu (`ToolDefinition`), deterministik Türkçe
  anahtar kelime arama motoru, rol bazlı sıralama (erişim kısıtı yok),
  Ana Sayfa ve Araçlar ekranları

## Sıradaki fazlar

Bkz. doküman Bölüm 25 — Geliştirme Fazları (Faz 3: Dosya kasası, Faz 4:
OCR ve belge analizi, Faz 5: Süre motoru, Faz 6: Hesaplama motorları, ...).

## Kritik ürün kararları

Bkz. doküman Bölüm 29. Özellikle:

- Araç değer kaybı modülü MVP'de **yoktur** ve hiçbir ekranda/API'de yer
  almaz; ayrı bir profesyonel ürün fazında geliştirilecektir.
- Mevzuat oran ve tarifeleri koda gömülmez; `RuleSet` tablosundan
  sürümlenerek okunur.
- Nihai hesaplamalar her zaman deterministik kural motorunda yapılır; AI
  yalnızca sınıflandırma, çıkarım ve öneri için kullanılır.
