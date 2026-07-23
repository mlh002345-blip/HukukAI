# AI PROFESYONEL ASİSTAN
## Nihai Ürün Kodlama ve Sistem Tasarım Dokümanı

**Doküman sürümü:** 2.0  
**Ürün çalışma adı:** HukukAI  
**Platform:** Android öncelikli mobil uygulama, iOS uyumlu mimari  
**Ana dil:** Türkçe  
**Hedef pazar:** Türkiye  
**Hedef kullanıcılar:** Avukatlar, mali müşavirler, muhasebeciler ve vatandaşlar  

---

# 1. ÜRÜN TANIMI

HukukAI; kullanıcıların hukuki, mali ve resmi belgelerini yükleyebildiği, belgelerden yapılandırılmış veri çıkaran, ilgili süreleri hesaplayan, gerekli hesaplama araçlarına yönlendiren, sonuçları sade Türkçe ile açıklayan ve rapor üreten yapay zekâ destekli mobil profesyonel asistandır.

Ürün yalnızca hesap makinesi koleksiyonu değildir. Ana ürün akışı şöyledir:

```text
Belge yükleme
    ↓
Dosya güvenlik kontrolü
    ↓
OCR
    ↓
Belge sınıflandırma
    ↓
Yapılandırılmış veri çıkarımı
    ↓
Güven skoru ve kullanıcı doğrulaması
    ↓
Kural motoru
    ↓
Süre ve hesaplama motorları
    ↓
Sade Türkçe açıklama
    ↓
Rapor, dosya kaydı ve hatırlatıcı
```

## Temel ürün ilkeleri

1. Kullanıcı araçların hangi meslek grubunda yer aldığını bilmek zorunda değildir.
2. Meslek seçimi erişim kısıtı değil, kişiselleştirme filtresidir.
3. Tüm kullanıcılar tüm araçları görebilir.
4. Kullanıcı yapmak istediği iş, belge veya günlük dildeki ihtiyacı üzerinden araca ulaşır.
5. Yapay zekâ hukuki veya mali hesabı doğrudan yapmaz.
6. Nihai hesaplamalar sürümlenebilir, test edilmiş ve deterministik kural motorunda yapılır.
7. AI çıktıları şema doğrulamasından ve kritik alan kontrolünden geçmeden kesin sonuç olarak gösterilmez.
8. Belirsizlik kullanıcıdan gizlenmez.
9. Mevzuat, tarife ve oranlar kaynak koda gömülmez.
10. İlk sürümde geniş özellik sayısından çok güvenilir çekirdek akış önceliklidir.

---

# 2. TEMEL KONUMLANDIRMA

Ürünün merkezinde şu değer önerisi bulunur:

> Belgenizi yükleyin; sistem belgeyi açıklasın, önemli tarih ve tutarları çıkarsın, süreleri hesaplasın, ilgili aracı önersin ve rapor oluştursun.

Kullanıcı uygulamanın iç organizasyonunu öğrenmek zorunda kalmaz.

Yanlış yaklaşım:

```text
Avukat
  → İcra
  → Süre
  → İtiraz
```

Doğru yaklaşım:

```text
"İcra tebligatı geldi, kaç günüm var?"
    ↓
İcra İtiraz Süresi
```

veya:

```text
Belgeyi yükle
    ↓
Belge türü tespit edilir
    ↓
İlgili süre ve hesaplamalar otomatik önerilir
```

---

# 3. MVP HEDEFİ

MVP'nin amacı, kullanıcıya baştan sona çalışan şu deneyimi sağlamaktır:

1. Kullanıcı kayıt olur veya sınırlı misafir kullanımına başlar.
2. İhtiyacını arama alanına yazar veya ana görevlerden birini seçer.
3. Belge yükler ya da doğrudan hesaplama/süre aracına girer.
4. Sistem belgeyi okur ve türünü belirler.
5. Belgedeki taraf, tarih, tutar, kurum ve dosya numarası gibi alanları çıkarır.
6. Kullanıcı çıkarılan alanları doğrular veya düzeltir.
7. Sistem ilgili süreleri ve hesaplama araçlarını önerir.
8. Kural motoru sonucu üretir.
9. Kullanıcı sonucu kaydeder.
10. PDF raporu ve bildirim oluşturur.

---

# 4. MVP KAPSAMI

## 4.1 Zorunlu modüller

### Kullanıcı ve hesap yönetimi

- E-posta ile kayıt
- E-posta ve parola ile giriş
- Şifre sıfırlama
- Kullanıcı tipi seçimi
- Profil düzenleme
- Bildirim tercihleri
- Hesap silme
- Kullanıcı verilerini dışa aktarma talebi
- Kullanım koşulları ve KVKK onayı
- Misafir kullanım, sınırlı özelliklerle

### Evrensel araç keşfi

- Ana sayfa arama alanı
- Günlük dilde sorgu desteği
- Anahtar kelime araması
- Kategori filtreleri
- Son kullanılan araçlar
- Favoriler
- Mesleğe göre önerilenler
- Tüm araçlar görünümü
- Belgeden otomatik araç önerisi

### Dosya kasası

- Klasör oluşturma
- Klasörü düzenleme
- Klasör silme
- Belge yükleme
- Belge görüntüleme
- Belgeyi klasöre bağlama
- Belgeyi silme
- Belge analizi geçmişi
- Hesaplama geçmişi
- Süre geçmişi
- PDF raporları
- Not ekleme

### Belge analizi

MVP'de desteklenecek belge türleri:

- İlamsız takip ödeme emri
- İcra tebligatı
- Mahkeme gerekçeli kararı
- Vergi tebligatı
- SGK yazısı veya tebligatı
- Kira sözleşmesi
- Müddetname veya infaz belgesi
- Trafik idari para cezası tutanağı
- Bilinmeyen resmi belge

### Süre motoru

MVP'de desteklenecek ilk süre grupları:

