# Changelog

Bu proje [Keep a Changelog](https://keepachangelog.com/) formatını takip eder.

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
