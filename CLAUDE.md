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
- **Faz 9** — Admin panel: API'de `AdminModule` (`ADMIN` rolüyle
  sınırlı — global `RolesGuard`/`@Roles()`), `AuditModule`
  (`AuditLogService.record`/`findAll` — önceden hiç yazılmayan
  `AuditLog` tablosu artık admin eylemlerinde doldurulur). Uçlar:
  `GET/POST /admin/users`, `POST /admin/users/:id/{freeze,unfreeze}`
  (`User.isActive` üzerinden, mevcut JWT stratejisi otomatik reddeder),
  `GET /admin/document-errors`, `GET/POST /admin/rule-sets`,
  `POST /admin/rule-sets/:id/publish`, `GET/POST/DELETE /admin/holidays`,
  `GET /admin/ai-usage` (sağlayıcı/model bazında token/maliyet toplamı),
  `GET /admin/audit-logs`, `GET /admin/dashboard`. `apps/admin`
  (Next.js) dolduruldu: e-posta/parola girişi (rol `ADMIN` değilse
  reddedilir), Panel/Kullanıcılar/Kullanıcı Detayı (dondur/aktifleştir)/
  Belge Hataları/Kural Setleri (taslak oluşturma + yayınlama)/Resmi
  Tatiller (ekle/sil)/AI Maliyeti/Audit Log sayfaları. **Kapsam notu:**
  doküman Bölüm 11'deki shadcn/ui, React Hook Form ve Recharts bu fazda
  entegre edilmedi — sade satır içi stiller ve düz `fetch` ile MVP
  kapsamında tutuldu; TanStack Query de eklenmedi.
- **Faz 10** — Pilot ve mağaza: Güvenlik sertleştirmesi (`helmet`,
  `/docs` Swagger yalnızca `NODE_ENV !== "production"` iken açık,
  `/auth/login` ve `/auth/register` uçlarında global limitten daha sıkı
  `@Throttle` — Bölüm 20 "brute force koruması"). KVKK Aydınlatma Metni
  ve Kullanım Koşulları taslak metinleri (`apps/mobile/src/content/
  legal.ts`) ve bunları gösteren ekranlar (`app/legal/kvkk`,
  `app/legal/terms`); kayıt ekranındaki onay anahtarı artık bu
  metinlere bağlı, tıklanabilir bağlantılarla açılıyor. Hesabımı Sil
  ekranı (`app/account/delete`) — `DELETE /auth/me` ucu zaten Faz 1'de
  vardı, mobil tarafta ilk kez bağlandı. `apps/mobile/app.json`a Play
  Store hazırlığı için `versionCode`/`buildNumber` ve iOS izin metinleri
  (kamera/galeri) eklendi. `docs/store-listing.md` (mağaza metni
  taslağı) ve `docs/kapali-test-plani.md` (Bölüm 24 tabanlı manuel QA
  kontrol listesi) eklendi. Faz 7-10 birleşik değişiklik seti üzerinde
  bir güvenlik incelemesi yapıldı, yüksek güvenilirlikli bulgu
  çıkmadı. **Kapsam notu:** KVKK/Kullanım Koşulları metinleri ve mağaza
  listesi taslaktır — yayına alınmadan önce bir hukuk danışmanı ve
  pazarlama ekibi tarafından incelenmelidir; gerçek kapalı test/cihaz
  denemesi ve ekran görüntüleri bu ortamda üretilemedi.
- **Faz 4 iyileştirmesi (OCR üretim entegrasyonu)** — `MockOcrProvider`
  yerine gerçek çalışan bir `TesseractOcrProvider` eklendi
  (`OCR_PROVIDER=tesseract`, `AIProvider`/`PaymentProvider` deseniyle
  aynı sağlayıcı-agnostik factory `OcrModule` içinde): PDF'lerde önce
  `pdfjs-dist` ile gömülü metin katmanı okunur (çoğu kurumsal belge —
  icra ödeme emri, trafik cezası vb. — dijital üretildiğinden bu
  yeterlidir ve yüksek güvenle sonuç verir); JPEG/PNG görüntülerde
  `tesseract.js` ile gerçek OCR uygulanır. **Kapsam notu:** taranmış
  (görüntü tabanlı) PDF sayfaları, sayfa görüntüye dönüştürülmeden OCR
  edilemez (poppler/ghostscript gibi yerel bağımlılık gerektirir,
  bilinçli olarak bu sürümün dışında bırakıldı) — bu durumda kullanıcıya
  net bir "yeniden fotoğraf olarak yükle" uyarısı döner; HEIC formatı
  da aynı nedenle (tesseract.js'in görüntü çözücüsü desteklemiyor) aynı
  uyarıyı döner. Not: ilk denemede `pdf-parse` paketi denendi, ancak
  bünyesindeki eski/bakımsız `pdf.js` sürümü `pdfkit` çıktısı gibi
  modern PDF'leri ayrıştıramadığı (XRef hatası) için `pdfjs-dist`
  (Mozilla'nın güncel PDF.js'i) ile değiştirildi.
- **Bildirim gönderim worker'ı** — `Notification` kayıtları
  (`DeadlinesService.scheduleReminders`, Faz 5) artık yalnızca
  veritabanında beklemiyor, gerçekten teslim ediliyor. API'de
  `NotificationsModule`: `ExpoPushService` (Expo push API sarmalayıcı),
  `NotificationsService.deliverDueNotifications` (zamanı gelmiş ve
  `sentAt`/`failedAt` boş bildirimleri tarar, `sentAt`/`providerId` veya
  `failedAt` ile işaretler), `NotificationsDeliveryProcessor` (BullMQ
  `WorkerHost`) ve `NotificationsSchedulerService` — uygulama açılışında
  her dakika tekrarlayan bir BullMQ işi kaydeder (bu codebase'deki ilk
  tekrarlayan/zamanlı iş). `POST /notifications/push-token` ucu ile
  kullanıcının Expo push token'ı `User.expoPushToken` alanına kaydedilir.
  Mobilde `usePushNotificationRegistration` hook'u, giriş yapan (misafir
  olmayan) kullanıcı için izin isteyip token'ı backend'e kaydeder; bu
  `app/_layout.tsx`'e bağlandı. **Kapsam notu:** gerçek bir push token
  almak için `app.json`'da bir EAS proje kimliği (`extra.eas.projectId`)
  yapılandırılmalıdır — bu ortamda henüz yok, hook kimlik yoksa sessizce
  hiçbir şey yapmaz; gerçek cihazda/EAS ortamında uçtan uca test
  edilmedi.