- İcra ödeme ve itiraz süreleri
- Mahkeme istinaf ve temyiz süreleri
- Vergi dava açma, uzlaşma ve ödeme süreleri
- SGK itiraz ve ödeme süreleri
- Kira yenileme ve artış tarihi
- Trafik idari para cezasına itiraz süresi
- Trafik cezasında indirimli ödeme süresi
- Kullanıcı tanımlı özel süre

### Hesaplama araçları

İlk mağaza sürümünde:

- Yasal faiz
- İcra borcu ve faiz
- Kira artışı
- Vekâlet ücreti
- Harç ön hesabı
- Serbest meslek makbuzu
- Basit gelir vergisi
- KDV
- Temel SGK işveren maliyeti
- İnfaz ön hesabı

### Trafik araçları

MVP'de:

- Trafik cezası itiraz süresi
- Trafik cezası indirimli ödeme süresi
- Trafik cezası belgesi açıklama
- Trafik cezası son gün hatırlatıcısı
- Trafik cezası dosya kaydı

MVP'de olmayacak:

- Araç değer kaybı hesabı
- Trafik kazası maddi tazminat hesabı
- Bedensel zarar hesabı
- Sigorta poliçe limiti analizi
- Eksper raporu üzerinden değer kaybı tahmini

Araç değer kaybı modülü, ayrı bir profesyonel ürün fazında; veri modeli, sigorta uygulaması, yargı kararları ve uzman doğrulamasıyla birlikte geliştirilecektir.

### Raporlama

- Belge analiz raporu
- Süre raporu
- Faiz hesaplama raporu
- İcra borç raporu
- Kira artış raporu
- Trafik cezası süre raporu
- Serbest meslek makbuzu PDF
- Rapor paylaşımı

### Bildirim

- 7 gün önce
- 3 gün önce
- 1 gün önce
- Son gün
- Kullanıcı tanımlı zaman

---

## 4.2 MVP dışında bırakılacak modüller

- Araç değer kaybı
- Trafik kazası tazminatı
- Bedensel zarar hesabı
- Miras
- Saklı pay ve tenkis
- Mal rejimi
- Nafaka
- Vasiyet
- Ayrıntılı aile hukuku
- Tam teşekküllü büro yönetimi
- E-fatura/e-SMM entegrasyonu
- UYAP entegrasyonu
- Banka entegrasyonu
- Çoklu şirket muhasebesi
- Canlı mevzuat yorum motoru
- Avukat yönlendirme pazaryeri
- Tam otomatik dava dilekçesi üretimi

---

# 5. KULLANICI ROLLERİ VE ERİŞİM PRENSİBİ

## 5.1 Temel prensip

Kullanıcı rolü bir erişim duvarı değildir.

Bir mali müşavir infaz hesabını, bir avukat KDV hesabını, bir vatandaş serbest meslek makbuzu aracını görebilir.

Rol yalnızca şunları etkiler:

- Ana sayfadaki araç sıralaması
- Önerilen araçlar
- Kullanılan açıklama dili
- Örnek senaryolar
- Varsayılan favoriler
- Paket önerileri

## 5.2 Vatandaş

Öncelikli öneriler:

- Belgeyi açıkla
- Süreleri bul
- İcra borcu
- Kira artışı
- Trafik cezası itiraz süresi
- İnfaz ön hesabı
- Mahkeme kararını sadeleştir

## 5.3 Avukat

Öncelikli öneriler:

- Belge analizi
- İcra faiz ve borç
- Süre hesaplama
- Vekâlet ücreti
- Harç
- Serbest meslek makbuzu
- İnfaz hesabı
- Trafik cezası itiraz süresi

## 5.4 Mali müşavir

Öncelikli öneriler:

- KDV
- Gelir vergisi
- SGK
- Serbest meslek makbuzu
- Vergi tebligatı analizi
- Vergi ve SGK süreleri

Ancak "Tüm Araçlar" alanında diğer tüm araçlar da görünür.

## 5.5 Sistem yöneticisi

Ayrı web panelinden:

- Kullanıcı görüntüleme
- Hesap dondurma
- Belge analiz hatalarını inceleme
- Kural seti yönetimi
- Kural sürümü yayınlama
- Resmi tatil yönetimi
- Paket ve kota yönetimi
- Sistem sağlık göstergeleri
- AI maliyet takibi
- Audit log görüntüleme

---

# 6. ANA NAVİGASYON

Alt menü:

1. Ana Sayfa
2. Araçlar
3. Dosyalarım
4. Takvim
5. Profil

## 6.1 Ana Sayfa

Üstte büyük arama alanı:

> Ne yapmak istiyorsunuz?

Arama örnekleri:

- İcra tebligatı geldi, kaç günüm var?
- Cezaevinden ne zaman çıkar?
- KDV hesapla
- Serbest meslek makbuzu oluştur
- Kira artışı
- İstinaf süresi
- Trafik cezasına ne zaman itiraz etmeliyim?
- Bu mahkeme kararını açıkla

Ana görev kartları:

- Belge Analiz Et
- Hesaplama Yap
- Süre Hesapla
- Belge Oluştur

Ek bölümler:

- Yaklaşan süreler
- Son işlemler
- Favoriler
- Size önerilenler
- Tüm araçları gör
- Kullanım kotası

## 6.2 Araçlar

Bölümler:

- Arama
- Son kullanılanlar
- Favoriler
- Mesleğinize önerilenler
- Tüm araçlar
- Kategoriler

Kategoriler:

- Belge Analizi
- İcra
- Mahkeme Süreleri
- İnfaz
- Vergi
- SGK
- Kira
- Trafik Cezaları
- Vekâlet ve Harç
- Faiz ve Borç
- Belge Oluşturma

---

# 7. EVRENSEL ARAMA VE ARAÇ KEŞFİ

## 7.1 Arama davranışı

Arama üç aşamalı çalışır:

1. Yerel anahtar kelime ve eş anlamlı arama
2. Araç metadata eşleştirme
3. Gerekirse düşük maliyetli niyet sınıflandırma modeli

AI her aramada zorunlu değildir.

