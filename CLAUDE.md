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
- **Faz 3** — Dosya kasası: `FoldersModule` (klasör CRUD, soft delete),
  `DocumentsModule` (presigned upload-url/complete-upload akışı, MIME/
  uzantı/boyut doğrulama, SHA-256 checksum ile mükerrer belge tespiti,
  virüs tarama yer tutucusu), `StorageModule` (S3/MinIO). Mobilde
  Dosyalarım, Yeni/Düzenle Klasör, Klasör Detayı (belge yükleme/listeleme/
  silme) ekranları.
- **Faz 4** — OCR ve belge analizi: `packages/ai-provider` dolduruldu
  (AIProvider arayüzü, deterministik `MockAIProvider`, üretim için
  `AnthropicAIProvider`, sağlayıcı-agnostik factory, AI Router —
  `decideRoute` — ve belge türünden araç önerisi eşlemesi). API'de
  `OcrModule` (yer tutucu `MockOcrProvider`) ve `DocumentAnalysisModule`
  (BullMQ ile asenkron OCR→AI boru hattı, OCR metninin AES-256-GCM ile
  şifrelenmesi). Mobilde Belge Detayı ekranı: analiz başlatma, işleniyor
  durumu, çıkarılan verileri düzenleme, özet ve önerilen araçlar.
- **Faz 5** — Süre motoru: `packages/rule-engine` dolduruldu (RuleSet'i
  tarihe göre yorumlayan `selectRuleVersion`/`evaluateConditions`/
  `findApplicableRule` — kural her zaman OLAY tarihine göre seçilir,
  hesaplama tarihine göre değil). `packages/deadline-engine` dolduruldu
  (`calculateDeadline` — saat dilimi bağımsız takvim/iş günü sayımı,
  ay/yıl birimlerinde HMK m.92/2 uyumlu gün sabitleme, hafta sonu/resmi
  tatil uzatması). API'de `RulesModule` + `DeadlinesModule`
  (`/deadlines/calculate`, CRUD, `/upcoming`, `/:id/complete`), kural
  bazlı veya kullanıcı tanımlı (CUSTOM) süre, kayıt sırasında otomatik
  hatırlatıcı (Notification) planlama. Başlangıç `RuleSet`/`Holiday`
  seed verisi eklendi — **her kural "üretime alınmadan önce
  doğrulanmalı" uyarısıyla işaretli, gerçek/güncel mevzuat kaynağı
  henüz doğrulanmadı.** Mobilde Takvim ekranı (yaklaşan süreler,
  tamamlama/silme), süre hesaplama ekranı (üç süre aracı buraya
  bağlandı) ve Özel Süre ekleme ekranı.

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
