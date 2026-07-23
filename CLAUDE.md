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
- **Faz 6** — Hesaplama motorları: `packages/calculation-engine` dolduruldu
  (doküman Bölüm 17'deki 10 motor — yasal faiz, icra borcu, kira artışı,
  vekâlet ücreti, harç ön hesabı, serbest meslek makbuzu, KDV, gelir
  vergisi, SGK işveren maliyeti, infaz ön hesabı — hepsi saf fonksiyon,
  `decimal.js` ile; İnfaz motoru dört zorunlu uyarıyı her çağrıda
  değişmez döner). API'de `CalculationsModule` (10 uç + `GET
  /calculations`, `GET /calculations/:id`, klasör/belge ilişkilendirme).
  **Kapsam notu:** oranlar/dilimler bu fazda istekte doğrudan parametre
  olarak verilir; RuleSet entegrasyonu (Faz 5'teki süre kuralları gibi)
  ayrı bir doğrulama gerektirdiğinden sonraki bir iterasyona bırakıldı.
  Mobilde tüm hesaplama araçları genel, yapılandırma tabanlı bir forma
  bağlandı — 5 tekil-alanlı (kira artışı, harç, SMM, KDV, SGK) ve 4
  dinamik liste/dilim gerektiren araç (yasal faiz — çok dönemli, icra
  borcu — dönem+masraf listesi, vekâlet ücreti/gelir vergisi — kademeli
  dilim editörü, ekle/kaldır satır desteğiyle). İnfaz ön hesabı,
  yüksek riskli alan olduğu için bilinçli olarak ayrı bir onay akışına
  bırakıldı ve henüz UI'a bağlanmadı.

- **Faz 7** — Raporlama: `ReportsModule` (belge analizi, hesaplama ve
  süre sonuçlarından ortak rapor içerik modeliyle — Bölüm 22 — PDF
  üretimi, `pdfkit` ile; `POST /reports/{document-analysis,calculation,
  deadline,traffic-fine,self-employment-receipt}`, `GET /reports`,
  `GET /reports/:id/download-url`). Doküman Bölüm 18'deki tüm MVP rapor
  adları 3 ortak veri şekli üzerinden karşılanır. **FREE plan raporları
  filigranlıdır, Bireysel/Pro filigransızdır** (Bölüm 23).
  `StorageService`e `putObjectBuffer`/`createDownloadUrl` eklendi.
  Mobilde Raporlarım ekranı, `useReports` hook seti ve Belge Detayı/
  Hesaplama/Süre hesaplama ekranlarına "Rapor Oluştur" eylemi eklendi.
- **Faz 8** — Paket ve ödeme: `packages/billing` dolduruldu (Bölüm 23
  paket limitleri/fiyatları — `PLAN_LIMITS`, `ONE_TIME_CREDIT_PACK` —
  saf `evaluateAnalysisQuota`/`evaluatePageLimit`/`evaluateActiveDeadlineLimit`
  fonksiyonları, `AIProvider` deseniyle birebir aynı `PaymentProvider`
  soyutlaması ve deterministik `MockPaymentProvider`). API'de
  `BillingModule` (`GET /billing/usage`, `GET /billing/plans`,
  `POST /billing/subscribe`, `POST /billing/one-time-credits`);
  `DocumentAnalysisService` her analiz başlatmadan önce aylık kotayı/
  tek seferlik krediyi rezerve eder ve OCR sayfa sayısı belirlendiğinde
  paket sayfa sınırını denetler, `DeadlinesService.create` her yeni süre
  öncesi aktif süre sınırını denetler — ikisi de aşım durumunda
  `ForbiddenException` (403) fırlatır. Yeni Prisma modelleri:
  `UsageCounter` (aylık dönem bazlı sayaç), `PaymentTransaction`
  (abonelik/kredi işlem kaydı), `User.oneTimeCreditsRemaining`.
  Mobilde Kullanım ve Paket ekranı (`app/billing`), `useBilling` hook
  seti, Profildeki "Abonelik" menü satırı artık çalışıyor; belge analizi
  ve süre kaydetme akışlarında 403 (paket sınırı) hatası "Paketi
  Yükselt" eylemiyle bu ekrana yönlendirir. **Gerçek bir ödeme
  altyapısı entegre edilmedi — `MockPaymentProvider` her isteği
  başarılı sayar; üretime alınmadan önce gerçek bir sağlayıcıyla
  değiştirilmelidir.**

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
6. Para hesaplamalarında JS `number` değil `decimal.js` kullanılır
   (bkz. `packages/calculation-engine`).
7. Türkçe arayüz metni kullanılır.

## Sıradaki fazlar (öncelik sırasıyla)

Doküman Bölüm 25'e göre: Faz 7 (Raporlama), Faz 8 (Paket ve ödeme),
Faz 9 (Admin panel).

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