## 7.2 Günlük dil eşleştirmeleri

Örnek:

```json
{
  "toolId": "execution-preview",
  "name": "İnfaz Ön Hesabı",
  "categories": ["İnfaz", "Ceza", "Süre"],
  "audiences": ["Vatandaş", "Avukat"],
  "keywords": [
    "infaz",
    "cezaevi",
    "kaç yıl yatar",
    "ne zaman çıkar",
    "tahliye",
    "koşullu salıverme",
    "denetimli serbestlik",
    "müddetname"
  ]
}
```

```json
{
  "toolId": "traffic-fine-objection-deadline",
  "name": "Trafik Cezası İtiraz Süresi",
  "categories": ["Trafik Cezaları", "Süre"],
  "audiences": ["Vatandaş", "Avukat", "Mali Müşavir"],
  "keywords": [
    "trafik cezası",
    "radar cezası",
    "cezaya itiraz",
    "sulh ceza",
    "kaç gün içinde",
    "son gün",
    "indirimli ödeme"
  ]
}
```

```json
{
  "toolId": "self-employment-receipt",
  "name": "Serbest Meslek Makbuzu",
  "categories": ["Vergi", "Belge Oluşturma"],
  "audiences": ["Avukat", "Mali Müşavir", "Vatandaş"],
  "keywords": [
    "makbuz",
    "smm",
    "stopaj",
    "kdv",
    "netten brüte",
    "brütten nete"
  ]
}
```

## 7.3 Araç metadata modeli

```ts
type ToolDefinition = {
  id: string
  slug: string
  name: string
  shortDescription: string
  categories: string[]
  audiences: string[]
  keywords: string[]
  synonyms: string[]
  icon: string
  route: string
  isActive: boolean
  isBeta: boolean
  requiresSubscription: boolean
  sortPriorityByRole: {
    citizen?: number
    lawyer?: number
    accountant?: number
  }
}
```

Araçlar tek klasöre bağlı olmayacaktır.

---

# 8. BELGEDEN OTOMATİK YÖNLENDİRME

Belge analizi tamamlandıktan sonra sistem, belge türüne göre işlemler önerir.

Örnek: Müddetname

- Belgeyi sade dille açıkla
- İnfaz ön hesabı yap
- Koşullu salıverme tarihini kontrol et
- Denetimli serbestlik tarihini kontrol et
- Dosyaya kaydet

Örnek: Trafik cezası

- Tebliğ tarihini doğrula
- İtiraz süresini hesapla
- İndirimli ödeme son gününü hesapla
- Hatırlatıcı oluştur
- Rapor oluştur

Örnek: İcra ödeme emri

- İtiraz süresini hesapla
- Ödeme süresini hesapla
- İcra borç hesabı yap
- Dosyaya kaydet

---

# 9. ANA KULLANICI AKIŞLARI

## 9.1 Onboarding

```text
Splash
→ Belgenizi yükleyin
→ Süreleri kaçırmayın
→ Hesaplama ve rapor oluşturun
→ Kullanıcı tipi seçimi
→ Kayıt / giriş / misafir kullanım
→ Kullanım koşulları
→ Ana sayfa
```

## 9.2 Arama ile araç bulma

```text
Ana sayfa
→ "Ne yapmak istiyorsunuz?"
→ Kullanıcı günlük dilde ihtiyacını yazar
→ İlgili araçlar listelenir
→ Kullanıcı aracı açar
```

## 9.3 Belge analizi

```text
Ana sayfa
→ Belge Analiz Et
→ Kamera / Galeri / PDF
→ Dosya yükleme
→ İşleniyor ekranı
→ Belge türü tahmini
→ Çıkarılan verileri kontrol et
→ Analiz sonucu
→ Önerilen süre ve hesaplamalar
→ Rapor / Dosya / Hatırlatıcı
```

Kullanıcı AI tarafından çıkarılan her kritik alanı düzenleyebilmelidir.

## 9.4 Süre hesaplama

```text
Belgeden süre çıkar
veya
Manuel süre seç
→ Başlangıç olayını seç
→ Başlangıç tarihini gir
→ Kuralı seç
→ Süreyi hesapla
→ Son gün, kalan gün, dayanak ve uyarıları göster
→ Hatırlatıcı ekle
```

## 9.5 Trafik cezası akışı

```text
Trafik cezası belgesi yükle
veya
Trafik Cezası İtiraz Süresi aracını aç
→ Cezanın düzenlenme tarihi
→ Tebliğ tarihi
→ Tebliğ yöntemi
→ Ceza türü
→ İtiraz süresi
→ İndirimli ödeme süresi
→ Son günler
→ Hatırlatıcı
→ Rapor
```

## 9.6 Hesaplama

```text
Araç seç
→ Formu doldur
→ Girdileri doğrula
→ Hesapla
→ Sonuç ve hesap adımları
→ Kaydet / PDF / Paylaş
```

## 9.7 Dosya kasası

```text
Dosyalarım
→ Yeni klasör
→ Klasör adı
→ Kategori
→ Müvekkil/müşteri/kişi adı
→ Referans numarası
→ Kaydet
```

Klasör detayında:

- Belgeler
- Hesaplamalar
- Süreler
- Raporlar
- Notlar

---

# 10. EKRAN ENVANTERİ

## Kimlik doğrulama

- SplashScreen
- OnboardingScreen
- RoleSelectionScreen
- LoginScreen
- RegisterScreen
- GuestEntryScreen
- ForgotPasswordScreen
- TermsScreen
- PrivacyConsentScreen

## Ana uygulama

