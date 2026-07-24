# Changelog

Bu proje [Keep a Changelog](https://keepachangelog.com/) formatını takip eder.

## [CI Pipeline]

### Eklendi

- `.github/workflows/ci.yml` — Faz 0'da hedeflenen ama hiç kurulmayan
  CI eklendi. Her push (`claude/**`, `main`) ve pull request'te:
  `pnpm install --frozen-lockfile`, Prisma client üretimi,
  `pnpm typecheck`, `pnpm lint`, `pnpm test` çalışır
- **Kapsam notu:** `format:check` bilinçli olarak dahil edilmedi —
  mevcut kod tabanında (bu CI'den önce yazılmış ~112 dosyada) Prettier
  hiç uygulanmamış; toplu yeniden biçimlendirme bu işten ayrı, ilgisiz
  bir değişiklik olacağından kapsam dışı bırakıldı

## [Bildirim Gönderim Worker'ı]

### Eklendi

- API'de `NotificationsModule`:
  - `ExpoPushService` — Expo push API'sini sarmalar (`isValidToken`,
    `send`)
  - `NotificationsService.deliverDueNotifications` — zamanı gelmiş
    (`scheduledAt <= şimdi`) ve henüz işlenmemiş (`sentAt`/`failedAt`
    boş) bildirimleri tarar, gönderir ve `sentAt`/`providerId` ya da
    `failedAt` ile işaretler; kullanıcının push token'ı yoksa denemeden
    `failedAt` ile işaretlenir
  - `NotificationsDeliveryProcessor` (BullMQ `WorkerHost`) ve
    `NotificationsSchedulerService` — uygulama açılışında her dakika
    tekrarlayan bir iş kaydeder (`repeat: { every: 60000 }`,
    `jobId` ile idempotent); bu codebase'deki ilk tekrarlayan/zamanlı iş
  - `POST /notifications/push-token` — kullanıcının Expo push token'ını
    kaydeder (yeni `User.expoPushToken` alanı)
- Mobilde `usePushNotificationRegistration` hook'u (`app/_layout.tsx`'e
  bağlandı) — giriş yapan (misafir olmayan) kullanıcı için izin isteyip
  push token'ı backend'e kaydeder
- 6 yeni birim testi (`NotificationsService`)
- **Kapsam notu:** gerçek push token için `app.json`'da bir EAS proje
  kimliği yapılandırılmalı (bu ortamda yok); gerçek cihazda/EAS
  ortamında uçtan uca test edilmedi

## [Faz 4 İyileştirmesi] — OCR Üretim Entegrasyonu

### Eklendi

- `TesseractOcrProvider` (`OCR_PROVIDER=tesseract`) eklendi —
  `@hukukai/ai-provider`/`@hukukai/billing`'deki sağlayıcı-agnostik
  factory deseniyle `OcrModule` içinden seçilir:
  - PDF'lerde önce `pdfjs-dist` ile gömülü metin katmanı okunur
    (yüksek güven skoruyla); metin katmanı yoksa (taranmış PDF)
    kullanıcıya yeniden fotoğraf olarak yükleme uyarısı döner
  - JPEG/PNG görüntülerde `tesseract.js` (`tur+eng`) ile gerçek OCR
    uygulanır
  - HEIC formatı (tesseract.js'in görüntü çözücüsü desteklemediği
    için) aynı "yeniden yükle" uyarısını döner
- `pdf-parse` denendi ama bünyesindeki eski `pdf.js` sürümü modern
  PDF'leri (ör. `pdfkit` çıktısı) ayrıştıramadığı için (XRef hatası)
  `pdfjs-dist`e geçildi
- 4 yeni birim testi (`hasSufficientEmbeddedText`)
- **Kapsam notu:** taranmış/görüntü tabanlı PDF sayfalarında gerçek OCR
  için sayfa görüntüye dönüştürme (poppler/ghostscript) gerekir, bu
  sürümde yok

## [Faz 10] — Pilot ve Mağaza

### Eklendi

- Güvenlik sertleştirmesi (Bölüm 20): `helmet` eklendi, `/docs`
  (Swagger) yalnızca `NODE_ENV !== "production"` iken açılır,
  `/auth/login` ve `/auth/register` uçlarında global rate limitten
  daha sıkı `@Throttle` (brute force koruması)
- KVKK Aydınlatma Metni ve Kullanım Koşulları taslak metinleri
  (`apps/mobile/src/content/legal.ts`) ve bunları gösteren ekranlar
  (`app/legal/kvkk`, `app/legal/terms`); kayıt ekranındaki onay
  metni artık bu ekranlara tıklanabilir bağlantılarla bağlı