- **Sentry entegrasyonu** — hem API'de (`@sentry/node`) hem mobilde
  (`@sentry/react-native`) eklendi. API'de `main.ts` framework
  yüklenmeden önce `Sentry.init` çağırır (açılış hataları da
  yakalansın diye), yeni `SentryExceptionsFilter` (global `APP_FILTER`)
  yalnızca beklenmeyen (5xx) hataları raporlar — 4xx istemci hataları
  (doğrulama, yetkilendirme vb.) uygulama akışının normal parçası
  olduğundan raporlanmaz. Mobilde `src/lib/sentry.ts` başlatmayı yapar,
  kök bileşen `Sentry.wrap` ile sarmalandı, `app.json`'a
  `@sentry/react-native/expo` eklentisi eklendi. **Her iki tarafta da
  DSN ortam değişkeni (`SENTRY_DSN`/`EXPO_PUBLIC_SENTRY_DSN`) boş
  bırakılırsa SDK no-op çalışır** — gerçek bir DSN olmadan bu ortamda
  hiçbir olay gönderilmez/test edilemez; üretime alınmadan önce gerçek
  bir Sentry projesi oluşturulup DSN'ler ayarlanmalıdır.

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

## Sıradaki fazlar

Doküman Bölüm 25'teki tüm numaralı fazlar (Faz 0-10) tamamlandı.
"Sonraki profesyonel ürün fazı" (araç değer kaybı, trafik kazası
tazminatı, eksper raporu analizi, poliçe teminat analizi) kullanıcı
tarafından kapsam dışı bırakıldı — bu yönde bir geliştirme yapılmayacak.

Kalan iş, MVP'yi üretime hazırlayan altyapı/entegrasyon parçalarıdır
(gerçek ödeme sağlayıcısı, Sentry, E2E test altyapısı, Prisma migration
seti vb.) — bkz. bu dosyadaki ilgili "Kapsam notu" uyarıları.

## CI

`.github/workflows/ci.yml` — her push/PR'da `pnpm install --frozen-lockfile`,
Prisma client üretimi, gerçek bir Postgres servis konteynerine
`prisma migrate deploy` (Prisma migration setinin gerçekten uygulandığını
doğrular — bu sandbox ortamında canlı bir Postgres olmadığından yerel
olarak doğrulanamamıştı), `pnpm typecheck && pnpm lint && pnpm test`
çalışır. `format:check` bilinçli olarak dahil edilmedi: mevcut kod
tabanında (bu CI kurulmadan önce yazılmış ~112 dosyada) Prettier'ın hiç
uygulanmamış olduğu formatlama farkları var; bunları toplu olarak
düzeltmek ayrı, ilgisiz bir değişiklik olacağından bu işe dahil
edilmedi.

## Prisma migration seti

`apps/api/prisma/migrations/20260724070730_init/` — şema o zamana kadar
hiç migration dosyası üretmeden yalnızca `schema.prisma` üzerinden
kullanılıyordu (`prisma db push` mantığıyla). İlk migration, canlı bir
veritabanına bağlanmadan `prisma migrate diff --from-empty
--to-schema-datamodel` ile bizzat şemadan üretildi (bu yüzden şemadan
sapma riski yoktur) ve CI'deki `prisma migrate deploy` adımıyla gerçek
bir Postgres'e karşı doğrulanır. Bundan sonraki şema değişiklikleri
`pnpm --filter @hukukai/api prisma:migrate` (yerel `prisma migrate dev`)
ile yeni migration dosyaları üretmelidir — artık asla `db push`
kullanılmamalı, migration geçmişi bozulur.

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