- HomeScreen
- GlobalSearchScreen
- SearchResultsScreen
- ToolsScreen
- ToolCategoryScreen
- FavoritesScreen
- CalculatorFormScreen
- CalculationResultScreen
- DocumentUploadScreen
- DocumentProcessingScreen
- DocumentReviewScreen
- DocumentAnalysisResultScreen
- RecommendedActionsScreen
- DeadlineCalculatorScreen
- DeadlineResultScreen
- TrafficFineDeadlineScreen
- TrafficFineResultScreen
- CreateReminderScreen
- CalendarScreen
- FoldersScreen
- FolderDetailScreen
- CreateFolderScreen
- EditFolderScreen
- DocumentsScreen
- DocumentDetailScreen
- HistoryScreen
- GeneratedDocumentsScreen
- ProfileScreen
- SubscriptionScreen
- NotificationSettingsScreen
- SecuritySettingsScreen
- DeleteAccountScreen

## Yönetim paneli

- AdminLoginPage
- AdminDashboardPage
- UsersPage
- UserDetailPage
- ToolDefinitionsPage
- RuleSetsPage
- RuleEditorPage
- RuleVersionsPage
- DocumentErrorsPage
- AIUsagePage
- AuditLogsPage
- SystemHealthPage

---

# 11. TEKNOLOJİ YIĞINI

## Monorepo

```text
hukukai/
  apps/
    mobile/
    api/
    admin/
  packages/
    ui/
    types/
    validation/
    calculation-engine/
    deadline-engine/
    rule-engine/
    search-engine/
    ai-provider/
    config/
    eslint-config/
    tsconfig/
  infrastructure/
    docker/
    scripts/
  docs/
```

- pnpm
- Turborepo

## Mobil

- React Native
- Expo
- TypeScript strict
- Expo Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- NativeWind
- Expo SecureStore
- Expo Notifications
- Expo Image Picker
- Expo Document Picker
- Expo File System
- Sentry
- PostHog veya Firebase Analytics

## Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- S3 uyumlu obje depolama
- MinIO geliştirme ortamı
- Swagger/OpenAPI
- JWT access ve refresh token
- Pino logger
- Sentry

## Admin

- Next.js
- TypeScript
- App Router
- TanStack Query
- React Hook Form
- Zod
- shadcn/ui
- Recharts

## Test

- Vitest
- React Native Testing Library
- Supertest
- Playwright
- Maestro
- Testcontainers

---

# 12. SİSTEM MİMARİSİ

Başlangıçta modüler monolit kullanılacaktır.

Backend modülleri:

```text
AuthModule
UsersModule
ToolsModule
SearchModule
FoldersModule
DocumentsModule
DocumentAnalysisModule
AIProviderModule
OCRModule
RulesModule
DeadlineModule
CalculationsModule
TrafficFinesModule
ReportsModule
NotificationsModule
SubscriptionsModule
AdminModule
AuditModule
HealthModule
```

Belge işleme asenkron yapılacaktır.

```text
POST /documents
→ dosya storage'a yüklenir
→ Document kaydı UPLOADED olur
→ BullMQ job oluşturulur
→ OCR worker çalışır
→ AI extraction worker çalışır
→ validation çalışır
→ ilgili araçlar ve kurallar önerilir
→ DocumentAnalysis COMPLETED olur
→ mobil uygulamaya sonuç bildirilir
```

---

# 13. VERİTABANI MODELİ