- Hesabımı Sil ekranı (`app/account/delete`) — mevcut
  `DELETE /auth/me` ucunu ilk kez mobil arayüze bağlar
- `apps/mobile/app.json`: Play Store/App Store hazırlığı —
  `versionCode`/`buildNumber`, iOS kamera/galeri izin açıklamaları
- `docs/store-listing.md` (mağaza listesi taslağı) ve
  `docs/kapali-test-plani.md` (Bölüm 24 tabanlı manuel QA kontrol
  listesi) eklendi
- Faz 7-10 birleşik değişiklik seti üzerinde güvenlik incelemesi
  yapıldı — yüksek güvenilirlikli bulgu çıkmadı
- **Kapsam notu:** KVKK/Kullanım Koşulları metinleri ve mağaza listesi
  taslaktır, yayına alınmadan önce hukuk/pazarlama incelemesi gerekir;
  gerçek kapalı test, cihaz denemesi ve ekran görüntüleri bu ortamda
  üretilemedi

## [Faz 9] — Admin Panel

### Eklendi

- `apps/api`: `AdminModule` — tüm uçlar `RolesGuard`/`@Roles("ADMIN")`
  ile sınırlı (global `APP_GUARD` zincirine eklendi; tüketici
  uygulamasındaki "rol bir erişim duvarı değildir" kuralından ayrıdır,
  o kural yalnızca araç görünürlüğü için geçerlidir):
  - `GET /admin/dashboard` — toplam/aktif kullanıcı, başarısız belge
    analizi, yayınlanmamış kural seti, bu ayki AI maliyeti
  - `GET/POST /admin/users`, `GET /admin/users/:id`,
    `POST /admin/users/:id/{freeze,unfreeze}` — `User.isActive`
    üzerinden; dondurulan kullanıcı mevcut JWT stratejisiyle anında
    reddedilir
  - `GET /admin/document-errors` — `FAILED` durumundaki belgeler
  - `GET/POST /admin/rule-sets`, `POST /admin/rule-sets/:id/publish` —
    yeni sürümler taslak (`isPublished: false`) oluşturulur, ayrı bir
    yayınlama adımı gerektirir
  - `GET/POST/DELETE /admin/holidays`
  - `GET /admin/ai-usage` — sağlayıcı/model bazında analiz sayısı,
    token ve tahmini maliyet toplamı
  - `GET /admin/audit-logs` — `AuditModule`/`AuditLogService` ile
    önceden hiç yazılmayan `AuditLog` tablosu artık her admin eyleminde
    (`USER_FROZEN`, `RULE_SET_PUBLISHED`, `HOLIDAY_CREATED` vb.) doldurulur
- `apps/admin` (Next.js, önceden yalnızca iskelet) dolduruldu:
  - E-posta/parola girişi (`ADMIN` rolü dışındakiler reddedilir),
    `localStorage` tabanlı erişim jetonu, `RequireAdmin` sayfa koruması
  - Panel, Kullanıcılar + Kullanıcı Detayı (dondur/aktifleştir), Belge
    Hataları, Kural Setleri (taslak oluşturma + yayınlama), Resmi
    Tatiller (ekle/sil), AI Maliyeti, Audit Log sayfaları
  - **Kapsam notu:** Bölüm 11'deki shadcn/ui, React Hook Form,
    Recharts ve TanStack Query bu fazda entegre edilmedi; MVP kapsamında
    sade satır içi stiller ve düz `fetch` kullanıldı
- 13 yeni birim testi (`RolesGuard` 3, `AuditLogService` 2,
  `AdminService` 8)

## [Faz 8] — Paket ve Ödeme

### Eklendi

- `packages/billing`: Bölüm 23'teki paket limitleri/fiyatları
  (`PLAN_LIMITS`, `ONE_TIME_CREDIT_PACK` — FREE: ayda 2 analiz/10
  sayfa/3 aktif süre/filigranlı rapor, Bireysel: 20/25/25/filigransız,
  Pro: 100/50/sınırsız/filigransız, Tek seferlik: 5 analiz kredisi),
  saf `evaluateAnalysisQuota`/`evaluatePageLimit`/
  `evaluateActiveDeadlineLimit` fonksiyonları, `@hukukai/ai-provider`
  deseniyle birebir aynı `PaymentProvider` soyutlaması + deterministik
  `MockPaymentProvider` (gerçek bir ödeme altyapısı entegre edilmedi)
