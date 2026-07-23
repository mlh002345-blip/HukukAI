# CLAUDE.md — HukukAI Proje Bağlamı

Bu dosya Claude Code için otomatik olarak okunur. Bu projeye devam ederken
aşağıdaki bağlamı ve kuralları dikkate al.

## Proje nedir

HukukAI: Türkiye pazarına yönelik, hukuki/mali belgeleri analiz eden, süre
hesaplayan ve rapor üreten AI destekli mobil profesyonel asistan.

**Esas doküman:** `docs/HukukAI_Nihai_Urun_Kodlama_Dokumani_v2.md` — bu proje
o dokümana göre kodlanıyor. Yeni bir şey yapmadan önce bu dokümanı oku.
(Eğer bu klasörde yoksa, projeyi teslim eden kişiden isteyin.)

## Şu ana kadar tamamlanan

- **Faz 0** — Monorepo (pnpm + Turborepo), Docker Compose, TS/ESLint config
- **Faz 1** — NestJS API (Auth: kayıt/giriş/refresh-rotation/logout/hesap
  silme), Prisma şeması, Expo mobil auth akışı
- **Faz 2** — `packages/search-engine`: Türkçe-duyarlı deterministik arama
  motoru + 14 araçlık MVP kataloğu, rol bazlı sıralama (hiçbir aracı
  gizlemez), Ana Sayfa + Araçlar ekranları

Tüm bunlar test edildi: `pnpm typecheck`, `pnpm lint`, `pnpm test` — hepsi
yeşil. Devam ederken bu üç komutu bozmadan ilerle.

## Kritik ürün kuralları (asla ihlal etme)

1. **Kullanıcı rolü (Vatandaş/Avukat/Mali Müşavir) bir erişim duvarı
   değildir.** Hiçbir araç role göre gizlenmez; rol yalnızca sıralama ve
   öneri metnini etkiler.
2. **Araç değer kaybı modülü MVP'de YOKTUR** — hiçbir ekranda, API'de veya
   veri modelinde yer almamalı.
3. Nihai hesaplamalar her zaman deterministik kural motorunda yapılır; AI
   yalnızca sınıflandırma/çıkarım/öneri için kullanılır, kesin hesap yapmaz.
4. Mevzuat oran ve tarifeleri koda gömülmez; `RuleSet` tablosundan
   sürümlenerek okunur.
5. `any` tipi yasak (ESLint kuralı zaten bunu zorluyor).
6. Para hesaplamalarında JS `number` değil `decimal.js` kullanılacak
   (Faz 6'da calculation-engine yazılırken).
7. Türkçe arayüz metni kullanılır.

## Sıradaki fazlar (öncelik sırasıyla)

Doküman Bölüm 25'e göre:

- **Faz 3 — Dosya kasası:** Klasör CRUD, belge yükleme (S3/MinIO
  presigned URL), belge listeleme/silme, dosya doğrulama (MIME, boyut,
  virüs taraması placeholder). `packages/config`'teki `UPLOAD_LIMITS`
  sabitlerini kullan. Prisma modelleri (`CaseFolder`, `Document`) zaten
  şemada mevcut, sadece NestJS modülü ve mobil ekranlar eksik.
- **Faz 4 — OCR ve belge analizi:** `packages/ai-provider` paketini
  doldur (şu an placeholder), `AITask` tipini kullan, BullMQ job queue,
  `DocumentAnalysis` modeli zaten şemada var.
- **Faz 5 — Süre motoru:** `packages/rule-engine` ve
  `packages/deadline-engine` paketlerini doldur (şu an placeholder),
  `Holiday` ve `RuleSet` modelleri zaten şemada var.
- **Faz 6 — Hesaplama motorları:** `packages/calculation-engine`'i
  doldur, doküman Bölüm 17'deki 10 motoru saf fonksiyon olarak yaz.

## Geliştirme komutları

```bash
pnpm install
docker compose -f infrastructure/docker/docker-compose.yml up -d
pnpm --filter @hukukai/api prisma:generate
pnpm --filter @hukukai/api prisma:migrate
pnpm --filter @hukukai/api prisma:seed

pnpm --filter @hukukai/api dev       # API — http://localhost:3000/docs
pnpm --filter @hukukai/mobile dev    # Expo mobil

pnpm typecheck && pnpm lint && pnpm test   # her değişiklikten sonra çalıştır
```

## Bilinen ortam kısıtı

Prisma query engine binary'si bazı sandbox ağlarında (`binaries.prisma.sh`)
indirilemeyebilir. Gerçek geliştirme makinenizde bu sorun olmamalı; sorun
yaşarsanız `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` ortam değişkeniyle
deneyin.

## Nasıl devam edilir

Yeni bir faz için: önce ilgili Prisma modelini kontrol et (çoğu zaten
şemada mevcut), NestJS modülünü (controller+service+module) yaz, mobil
tarafta ilgili ekranı/hook'u ekle, unit test yaz, `pnpm typecheck && pnpm
lint && pnpm test` ile doğrula.