```prisma
enum UserRole {
  CITIZEN
  LAWYER
  ACCOUNTANT
  ADMIN
}

enum SubscriptionPlan {
  FREE
  INDIVIDUAL
  PRO
  OFFICE
  ENTERPRISE
}

enum DocumentStatus {
  UPLOADED
  OCR_PROCESSING
  AI_PROCESSING
  REVIEW_REQUIRED
  COMPLETED
  FAILED
}

enum FolderType {
  LEGAL
  ENFORCEMENT
  TAX
  SGK
  RENT
  EXECUTION
  TRAFFIC_FINE
  OTHER
}

enum DeadlineStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
}

enum CalculationStatus {
  DRAFT
  COMPLETED
  INVALIDATED
}

model User {
  id                   String             @id @default(cuid())
  email                String             @unique
  passwordHash         String
  fullName             String
  phone                String?
  role                 UserRole
  subscriptionPlan     SubscriptionPlan   @default(FREE)
  emailVerifiedAt      DateTime?
  isActive             Boolean            @default(true)
  acceptedTermsVersion String?
  acceptedKvkkVersion  String?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  deletedAt            DateTime?

  refreshTokens        RefreshToken[]
  folders              CaseFolder[]
  documents            Document[]
  calculations         Calculation[]
  deadlines            Deadline[]
  generatedDocuments   GeneratedDocument[]
  notifications        Notification[]
  auditLogs            AuditLog[]
  favorites            UserFavoriteTool[]
}

model ToolDefinition {
  id                   String   @id
  slug                 String   @unique
  name                 String
  shortDescription     String
  categories           Json
  audiences            Json
  keywords             Json
  synonyms             Json
  icon                 String
  route                String
  isActive             Boolean  @default(true)
  isBeta               Boolean  @default(false)
  requiresSubscription Boolean  @default(false)
  rolePriorities       Json
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  favorites UserFavoriteTool[]
}

model UserFavoriteTool {
  userId String
  toolId String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  tool ToolDefinition @relation(fields: [toolId], references: [id], onDelete: Cascade)

  @@id([userId, toolId])
}

model RefreshToken {
  id         String   @id @default(cuid())
  userId     String
  tokenHash  String   @unique
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model CaseFolder {
  id              String     @id @default(cuid())
  userId          String
  title           String
  folderType      FolderType
  clientName      String?
  referenceNumber String?
  notes           String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?

  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents          Document[]
  calculations       Calculation[]
  deadlines          Deadline[]
  generatedDocuments GeneratedDocument[]

  @@index([userId, createdAt])
  @@index([userId, folderType])
}

model Document {
  id               String         @id @default(cuid())
  userId           String
  folderId         String?
  originalName     String
  storageKey       String
  mimeType         String
  sizeBytes        Int
  checksum         String
  pageCount        Int?
  documentType     String?
  status           DocumentStatus @default(UPLOADED)
  ocrTextEncrypted String?
  errorCode        String?
  errorMessage     String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  deletedAt        DateTime?

  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder       CaseFolder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  analyses     DocumentAnalysis[]
  calculations Calculation[]
  deadlines    Deadline[]

  @@index([userId, createdAt])
  @@index([folderId])
  @@index([status])
  @@unique([userId, checksum])
}

model DocumentAnalysis {
  id               String   @id @default(cuid())
  documentId       String
  schemaVersion    String
  provider         String
  model            String
  promptVersion    String
  extractedData    Json
  summary          String?
  warnings         Json
  recommendedTools Json
  confidenceScore  Decimal? @db.Decimal(5, 4)
  requiresReview   Boolean  @default(false)
  inputTokens      Int?
  outputTokens     Int?
  estimatedCostUsd Decimal? @db.Decimal(12, 6)
  createdAt        DateTime @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId, createdAt])
}

model Calculation {
  id              String            @id @default(cuid())
  userId          String
  folderId        String?
  documentId      String?
  calculationType String
  engineVersion   String
  ruleSetVersion  String
  inputData       Json
  outputData      Json
  status          CalculationStatus @default(COMPLETED)
  createdAt       DateTime          @default(now())
  invalidatedAt   DateTime?

  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder   CaseFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)
  document Document?   @relation(fields: [documentId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([folderId])
  @@index([calculationType])
}

model Deadline {
  id                String         @id @default(cuid())
  userId            String
  folderId          String?
  documentId        String?
  title             String
  ruleId            String
  ruleVersion       String
  startEvent        String
  startDate         DateTime
  calculatedEndDate DateTime
  adjustedEndDate   DateTime
  status            DeadlineStatus @default(ACTIVE)
  legalBasis        Json
  warnings          Json
  completedAt       DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder        CaseFolder?    @relation(fields: [folderId], references: [id], onDelete: SetNull)
  document      Document?      @relation(fields: [documentId], references: [id], onDelete: SetNull)
  notifications Notification[]

  @@index([userId, adjustedEndDate])
  @@index([status, adjustedEndDate])
}

model Notification {
  id          String   @id @default(cuid())
  userId      String
  deadlineId  String?
  title       String
  body        String
  scheduledAt DateTime
  sentAt      DateTime?
  failedAt    DateTime?
  providerId  String?
  createdAt   DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deadline Deadline? @relation(fields: [deadlineId], references: [id], onDelete: Cascade)

  @@index([scheduledAt, sentAt])
  @@index([userId, scheduledAt])
}

model GeneratedDocument {
  id              String   @id @default(cuid())
  userId          String
  folderId        String?
  documentType    String
  templateVersion String
  inputData       Json
  storageKey      String?
  createdAt       DateTime @default(now())

  user   User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder CaseFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
}

model RuleSet {
  id          String   @id @default(cuid())
  module      String
  ruleKey     String
  version     String
  validFrom   DateTime
  validTo     DateTime?
  ruleData    Json
  legalBasis  Json
  sourceUrl   String?
  sourceHash  String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  publishedAt DateTime?

  @@unique([ruleKey, version])
  @@index([module, isPublished])
  @@index([validFrom, validTo])
}

model Holiday {
  id        String   @id @default(cuid())
  date      DateTime @unique
  name      String
  isHalfDay Boolean  @default(false)
  source    String?
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  ipHash     String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([entityType, entityId])
}
```

---

# 14. BELGE İŞLEME BORU HATTI

## Yükleme limitleri

- PDF, JPEG, PNG, HEIC
- Dosya başına azami 20 MB
- Belge başına azami 50 sayfa
- Ücretsiz kullanıcı için azami 10 sayfa
- Şifreli PDF reddedilir
- Virüs taramasından geçmeyen dosya reddedilir

## İşlem adımları

1. MIME type doğrula.
2. Uzantı ile MIME uyumunu kontrol et.
3. Boyut kontrolü yap.
4. SHA-256 checksum üret.
5. Mükerrer belgeyi tespit et.
6. Antivirüs taraması yap.
7. Storage'a yükle.
8. OCR kuyruğuna gönder.
9. OCR sonucu normalize edilir.
10. Belge türü sınıflandırılır.
11. Yapılandırılmış JSON çıkarılır.
12. Kritik alanlar doğrulanır.
13. İlgili araç ve süreler önerilir.
14. Kullanıcıya düzenlenebilir sonuç gösterilir.

---

# 15. AI ROUTER

AI görevleri:

```ts
export type AITask =
  | "DOCUMENT_CLASSIFICATION"
  | "STRUCTURED_EXTRACTION"
  | "SUMMARY"
  | "PLAIN_LANGUAGE_EXPLANATION"
  | "INTENT_CLASSIFICATION"
  | "QUALITY_REVIEW"
```

AI şu işleri yapabilir:

- Belge türü sınıflandırma
- Alan çıkarma
- Özet
- Sade dil açıklaması
- Belirsizlik işaretleme
- Araç önerisi
- Günlük dil aramasını araçla eşleştirme

AI şu işleri tek başına yapamaz:

- Nihai süre belirleme
- Nihai faiz hesabı
- Nihai vergi hesabı
- Nihai infaz tarihi
- Kesin hukuki görüş
- Kaynaksız mevzuat iddiası

Router karar kriterleri:

- Sayfa sayısı
- OCR güveni
- Belge türü
- Yapısal karmaşıklık
- Kullanıcı paketi
- İlk modelin güven skoru
- Maliyet limiti
- Sağlayıcı erişilebilirliği

---

# 16. KURAL VE SÜRE MOTORU

Kural motoru JSON tabanlı ve sürümlenebilir olacaktır.

Örnek trafik cezası kuralı:

```json
{
  "ruleId": "TR_TRAFFIC_FINE_OBJECTION",
  "module": "DEADLINE",
  "version": "1.0.0",
  "validFrom": "2026-01-01",
  "jurisdiction": "TR",
  "conditions": [
    {
      "field": "documentType",
      "operator": "EQUALS",
      "value": "TRAFFIC_ADMINISTRATIVE_FINE"
    }
  ],
  "calculation": {
    "duration": 15,
    "durationUnit": "DAY",
    "dayType": "CALENDAR_DAY",
    "includeStartDate": false,
    "extendIfHoliday": true
  },
  "legalBasis": [],
  "warnings": [
    "Tebliğ yöntemi ve güncel mevzuat sonucu değiştirebilir."
  ]
}
```