- `apps/api`: `BillingModule`
  - `GET /billing/usage` — mevcut plan, aylık analiz kullanımı, sayfa/
    aktif süre sınırı, tek seferlik kredi bakiyesi, filigran durumu
  - `GET /billing/plans`, `POST /billing/subscribe`,
    `POST /billing/one-time-credits`
  - `DocumentAnalysisService.enqueueAnalysis` her analiz öncesi
    kotayı/krediyi rezerve eder; `runPipeline` OCR sayfa sayısı
    belirlenince paket sayfa sınırını denetler
  - `DeadlinesService.create` her yeni süre öncesi aktif süre sınırını
    denetler
  - Sınır aşımlarında `ForbiddenException` (403) fırlatılır
  - Yeni Prisma modelleri: `UsageCounter` (dönem bazlı sayaç),
    `PaymentTransaction` (abonelik/kredi işlem kaydı),
    `User.oneTimeCreditsRemaining`
- `apps/mobile`: Kullanım ve Paket ekranı (`app/billing`), `useBilling`
  hook seti, Profildeki "Abonelik" menü satırı; belge analizi ve süre
  kaydetme akışlarında 403 hatası "Paketi Yükselt" eylemiyle bu ekrana
  yönlendirir
- 26 yeni birim testi (`billing` paketi 13, `BillingService` 12 +
  `DeadlinesService`/`DocumentAnalysisService` kota senaryoları)

## [Faz 7] — Raporlama

### Eklendi