Not: Gerçek kural değerleri üretime alınmadan önce güncel mevzuattan doğrulanacak ve kaynak bilgileri RuleSet içine kaydedilecektir.

Süre motoru çıktısı:

```ts
type DeadlineOutput = {
  ruleId: string
  ruleVersion: string
  startDate: string
  rawEndDate: string
  adjustedEndDate: string
  remainingCalendarDays: number
  isExpired: boolean
  appliedAdjustments: Array<{
    type: "WEEKEND" | "HOLIDAY" | "HALF_DAY" | "SPECIAL_RULE"
    description: string
  }>
  legalBasis: Array<{
    law: string
    article?: string
  }>
  warnings: string[]
}
```

---

# 17. HESAPLAMA MOTORLARI

`packages/calculation-engine` altında saf fonksiyonlar olarak geliştirilecektir.

## Zorunlu motorlar

- Yasal faiz
- İcra borcu
- Kira artışı
- Vekâlet ücreti
- Harç ön hesabı
- Serbest meslek makbuzu
- KDV
- Gelir vergisi
- SGK işveren maliyeti
- İnfaz ön hesabı

## Para işlemleri

JavaScript `number` kullanılmayacaktır.

```ts
import Decimal from "decimal.js"
```

## İnfaz uyarısı

İnfaz modülü yüksek riskli alan olarak işaretlenecektir.

Sonuç ekranında:

- Ön hesap olduğu
- Suç tarihi ve suç türünün sonucu değiştirebileceği
- Birden fazla ilam, tekerrür, mahsup ve özel infaz rejimlerinin ayrıca incelenmesi gerektiği
- Nihai hesabın yetkili makamlarca yapılacağı

açıkça belirtilmelidir.

---

# 18. API TASARIMI

API prefix:

```text
/api/v1
```