- `apps/api`: `ReportsModule` — belge analizi, hesaplama ve süre
  sonuçlarından tek bir ortak rapor içerik modeliyle (Bölüm 22:
  rapor başlığı, oluşturma tarihi, girdi/çıktı verileri, hesap
  adımları, kural sürümü, mevzuat dayanağı, uyarılar, sorumluluk
  açıklaması, benzersiz rapor numarası `HKA-{yıl}-{kod}`) PDF rapor
  üretir (`pdfkit`, native bağımlılık yok):
  - `POST /reports/document-analysis`, `/calculation`, `/deadline`,
    `/traffic-fine` (süre raporuna yönlenir), `/self-employment-receipt`
    (hesaplama raporuna yönlenir) — doküman Bölüm 18'deki tüm MVP rapor
    adları, 3 ortak veri şekli (Document+DocumentAnalysis, Calculation,
    Deadline) üzerinden karşılanır
  - `GET /reports` (kullanıcının raporları), `GET /reports/:id/download-url`
    (5 dakikalık presigned S3/MinIO indirme URL'si)
  - **FREE plan raporları filigranlıdır** ("HukukAI — Ücretsiz Sürüm"),
    Bireysel/Pro filigransızdır (Bölüm 23)
  - `StorageService`e `putObjectBuffer`/`createDownloadUrl` eklendi
- `packages/types` / `packages/validation`: `ReportType`,
  `GeneratedReportSummary`, `ReportDownloadUrlResponse` ve rapor
  oluşturma istekleri için zod şemaları
- `apps/mobile`: `useReports` hook seti (rapor oluşturma/listeleme/
  indirme), Raporlarım ekranı (`app/reports`, presigned URL'yi
  `Linking.openURL` ile açar), Profil ekranındaki "Raporlarım" menü
  satırı artık çalışıyor; Belge Detayı, Hesaplama sonucu ve Süre
  hesaplama (kaydedilen hatırlatıcı) ekranlarına "Rapor Oluştur"
  eylemi eklendi
- 20 yeni birim testi (`report-content`, 3 şablon oluşturucu, PDF
  render, `ReportsService`)

## [Faz 6] — Hesaplama Motorları

### Eklendi

- `packages/calculation-engine`: Bölüm 17'deki 10 zorunlu motor, hepsi
  saf fonksiyon ve `decimal.js` tabanlı (JS `number` kullanılmaz,
  hiçbir mevzuat oranı koda gömülü değildir):
  - Yasal faiz (çok dönemli, farklı oranlı basit faiz)
  - İcra borcu (anapara + faiz + masraf kalemleri)
  - Kira artışı (TBK m.344)
  - Vekâlet ücreti (kademeli tarife + asgari ücret tavanı)
  - Harç ön hesabı (nispi + maktu)
  - Serbest meslek makbuzu (stopaj + KDV ayrımı)
  - KDV (fiyata ekleme / fiyattan ayrıştırma)
  - Gelir vergisi (kademeli dilim + efektif oran)
  - SGK işveren maliyeti
  - İnfaz ön hesabı — dört zorunlu uyarıyı (ön hesap, suç tarihi/türü,
    tekerrür/mahsup, yetkili makam) her çağrıda değişmez döner
  - Gelir vergisi ve vekâlet ücreti arasında paylaşılan ortak kademeli
    tarife çekirdeği (`calculateTieredAmount`)
- `apps/api`: `CalculationsModule` — 10 hesaplama ucu (`POST
  /calculations/{interest,enforcement-debt,rent-increase,attorney-fee,
  court-fee,self-employment-receipt,income-tax,vat,sgk,
  execution-preview}`), `GET /calculations`, `GET /calculations/:id`,
  klasör/belge ile ilişkilendirme. **Kapsam notu:** oranlar/dilimler bu
  fazda istekte doğrudan parametre olarak verilir; RuleSet
  entegrasyonu (Faz 5'teki süre kuralları gibi) sonraki bir
  iterasyona bırakıldı.
- `apps/mobile`: Genel, yapılandırma tabanlı hesaplayıcı ekranı
  (`app/calculation/[slug]`) tüm 9 hesaplama aracına bağlandı:
  - 5 tekil-alanlı araç (kira artışı, harç ön hesabı, serbest meslek
    makbuzu, KDV, SGK işveren maliyeti)
  - 4 dinamik liste/dilim gerektiren araç (yasal faiz — çok dönemli
    faiz listesi, icra borcu — dönem + masraf kalemi listesi, vekâlet
    ücreti/gelir vergisi — kademeli dilim editörü), ekle/kaldır satır
    desteğiyle
  - İnfaz ön hesabı, yüksek riskli alan olduğu için bilinçli olarak bu
    genel forma dahil edilmedi; ayrı bir onay akışı gerektirir.
- 39 yeni birim testi (`calculation-engine` 33 — yuvarlama/kayan nokta
  doğruluğu, dilim sınırları, infaz oranı/mahsup/artık yıl senaryoları
  dahil — + `CalculationsService` 6).

## [Faz 5] — Süre Motoru

### Eklendi

- `packages/rule-engine`:
  - `selectRuleVersion` — bir kuralın, verilen tarihte (olay tarihi;
    hesaplamanın yapıldığı gün değil) yürürlükte olan sürümünü seçer.
    Aynı olay için 2024'te ve 2026'da farklı mevzuat sürümü uygulanabilir.
  - `evaluateConditions` — EQUALS/NOT_EQUALS/IN/GTE/LTE operatörleriyle
    koşul değerlendirme
  - `findApplicableRule` — belge türü gibi olgulardan (facts) otomatik
    kural eşleştirme (ileride belge analizinden otomatik yönlendirme
    için kullanılabilir)
- `packages/deadline-engine`:
  - Saat dilimi bağımsız (UTC) tarih aritmetiği
  - `calculateDeadline` — takvim günü/iş günü sayımı, ay/yıl birimlerinde
    HMK m.92/2 uyumlu "ayın son günü" sabitlemesi, hafta sonu/resmi tatil
    uzatması (`appliedAdjustments`), kalan gün ve süre durumu
- `apps/api`:
  - `RulesModule` — `RuleSet`/`Holiday` tablolarını okuyup kural
    motorunun beklediği biçime çeviren katman
  - `DeadlinesModule` — `POST /deadlines/calculate` (kalıcı kayıt
    oluşturmadan hesaplama), `POST/GET/GET:id/PATCH/DELETE /deadlines`,
    `GET /deadlines/upcoming`, `POST /deadlines/:id/complete`
  - Kural bazlı (RULE) veya kullanıcı tanımlı (CUSTOM) süre oluşturma
  - Süre kaydedildiğinde otomatik hatırlatıcı (`Notification`) planlama
    (7/3/1/0 gün önce — `NOTIFICATION_OFFSETS_DAYS`)
  - Başlangıç `RuleSet` verisi (icra/trafik cezası itiraz ve indirimli
    ödeme/istinaf/temyiz/vergi dava açma/SGK itiraz süreleri) ve sabit
    tarihli resmi tatiller seed edildi. **Bu değerler geliştirme
    amaçlıdır; her kuralın `warnings` alanında "üretime alınmadan önce
    doğrulanmalı" uyarısı bulunur (Bölüm 16).**
- `apps/mobile`:
  - Takvim ekranı — yaklaşan süreler, kalan gün rozeti, tamamlama/silme
  - Süre hesaplama ekranı — son gün/kalan gün/dayanak/uyarıları gösterir,
    "Hatırlatıcı Ekle" ile kalıcı kayda dönüştürür; Araçlar ekranındaki
    üç süre aracı (icra itiraz, trafik cezası itiraz/indirimli ödeme)
    buraya bağlandı
  - Özel Süre ekleme ekranı (kural motoru olmadan, doğrudan tarih girişi)
- 35 yeni birim testi (`rule-engine` 14, `deadline-engine` 21) +
  `RulesService`/`DeadlinesService` servis testleri

## [Faz 4] — OCR ve Belge Analizi

### Eklendi

- `packages/ai-provider`:
  - `AIProvider` arayüzü (belge sınıflandırma, yapılandırılmış veri
    çıkarma, özetleme)
  - `MockAIProvider` — anahtar kelime eşleştirme + desen tabanlı alan
    çıkarma ile deterministik, test edilebilir varsayılan sağlayıcı
    (`AI_PROVIDER=mock`)
  - `AnthropicAIProvider` — Anthropic Messages API üzerinden üretim
    sağlayıcısı (`AI_PROVIDER=anthropic`)
  - `createAIProvider` factory — sağlayıcı ortam değişkeniyle
    değiştirilebilir (Bölüm 29 madde 15)
  - AI Router (`decideRoute`) — OCR güveni, sayfa sayısı, belge türü ve
    kullanıcı paketine göre FAST/ACCURATE model seviyesi kararı
  - Belge türünden araç önerisine deterministik eşleme
    (`recommendToolSlugsForDocumentType`)
- `apps/api`:
  - `OcrModule` — yer tutucu `MockOcrProvider` (gerçek OCR motoru
    entegrasyonuna kadar sabit düşük güven skoruyla her belgeyi
    kullanıcı incelemesine yönlendirir), PDF sayfa sayısı tahmini
  - `DocumentAnalysisModule` — BullMQ iş kuyruğu ile asenkron OCR→AI
    boru hattı (`POST /documents/:id/analyze`, `GET /documents/:id/status`,
    `GET /documents/:id/analysis`, `PATCH /documents/:id/extracted-data`,
    `GET /documents/:id/recommended-actions`)
  - OCR metninin AES-256-GCM ile şifrelenmesi (Bölüm 20 — Güvenlik ve
    KVKK), `DOCUMENT_TEXT_ENCRYPTION_KEY` ortam değişkeni
  - `StorageService.getObjectBuffer` (analiz için depodan indirme)
- `apps/mobile`: Belge Detayı ekranı — analiz başlatma, işleniyor
  durumu (canlı durum sorgusu), çıkarılan verileri düzenleyip onaylama,
  özet/uyarılar ve önerilen araçlar listesi
- Birim testleri: AI Router, Mock/Anthropic sağlayıcı factory, OCR
  yer tutucusu, PDF sayfa sayısı, OCR metni şifreleme, Redis bağlantı
  ayrıştırma, `DocumentAnalysisService` (uçtan uca pipeline senaryoları)

## [Faz 3] — Dosya Kasası

### Eklendi

- `apps/api`: `FoldersModule` (`POST/GET/GET:id/PATCH/DELETE /folders`,
  kullanıcı bazlı sahiplik kontrolü, soft delete)
- `apps/api`: `DocumentsModule`
  - `POST /documents/upload-url` + `POST /documents/complete-upload`
    (S3/MinIO presigned URL akışı)
  - Dosya doğrulama: izin verilen MIME türleri, uzantı/MIME uyumu, azami
    boyut (`packages/config` → `UPLOAD_LIMITS`)
  - SHA-256 checksum ile mükerrer belge tespiti (`@@unique([userId, checksum])`)
  - Virüs tarama yer tutucusu (EICAR test imzası reddi; gerçek motor
    Faz 4+'ta)
  - `GET /documents`, `GET /documents/:id`, `DELETE /documents/:id`
    (soft delete + depodan silme)
- `apps/api`: `StorageModule` — `@aws-sdk/client-s3` tabanlı presigned
  URL üretimi, `HeadObject`, `DeleteObject`
- `packages/types`, `packages/validation`: Folder/Document şemaları ve
  tipleri (`createFolderSchema`, `requestUploadUrlSchema`, vb.)
- `apps/mobile`: Dosyalarım sekmesi (klasör listesi), Yeni Klasör,
  Klasör Düzenle, Klasör Detayı (belge listeleme/yükleme/silme) ekranları
  — `expo-document-picker` + `expo-crypto` (istemci taraflı SHA-256)
- Birim testleri: dosya doğrulama, checksum/anahtar üretimi, virüs
  tarama yer tutucusu, `FoldersService`/`DocumentsService`

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