## Auth

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
PATCH  /auth/me
DELETE /auth/me
```

## Tools ve Search

```text
GET  /tools
GET  /tools/:slug
GET  /tools/categories
GET  /tools/recommended
GET  /tools/recent
GET  /tools/favorites
POST /tools/:id/favorite
DELETE /tools/:id/favorite
GET  /search/tools?q=
POST /search/intent
```

## Folders

```text
POST   /folders
GET    /folders
GET    /folders/:id
PATCH  /folders/:id
DELETE /folders/:id
```

## Documents

```text
POST   /documents/upload-url
POST   /documents/complete-upload
GET    /documents
GET    /documents/:id
DELETE /documents/:id
POST   /documents/:id/analyze
GET    /documents/:id/status
GET    /documents/:id/analysis
PATCH  /documents/:id/extracted-data
GET    /documents/:id/recommended-actions
```

## Calculations

```text
POST /calculations/interest
POST /calculations/enforcement-debt
POST /calculations/rent-increase
POST /calculations/attorney-fee
POST /calculations/court-fee
POST /calculations/self-employment-receipt
POST /calculations/income-tax
POST /calculations/vat
POST /calculations/sgk
POST /calculations/execution-preview
GET  /calculations
GET  /calculations/:id
```

Araç değer kaybı endpointi MVP'de oluşturulmayacaktır.

## Deadlines

```text
POST   /deadlines/calculate
POST   /deadlines
GET    /deadlines
GET    /deadlines/upcoming
GET    /deadlines/:id
PATCH  /deadlines/:id
POST   /deadlines/:id/complete
DELETE /deadlines/:id
```

## Traffic Fines

```text
POST /traffic-fines/analyze
POST /traffic-fines/objection-deadline
POST /traffic-fines/discount-deadline
GET  /traffic-fines/:id
```

## Reports

```text
POST /reports/document-analysis
POST /reports/calculation
POST /reports/deadline
POST /reports/traffic-fine
POST /reports/self-employment-receipt
GET  /reports
GET  /reports/:id/download-url
```

---

# 19. TASARIM SİSTEMİ

Stil:

- Güven veren
- Resmi ama erişilebilir
- Minimal
- Yoğun metni parçalayan
- Kritik tarih ve tutarı öne çıkaran
- Meslek jargonunu gerektiğinde açıklayan

Temel componentler:

- GlobalSearchBar
- SearchSuggestion
- ToolCard
- CategoryChip
- FavoriteButton
- RecommendedToolCard
- DeadlineCard
- DocumentCard
- FolderCard
- ResultSummary
- LegalBasisAccordion
- WarningBanner
- ConfidenceBadge
- EmptyState
- SkeletonLoader
- ErrorState
- UsageMeter
- FileUploader
- PDFPreview

---

# 20. GÜVENLİK VE KVKK

- Argon2id parola hash
- Kısa ömürlü access token
- Döndürülen refresh token
- Refresh token reuse detection
- Brute force koruması
- Antivirüs taraması
- MIME doğrulama
- Şifreli storage
- İmzalı kısa ömürlü URL
- OCR metninin şifrelenmesi
- Hassas bilgilerin loglanmaması
- Object-level authorization
- Rate limit
- Audit log
- Veri minimizasyonu
- Hesap silme ve kalıcı silme planı
- Kullanıcı belgelerini model eğitimi için kullanmama
- Üçüncü taraf AI sağlayıcılarına mümkün olduğunca kimliksizleştirilmiş içerik gönderme
- PII masking

---

# 21. BİLDİRİM ALTYAPISI

Desteklenen hatırlatmalar:

- 7 gün önce
- 3 gün önce
- 1 gün önce
- Son gün
- Kullanıcı tanımlı

Örnek bildirimler:

> İcra itiraz süreniz 3 gün sonra sona eriyor.

> Trafik cezasına itiraz için son gün yarın.

> Trafik cezasında indirimli ödeme süresi bugün sona eriyor.

---

# 22. RAPOR ÜRETİMİ

Her raporda:

- Rapor başlığı
- Oluşturma tarihi
- Kullanıcı girdileri
- Belgeden çıkarılan alanlar
- Hesaplama veya süre sonucu
- Hesap adımları
- Kural sürümü
- Mevzuat dayanağı
- Uyarılar
- Sorumluluk açıklaması
- Benzersiz rapor numarası

MVP raporları:

- Belge Analiz Raporu
- İcra Süre Raporu
- Trafik Cezası Süre Raporu
- Faiz Hesaplama Raporu
- İcra Borç Raporu
- Kira Artış Raporu
- İnfaz Ön Hesap Raporu
- Serbest Meslek Makbuzu

---

# 23. GELİR VE KOTA SİSTEMİ

## Ücretsiz

- Ayda 2 belge analizi
- 10 sayfa sınırı
- Kira artışı
- Basit faiz
- Trafik cezası itiraz süresi
- 3 aktif süre
- Sınırlı geçmiş
- Filigranlı rapor

## Bireysel

- Ayda 20 belge analizi
- 25 sayfa sınırı
- Tüm temel hesaplamalar
- 25 aktif süre
- Filigransız rapor

## Pro

- Ayda 100 belge analizi
- 50 sayfa sınırı
- Tüm profesyonel araçlar
- Sınırsız aktif süre
- Gelişmiş rapor
- Öncelikli analiz kuyruğu

## Tek seferlik

- 5 analiz kredisi
- İnfaz raporu
- Ayrıntılı icra raporu

Araç değer kaybı raporu MVP gelir modelinde yer almayacaktır.

---

# 24. TEST STRATEJİSİ

## Unit test

- Arama eşleştirme
- Araç metadata filtreleme
- Rol bazlı sıralama
- Kural motoru
- Süre motoru
- Trafik cezası süreleri
- Faiz
- İcra borcu
- Kira
- Vekâlet
- Harç
- SMM
- Vergi
- SGK
- İnfaz
- AI Router
- Şema doğrulama

## E2E

- Kayıt ve giriş
- Ana sayfada arama
- "Cezaevinden ne zaman çıkar?" ile infaz aracını bulma
- "Trafik cezasına itiraz" ile ilgili süre aracını bulma
- Mali müşavir rolüyle infaz aracına erişme
- Vatandaş rolüyle SMM aracını görme
- Belge yükleme
- Belge analizini tamamlama
- Önerilen işlemi açma
- Süre hesaplama
- Hatırlatıcı ekleme
- PDF oluşturma
- Hesap silme

---

# 25. GELİŞTİRME FAZLARI

## Faz 0 — Repository ve altyapı

- Monorepo
- pnpm
- Turborepo
- TypeScript config
- ESLint
- Prettier
- Docker Compose
- PostgreSQL
- Redis
- MinIO
- CI
- README
- .env.example

## Faz 1 — Auth ve mobil iskelet

- Splash
- Onboarding
- Rol seçimi
- Kayıt
- Giriş
- Misafir kullanım
- Ana navigasyon
- Profil

## Faz 2 — Araç kataloğu ve evrensel arama

- ToolDefinition modeli
- Araç seed verileri
- GlobalSearchBar
- Anahtar kelime eşleştirme
- Günlük dil eş anlamlıları
- Rol bazlı sıralama
- Favoriler
- Son kullanılanlar
- Tüm araçlar görünümü

Kabul kriterleri:

- Bir araç birden fazla kategori ve kullanıcı grubunda görünebilir.
- Rol seçimi hiçbir aracı gizlemez.
- "Kaç yıl yatar?" araması infaz aracını getirir.
- "Radar cezasına itiraz" araması trafik cezası süre aracını getirir.
- "SMM" araması serbest meslek makbuzunu getirir.

## Faz 3 — Dosya kasası

- Klasör CRUD
- Belge yükleme
- Dosya doğrulama
- Belge listeleme
- Belge silme
- Storage güvenliği

## Faz 4 — OCR ve belge analizi

- OCR provider
- AI provider
- AI router
- Job queue
- Structured extraction
- Review screen
- Confidence score
- Recommended actions

## Faz 5 — Süre motoru

- Holiday tablosu
- RuleSet
- Deadline engine
- İcra süreleri
- Mahkeme süreleri
- Vergi/SGK süreleri
- Trafik cezası itiraz ve ödeme süreleri
- Hatırlatıcı

## Faz 6 — Temel hesaplamalar

Sıra:

1. Yasal faiz
2. Kira artışı
3. İcra borcu
4. Vekâlet ücreti
5. Harç
6. Serbest meslek makbuzu
7. KDV
8. Gelir vergisi
9. SGK
10. İnfaz ön hesabı

Araç değer kaybı geliştirilmez.

## Faz 7 — Raporlama

- PDF altyapısı
- Şablonlar
- Trafik cezası süre raporu
- Rapor listesi
- Paylaşım
- Filigran

## Faz 8 — Paket ve ödeme

- Kota
- Paywall
- Tek seferlik kredi
- Abonelik
- Kullanım ekranı

## Faz 9 — Admin panel

- Araç yönetimi
- Kural yönetimi
- Kullanıcı yönetimi
- AI maliyet
- Hata inceleme
- Audit log

## Faz 10 — Pilot ve mağaza

- Güvenlik testi
- KVKK metinleri
- Kullanıcı sözleşmesi
- Play Store hazırlığı
- Kapalı test
- Crash ve performans düzeltmeleri

## Sonraki profesyonel ürün fazı

Ayrı analiz ve veri çalışmasından sonra:

- Araç değer kaybı
- Trafik kazası maddi tazminat
- Eksper raporu analizi
- Poliçe teminat analizi
- Profesyonel sigorta raporları

---

# 26. MVP DEFINITION OF DONE

- Android cihazda çalışır.
- Kayıt, giriş ve misafir kullanım çalışır.
- Alt menü görev odaklıdır.
- Evrensel arama çalışır.
- Kullanıcı rolü araçları gizlemez.
- Tüm araçlar ekranı vardır.
- Belge yüklenir.
- İcra, trafik cezası ve müddetname gibi belgeler sınıflandırılır.
- Kullanıcı çıkarılan alanları düzeltir.
- Belgeden ilgili araçlar önerilir.
- İcra ve trafik cezası süreleri hesaplanır.
- Bildirim oluşturulur.
- Temel hesaplama araçları çalışır.
- İnfaz ön hesabı uyarılı şekilde çalışır.
- PDF raporu üretilir.
- Kural sürümü gösterilir.
- Kullanıcı yalnızca kendi verisine erişir.
- Hesap silme çalışır.
- AI maliyeti izlenir.
- Araç değer kaybı modülü uygulamada bulunmaz.

---

# 27. KODLAMA STANDARTLARI

- TypeScript strict zorunlu.
- `any` yasak.
- Tüm girdiler doğrulanmalı.
- Domain hesapları controller içinde yapılmamalı.
- Hesaplama motorları saf fonksiyon olmalı.
- Tarih ve para işlemleri merkezi paketlerde yapılmalı.
- Mevzuat oranları koda gömülmemeli.
- Araç görünürlüğü rol ile engellenmemeli.
- Araç sırası rol ile kişiselleştirilmeli.
- Search metadata kod içinde dağınık tutulmamalı.
- ToolDefinition merkezi kaynak olmalı.
- Her yeni araç için anahtar kelime ve günlük dil eş anlamlıları eklenmeli.
- Her kural için unit test yazılmalı.
- Migration dosyaları geriye dönük değiştirilmemeli.
- README ve CHANGELOG her fazda güncellenmeli.

---

# 28. İLK KODLAMA PROMPTU

```text
Bu repository'de "AI Profesyonel Asistan — Nihai Ürün Kodlama ve Sistem Tasarım Dokümanı v2.0" esas alınacaktır.

Görevin:
Faz 0, Faz 1 ve Faz 2'yi production kalitesinde uygula.

Teknoloji:
- pnpm monorepo
- Turborepo
- React Native + Expo + Expo Router
- NestJS
- Next.js admin iskeleti
- TypeScript strict
- PostgreSQL
- Prisma
- Redis
- MinIO
- Docker Compose
- Zod
- TanStack Query
- Zustand
- React Hook Form
- NativeWind

Kritik ürün kuralları:
1. Avukat, mali müşavir ve vatandaş ayrı kapalı araç klasörleri değildir.
2. Kullanıcı rolü hiçbir aracı gizlemez.
3. Rol yalnızca öneri ve sıralamayı değiştirir.
4. Ana sayfada "Ne yapmak istiyorsunuz?" arama alanı bulunur.
5. Araçlar birden fazla kategoriye ve kullanıcı grubuna ait olabilir.
6. Günlük dil sorguları desteklenir.
7. "Kaç yıl yatar?" infaz aracını göstermelidir.
8. "Trafik cezasına itiraz" trafik cezası süre aracını göstermelidir.
9. "SMM" serbest meslek makbuzunu göstermelidir.
10. Araç değer kaybı hiçbir ekranda veya API'de yer almayacaktır.

Uygulama adımları:
1. Önce mevcut repository'yi incele.
2. Var olan kodu gereksiz yere silme.
3. Monorepo yapısını kur.
4. Docker Compose ile PostgreSQL, Redis ve MinIO ekle.
5. API health endpoint oluştur.
6. Auth altyapısını kur.
7. Mobil onboarding, rol seçimi, kayıt, giriş ve ana navigasyonu oluştur.
8. ToolDefinition ve UserFavoriteTool modellerini ekle.
9. Araç seed verilerini oluştur.
10. Evrensel aramayı önce deterministic anahtar kelime eşleştirmeyle geliştir.
11. Rol bazlı öneri ve sıralama yap.
12. Tüm Araçlar, Favoriler ve Son Kullanılanlar ekranlarını oluştur.
13. Unit ve integration test yaz.
14. E2E arama senaryolarını ekle.
15. .env.example, README ve CHANGELOG'u güncelle.
16. Lint, typecheck, test ve build çalıştır.
17. Başarısız test bırakma.
18. Uygulama metinleri Türkçe olsun.
19. Faz 0-2 dışında özellik geliştirme.
```

---

# 29. KRİTİK ÜRÜN KARARLARI

1. Meslekler menü değildir.
2. Meslekler erişim kısıtı değildir.
3. Ana navigasyon görev odaklıdır.
4. Evrensel arama ürünün ana keşif mekanizmasıdır.
5. Belge analizi, araç keşfinin ikinci ana mekanizmasıdır.
6. Bir araç birden fazla kategoriye ait olabilir.
7. Günlük dil hukuki terimlerle eşleştirilir.
8. İnfaz hesabı tüm kullanıcılar tarafından bulunabilir.
9. Mali müşavir diğer hukuki araçları görebilir.
10. Vatandaş profesyonel araçları görebilir.
11. Trafik cezası itiraz ve ödeme süreleri MVP'dedir.
12. Araç değer kaybı MVP'den tamamen çıkarılmıştır.
13. Araç değer kaybı daha sonra ayrı profesyonel modül olarak tasarlanacaktır.
14. Kural motoru ürünün temel fikrî varlığıdır.
15. AI sağlayıcısı değiştirilebilir olmalıdır.
16. AI sonucu her zaman doğrulanmalıdır.

---

# 30. NİHAİ ÜRÜN CÜMLESİ

> HukukAI; kullanıcının mesleği ne olursa olsun ihtiyacını günlük dille arayabildiği, resmi ve hukuki belgeleri yükleyerek önemli verileri çıkardığı, mevzuata dayalı süre ve hesaplamaları deterministik motorlarla yaptığı, sonuçları sade Türkçe ile açıkladığı, rapor ve hatırlatıcı oluşturduğu mobil profesyonel asistandır.
