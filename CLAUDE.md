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
- **Görsel tasarım — Stitch tasarım paketi entegrasyonu (devam ediyor)**:
  Kullanıcı tarafından sağlanan bir tasarım paketi (Google Stitch
  export, ~40 ekran, açık+koyu tema) uygulanmaya başlandı. İki tema
  sistemi: **Lexi-Trust Framework** (açık — "Institutional Blue"
  `#00236f`, Inter/JetBrains Mono, Material Symbols Outlined ikonları)
  ve **Obsidian** (koyu — `#a78bfa` mor, near-black, aynı ikon seti).
  `packages/ui/src/theme/` — renk/tipografi/spacing tokenleri + saf
  `ThemeProvider`/`useTheme` (hangi şemanın kullanılacağına karar
  vermez, yalnızca verilen `scheme`i uygular). `apps/mobile/src/theme/
  ThemeProvider.tsx` — sistem teması + `expo-secure-store`'da saklanan
  kullanıcı tercihini çözümleyip `@hukukai/ui`'nin sağlayıcısına iletir.
  `packages/ui/src/Icon.tsx` — Material Symbols Outlined'ı ligature
  (harf dizisi → glif) yaklaşımıyla render eder; iki statik TTF
  (FILL 0/1) `apps/mobile/assets/fonts/`e indirildi (Google Fonts'tan,
  eski bir User-Agent ile gerçek `.ttf` — varsayılan `.woff2` RN'de
  çalışmaz). Inter/JetBrains Mono `@expo-google-fonts/*` paketleriyle
  yüklendi. Paylaşılan bileşenler (`GlobalSearchBar`, `ToolCard`,
  `CategoryChip`, `Feedback`) ve Ana Sayfa sekmesi + alt navigasyon
  (Material Symbols ikonlarıyla) bu sisteme taşındı; `app.json`
  `userInterfaceStyle: "automatic"` oldu. Devamında alt navigasyondaki
  kalan 4 sekme de aynı sisteme taşındı: **Araçlar** (`tools.tsx` —
  paylaşılan `GlobalSearchBar`/`CategoryChip`/`ToolCard`/`EmptyState`
  üzerinden tema-duyarlı, mevcut kategori filtreleme/hesap makinesi
  eşleme mantığı değişmedi), **Dosyalarım** (`folders.tsx` —
  `FOLDER_TYPE_ICONS` eşlemesi ile klasör türüne göre ikon+renkli
  daire, sağda tür rozeti), **Takvim** (`calendar.tsx` — 3 gün ve altı
  kalan süreler için amber sol-kenarlıklı acil kart stili,
  `priority_high`/`event`/`warning` ikonları) ve **Profil**
  (`profile.tsx` — `MENU_ITEMS` dizisi ile ikonlu menü satırları,
  avatar dairesi, rol rozeti). Ardından auth/onboarding akışı da
  taşındı: **Onboarding** (`app/onboarding.tsx` — 3 adımlı kaydırmalı
  tanıtım, ikon dairesi + nokta göstergeler), **Rol Seçimi**
  (`role-selection.tsx` — 3 rol kartı, seçili karta `check_circle`
  rozeti), **Giriş Yap** (`login.tsx` — marka başlığı, pill-şekilli
  ikonlu form alanları, göz ikonuyla parola göster/gizle), **Kayıt Ol**
  (`register.tsx` — aynı form deseni + KVKK/Kullanım Koşulları onay
  anahtarı) ve **Parolamı Unuttum** (`forgot-password.tsx`). Tasarım
  paketindeki sosyal giriş (Google/Apple) düğmeleri, uygulamada
  karşılığı olmadığından eklenmedi. Ardından Dosyalarım detay akışı
  taşındı: **Klasör Detayı** (`folder/[id].tsx` — geri/düzenle ikon
  düğmeleri, belge satırlarında MIME türüne göre ikon, "Belge Yükle"
  ve "Klasörü Sil" ikonlu düğmeler), **Yeni/Düzenle Klasör**
  (`folder/new.tsx`, `folder/[id]/edit.tsx` — kategori seçimi artık
  paylaşılan `CategoryChip` bileşeniyle) ve **Belge Detayı**
  (`document/[id].tsx` — durum rozeti, ikonlu analiz/rapor düğmeleri,
  uyarı bannerları `errorContainer` tonuyla, önerilen araç
  satırlarında `chevron_right`). Ardından hesaplama/süre/rapor/paket
  ekranları taşındı: **Hesaplama Aracı** (`calculation/[slug].tsx` —
  genel yapılandırma tabanlı form, ikonlu geri/hesapla/rapor
  düğmeleri, liste alanı editöründe `add`/`remove_circle_outline`),
  **Süre Hesaplama** (`deadline/calculate.tsx`) ve **Özel Süre**
  (`deadline/custom.tsx` — ikonlu tarih alanı), **Raporlarım**
  (`reports/index.tsx` — PDF ikonlu satırlar, `EmptyState`) ve
  **Kullanım ve Paket** (`billing/index.tsx` — `workspace_premium`/
  `verified_user`/`security` ikonları). Son olarak, uygulamada halihazırda
  var olan geri kalan tüm ekranlar da (daha önce hiç `useTheme`
  kullanmayan dört ekran) aynı sisteme taşındı: **Splash** (`index.tsx`
  — marka ikonu + logo, `theme.colors.primary` arka plan), **Hesabımı
  Sil** (`account/delete.tsx` — `errorContainer` tonunda uyarı
  bannerı, ikonlu onay kutusu), **KVKK** ve **Kullanım Koşulları**
  (`legal/kvkk.tsx`, `legal/terms.tsx` — geri düğmesi, `tertiaryFixed`
  tonunda taslak bilgi bannerı). Böylece mobil uygulamadaki *var olan*
  her ekran artık hem açık (Lexi-Trust) hem koyu (Obsidian) temayı
  destekliyor. Ardından Stitch paketindeki **Belge Yükle** ekranı
  (`belge_y_kle_1`/`belge_y_kle_2`) ilk kez uygulamaya eklendi —
  `folder/[id]/upload.tsx`: Kamera/Galeri/PDF Yükle üç seçenekli bento
  kart, güvenlik bannerı, ipuçları bölümü. Kamera ve galeri için daha
  önce yüklü ama kullanılmayan `expo-image-picker` paketi devreye
  alındı (izin akışı: `requestCameraPermissionsAsync`/
  `requestMediaLibraryPermissionsAsync`); PDF seçimi mevcut
  `expo-document-picker` akışını kullanır. `folder/[id].tsx`'teki
  "Belge Yükle" düğmesi artık doğrudan `DocumentPicker` çağırmak
  yerine bu yeni ekrana yönlendiriyor. Ardından **Belge İşleniyor**
  tasarımı (`belge_i_leniyor_1`) belge detayına entegre edildi:
  `document/[id].tsx`teki düz `ActivityIndicator` yerine 4 adımlı
  (`Yükleme`/`Tarama`/`Analiz`/`Sonuç`) ilerleme göstergesi, ilerleme
  çubuğu ve "Lexi-Trust Motoru aktif" AI bilgi bannerı eklendi —
  `OCR_PROCESSING`/`AI_PROCESSING` durumlarına göre aktif adım
  hesaplanır (`activeStepIndex`). Ardından **Yardım Merkezi**
  eklendi — `apps/mobile/src/content/help.ts` (statik kategori/makale
  içeriği, sunucu tarafı bir Destek API'si yok), `app/help/index.tsx`
  (arama, kategori bento grid'i, popüler sorular, destek ekibiyle
  iletişim kartı) ve `app/help/[slug].tsx` (breadcrumb, makale
  içeriği, "yararlı oldu mu" geri bildirimi — yalnızca ekran içi
  durumda tutulur, kalıcı değildir, ilgili makaleler). Profil menüsüne
  "Yardım Merkezi" satırı eklendi. Ardından **Bildirim Yönetimi**
  eklendi — API'de ilk kez `GET /notifications` ucu
  (`NotificationsService.findAllForUser`, kullanıcının bildirimlerini
  `scheduledAt`e göre azalan sırada döner) ve `@hukukai/types`e
  `NotificationSummary`. Mobilde `useNotifications` hook'u ve
  `app/notifications/index.tsx`: **Bildirimler** sekmesi gerçek süre
  hatırlatıcısı geçmişini (`sentAt`/`failedAt`e göre Gönderildi/
  İletilemedi/Bekliyor rozeti) listeler, **Ayarlar** sekmesi ise
  gerçek push kayıt akışını ve sabit 7/3/1/0 gün hatırlatıcı
  zamanlamasını salt bilgi amaçlı gösterir — backend'de kullanıcı
  başına yapılandırılabilir bir bildirim tercihi henüz yok, bu yüzden
  Stitch tasarımındaki e-posta bildirimi anahtarı ve özelleştirilebilir
  uyarı aralığı seçenekleri (bunlar gerçek bir işlevi olmayan sahte
  kontroller olacağından) eklenmedi. Profil menüsündeki daha önce ölü
  olan "Bildirim Tercihleri" satırı artık bu ekrana bağlı. Ardından
  **Hesap ve Güvenlik** ekranı eklendi (`app/account/settings.tsx`) —
  Faz 1'den beri var olan ama mobilde hiç bağlanmamış `GET`/`PATCH
  /auth/me` uçlarını kullanır: Ad Soyad ve Telefon düzenlenebilir,
  e-posta salt okunur gösterilir (değiştirme ucu yok). `useUpdateProfile`
  hook'u ve `auth-store`a eklenen `updateUser` action'ı, kaydetme
  sonrası profili yeniden login olmadan günceller. Profil menüsündeki
  "Güvenlik Ayarları" satırı artık bu ekrana bağlı. **Kapsam notu:**
  Stitch tasarımındaki parola değiştirme, 2FA ve oturum listesi
  bölümleri backend'de karşılığı olmadığından eklenmedi (ekranda bunu
  açıklayan bir bilgi bannerı var). Ardından **Tüm Belgeler** ekranı
  eklendi (`app/documents/index.tsx`) — `GET /documents` ucu zaten
  klasör filtresiz (tüm belgeler) sorguyu destekliyordu, backend
  değişikliği gerekmedi; arama, durum filtre çipleri (Tümü/Tamamlandı/
  İşleniyor/İnceleme Gerekli/Başarısız), belge kartlarında MIME türüne
  göre ikon ve durum rozeti. Dosyalarım sekmesine bu ekrana giden bir
  satır eklendi. **Kullanıcı talebiyle kapsam dışı bırakıldı:** risk
  skorlama/analiz sonucu ekranları — güvenilir bir risk puanlama
  modeli olmadan yanıltıcı olabileceği değerlendirilerek bu iterasyona
  dahil edilmedi. Ardından **Gelişmiş Filtreleme** Tüm Belgeler
  ekranına entegre edildi (ayrı bir ekran yerine aynı listeye açılan
  bir panel olarak — tasarımdaki "Öncelik/Risk Seviyesi" filtre
  bölümü, yukarıdaki risk skorlama kapsam dışı bırakma kararıyla
  tutarlı olarak eklenmedi): Belge Türü çoklu seçim çipleri (9 gerçek
  `DocumentType` değeri) ve Tarih Aralığı (GG.AA.YYYY) filtresi,
  filtre düğmesinde aktif filtre sayısı rozeti. Ardından **Panel**
  (`app/dashboard.tsx`) eklendi — tasarımdaki avukat dashboard'unun
  yalnızca gerçek veriye dayanan kısmı: Hızlı Erişim (Belge Yükle/Süre
  Hesapla/Hatırlatıcı/Tüm Araçlar), gerçek yaklaşan sürelerden Kritik
  Süreler (aciliyet renklendirmesiyle) ve gerçek `OCR_PROCESSING`/
  `AI_PROCESSING` durumundaki belgelerden Aktif Analizler. Tasarımdaki
  "Madde Uygunluk Denetimi", "Emsal Karar Taraması", "Risk Tespit
  Edildi" gibi karşılığı olmayan/risk skorlamaya dayanan öğeler
  bilinçli olarak eklenmedi. Profil menüsüne "Panel" satırı eklendi
  (role erişim duvarı olmadığından herkese açık). **Kapsam notu:**
  Stitch paketindeki tüm ekranlar artık ya uygulanmış ya da bilinçli
  olarak kapsam dışı bırakılmış durumda; kalan olası genişletmeler
  (emsal karar arama, e-tebligat entegrasyonu vb.) yeni ürün
  kararları gerektirir. Bu ortamda Expo web/Metro pnpm monorepo'da bir
  bundling sorunu yüzünden canlı ekran görüntüsü alınamadı; doğrulama
  yalnızca typecheck/lint/test ile
  yapıldı.

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

## Otonom Mevzuat Sistemi (devam ediyor)

Seed `RuleSet` verisi hâlâ "üretime alınmadan önce gerçek/güncel mevzuat
kaynağına karşı doğrulanmalı" uyarısıyla işaretliydi — bu, kullanıcı
talebiyle çözülen bir sonraki büyük iş kalemi: resmî kaynakları kendisi
izleyen, değişikliği tespit eden, etkisini analiz eden, yeni kural
sürümü üreten, bağımsız doğrulayan, test eden ve yalnızca güvenli
değişiklikleri otomatik yayınlayan bir sistem. Kritik ilke: **fail-closed**
— bir kuralda değişiklik tespit edilip henüz doğrulanmadıysa, sistem eski
kuralla sessizce "kesin" (ama potansiyel olarak yanlış) sonuç üretmeye
devam etmez.

Kapsam kararları: kaynak tarama (Resmî Gazete/GİB/SGK/Adalet Bakanlığı/
AYM) ve çoklu-model mutabakatı için gerçek sağlayıcı **arayüzü** + mevcut
`AIProvider`/`PaymentProvider` deseniyle birebir aynı deterministik
**Mock** sağlayıcı kurulacak — gerçek scraping (siteye özel parser + ToS
incelemesi) ve gerçek ikinci LLM entegrasyonu (kullanıcının sağlayıcı/API
anahtarı kararını bekler) ayrı, sonraki fazlar. Geri kalan her şey (diff
tespiti, etki analizi, kural üretimi, 5+1 katmanlı doğrulama, golden
testler, risk kararı, fail-closed durum makinesi, admin inceleme ekranı,
mobil "doğrulanıyor" göstergesi, geriye dönük düzeltme) gerçek ve uçtan
uca çalışır şekilde kurulacak.

- **1. Parça — veri modeli**: Prisma şemasına `LegislationSource`,
  `LegislationDocument`, `LegislationChange`, `RuleImpactAssessment`,
  `RuleVerificationResult`, `GoldenTestCase`/`GoldenTestResult`,
  `RuleRemediation` modelleri eklendi. Mevcut `RuleSet` genişletildi:
  `status` (DRAFT/CHANGE_DETECTED/TEMPORARILY_RESTRICTED/VERIFIED/
  CANARY/ACTIVE/SUPERSEDED/REJECTED — servis katmanınca mevcut
  `isPublished`/`publishedAt` ile senkron tutulur, bu ikisi hâlâ
  `RulesService.getRuleValidOn`'ın gerçek kapısıdır), `selectorDateType`
  (TRANSACTION_DATE/OFFENSE_DATE/JUDGMENT_DATE/FINALIZATION_DATE/
  EXECUTION_DATE/PUBLICATION_DATE — infaz gibi hesaplamalarda hangi
  hukuki olay tarihinin kural seçimini belirlediğini tanımlar),
  `requiresFavorableLawComparison`, `confidenceScore`,
  `supersedesRuleSetId` (kendine referans, sürüm zinciri), `changeId`
  (üreten `LegislationChange`'e referans, null = admin elle oluşturdu,
  bugün olduğu gibi). `Deadline`e `invalidatedAt` eklendi (mevcut
  `Calculation.status`/`invalidatedAt` alanlarıyla aynı, önceden var
  olan ama hiç kullanılmamış emsal desen — geriye dönük düzeltme
  bunu kullanacak). Migration, ilk migration'la aynı yöntemle
  (`prisma migrate diff --from-schema-datamodel/--to-schema-datamodel`,
  canlı DB gerektirmez) üretildi; mevcut yayınlanmış (seed) `RuleSet`
  satırlarının yeni `status` sütununu `isPublished` ile tutarlı hale
  getiren bir `UPDATE ... SET status = 'ACTIVE'` veri-göçü satırı elle
  eklendi (yeni sütun `DEFAULT 'DRAFT'` ile geldiği için). **Kapsam
  notu:** bu parça yalnızca şema; servis katmanı (ajanlar, fail-closed
  sorgu değişikliği, admin/mobil ekranlar) sonraki parçalarda gelecek.
- **2. Parça — `packages/legislation-agents`**: diğer motor
  paketleriyle (`rule-engine`, `deadline-engine`) aynı üsluptaki saf
  fonksiyon + tip koleksiyonu dolduruldu: `compareLegislationTexts`
  (Legal Diff Agent çekirdeği — iki metnin SHA-256 hash'ini
  karşılaştırır, fark varsa anahtar kelime/desen eşleştirmesiyle
  `changeType` ve etkilenen madde referanslarını tahmin eder — bu bir
  MVP sezgiseldir, kesin NLP sınıflandırıcısı değildir),
  `validateRuleSchema` (Doğrulama katmanı D — çakışan/boşluklu
  geçerlilik aralığı, geçersiz decimal/tarih formatı, boş `legalBasis`
  denetimi), `runGoldenTests`/`runRegressionCheck` (hangi motoru
  çalıştıracağını bilmeyen, çağıran tarafça enjekte edilen bir
  `evaluate` kapanışı üzerinden golden test/regresyon karşılaştırması
  yapan jenerik çalıştırıcılar), `decideReleaseRisk` (kullanıcının
  verdiği otomatik-yayın/asla-otomatik-değil `changeType` listelerini
  ve %99,5 güven eşiğini birebir kodlayan saf risk kararı). Kaynak
  tarama (`SourceWatcherProvider`) ve çoklu-model mutabakatı
  (`MultiModelConsensusProvider`) için `AIProvider`/`PaymentProvider`
  ile birebir aynı değiştirilebilir arayüz + `factory.ts` deseni
  kuruldu — şu an yalnızca deterministik `Mock` sağlayıcılar var (Mock
  kaynak tarayıcı, fixture verilmezse boş dizi döner — hiçbir hayali
  mevzuat değişikliği üretmez). 30 birim testi (`vitest`, diğer motor
  paketleriyle aynı desen). **Kapsam notu:** gerçek kaynak tarama
  (Resmî Gazete/GİB/SGK/Adalet Bakanlığı/AYM'ye HTTP isteği, siteye özel
  parser + ToS incelemesi gerektirir) ve gerçek ikinci LLM sağlayıcısıyla
  çoklu-model mutabakatı (kullanıcının sağlayıcı/API anahtarı kararını
  bekler) bilinçli olarak bu pakete dahil edilmedi — yalnızca arayüz +
  Mock var; bu paket henüz `apps/api`'ye bağlanmadı (sonraki parça).
- **3. Parça — `LegislationModule` + fail-closed `RulesService`**:
  `packages/legislation-agents` artık `apps/api`'ye bağlandı.
  `apps/api/src/modules/legislation/` içinde her biri kullanıcının
  belirttiği bir "ajana" karşılık gelen servisler: `LegislationSourceWatcherService`
  (`SOURCE_WATCHER_PROVIDER` token'ını enjekte eder, yeni/değişen
  `contentHash`'e sahip belgeleri `LegislationDocument` olarak kaydeder —
  idempotent, aynı hash tekrar kaydedilmez), `LegislationLegalDiffService`
  (`compareLegislationTexts` ile aynı kaynak+başlıktan bir önceki belgeyle
  karşılaştırıp `LegislationChange` üretir), `legislation-rule-impact-map.ts`
  (`RULE_IMPACT_MAP` — `affectedLegislation` anahtar kelimesinden
  `ruleKey`/`module`'e statik, genişletilebilir MVP eşlemesi),
  `LegislationImpactAnalysisService` (etki değerlendirmesi üretir VE
  **fail-closed geçişi burada uygulanır**: etkilenen `RuleSet` satırları
  `ACTIVE` → `TEMPORARILY_RESTRICTED` yapılır), `LegislationRuleAuthorService`
  (bilinçli olarak dar kapsamlı — hiçbir AI sağlayıcısı çağırmaz, yalnızca
  `DEADLINE_EXTENSION`/`DEADLINE_CHANGE` metinlerinden regex ile gün sayısı
  çıkarabildiğinde bir `DRAFT` `RuleSet` taslağı üretir, aksi halde `null`
  döner — "AI mevzuat metnini anlıyor" gibi güvenilmez bir iddiada
  bulunmamak için), `LegislationIndependentReviewService`
  (`MULTI_MODEL_CONSENSUS_PROVIDER` ile ikinci bağımsız taslağı üretip
  alan alan karşılaştırır), `LegislationRuleVerificationService` (5+1
  katmanı orkestre eder — kaynak bütünlüğü, ikinci kaynak, model
  mutabakatı, şema/çakışma, golden testler, regresyon — her katman bir
  `RuleVerificationResult` satırı yazar), `LegislationReleaseDecisionService`
  (`decideReleaseRisk` + katman sonuçlarına göre adayı `ACTIVE` yapıp
  eskisini `SUPERSEDED` işaretler ya da `VERIFIED`/`HOLD_FOR_REVIEW` bırakır;
  admin elle onay/red için `approveManually`/`rejectManually`),
  `LegislationRuleRemediationService` (yeni `ACTIVE` sürüm yayınlandığında,
  ilgili tarih aralığına düşen ve yayından önce oluşturulmuş `Deadline`
  kayıtlarını `calculateDeadline` ile yeniden hesaplar, sonuç değişmişse
  `invalidatedAt` ile işaretler ve mevcut `Notification`/bildirim teslim
  worker'ını yeniden kullanarak kullanıcıyı bilgilendirir — **kapsam notu:**
  `calculation-engine` henüz `RuleSet`'ten oran okumadığından (Faz 6'dan
  beri bilinen boşluk) bu yalnızca `Deadline` için çalışır, `Calculation`
  için kapsam dışıdır), `LegislationPipelineService` (tüm zinciri
  uçtan uca tetikler) + `LegislationSourceWatcherScheduler`/`Processor`
  (`NotificationsSchedulerService` deseniyle BullMQ'da 15 dakikada bir
  tekrarlayan iş — Resmî Gazete'nin en sık önerilen tarama aralığı).
  Admin uçları (`@Roles("ADMIN")`, `AuditLogService.record` deseniyle):
  `GET /admin/legislation-changes`, `GET /admin/legislation-changes/:id`,
  `POST /admin/legislation-changes/:id/approve`, `.../reject`.
  **Fail-closed `RulesService` değişikliği**: `getRuleValidOn` ve
  `findApplicableRule` artık bir `ruleKey`/modül için `TEMPORARILY_RESTRICTED`
  durumundaki (tarih/koşul olarak eşleşen) bir satır bulursa, eski kuralla
  sessizce "kesin" sonuç üretmek yerine yeni `RuleUnderReviewException`
  (409 Conflict, `{underReview: true, ruleKey, message}` gövdesiyle)
  fırlatır. `LEGISLATION_SOURCE_SEED` (6 gerçek `.gov.tr` kaynağı — Resmî
  Gazete/GİB/SGK/Adalet Bakanlığı/CTE Genel Müdürlüğü/AYM) seed'e eklendi.
  25 yeni birim testi (toplam API testi artık 151). **Kapsam notu:** admin
  panelde "Mevzuat İzleme" ekranı ve mobilde "doğrulanıyor" bannerı/
  "mevzuat güncel" göstergesi henüz eklenmedi — bu uçlar hazır ama arayüzü
  sonraki bir parça.
- **5. Parça — admin panel "Mevzuat İzleme"**: `apps/admin/app/legislation/`
  (mevcut `rule-sets`/`holidays` sayfalarıyla aynı sade `fetch`+`useState`
  deseni): liste sayfası tespit edilen tüm `LegislationChange` kayıtlarını
  (kaynak, belge, `changeType`, risk seviyesi, durum rozeti, yürürlük
  tarihi) gösterir; detay sayfası (`legislation/[id]`) etki analizini,
  aday kuralın 5+1 doğrulama katmanının geçti/kaldı rozetlerini, aday
  `ruleData`/`legalBasis` JSON'unu gösterir ve `HOLD_FOR_REVIEW`
  durumundaki değişiklikler için Onayla/Reddet düğmeleri sunar (mevcut
  `POST /admin/legislation-changes/:id/{approve,reject}` uçlarını
  çağırır). `@hukukai/types`e `LegislationChangeSummary`/
  `LegislationChangeDetail`/`LegislationCandidateRuleSetSummary`/
  `LegislationVerificationResultSummary` eklendi (diğer admin DTO'larıyla
  aynı desen). Yeni paylaşılan `statusBadgeStyle` yardımcı fonksiyonu
  (`apps/admin/src/lib/status-badge.ts`) durum/katman rozetlerini renklendirir.
  Ana navigasyona "Mevzuat İzleme" satırı eklendi. **Kapsam notu:** mobilde
  "doğrulanıyor" bannerı/"mevzuat güncel" göstergesi henüz eklenmedi —
  sonraki (son) parça.
- **6. Parça — mobil "doğrulanıyor" bannerı ve "mevzuat güncel" göstergesi
  (Otonom Mevzuat Sistemi tamamlandı)**: `RulesService.getRuleValidOn`/
  `findApplicableRule` artık `legislationStatus` (status, geçerlilik
  aralığı, `verifiedAt`, `confidenceScore`, `sourceUrl`) alanını da
  döndürüyor; `DeadlineCalculationResponse`e (`@hukukai/types`)
  `legislationStatus: RuleLegislationStatus` eklendi.
  `deadline/calculate.tsx`: hesaplama sonucu her zaman "Mevzuat güncel ·
  sürüm X · <durum> · son doğrulama: <tarih>" satırını gösterir; backend
  `RuleUnderReviewException` (409, `underReview: true`) döndürürse —
  yani ilgili kural yakın zamanda tespit edilen bir mevzuat değişikliği
  nedeniyle geçici olarak kısıtlanmışsa — sonuç kutusu yerine mevcut
  `WarningBanner` bileşeni (`@hukukai/ui`) ile "doğrulanıyor, kesin sonuç
  yok" mesajı gösterilir; controller katmanında ekstra bir
  try/catch gerekmedi (`RuleUnderReviewException`'ın yapısal gövdesi
  zaten NestJS tarafından olduğu gibi serileştirilir). Böylece Otonom
  Mevzuat Sistemi'nin tüm 6 parçası (veri modeli → saf ajan mantığı →
  API servisleri/fail-closed → admin panel → mobil gösterge) tamamlandı.

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
`pnpm --filter @hukukai/api prisma:migrate` (yerel `prisma migrate dev`,
canlı bir Postgres'e ihtiyaç duyar) ile yeni migration dosyaları
üretmelidir — artık asla `db push` kullanılmamalı, migration geçmişi
bozulur. Bu sandbox ortamında canlı Postgres olmadığı sürece, ilk
migration'daki gibi `prisma migrate diff --from-schema-datamodel
&lt;değişiklik-öncesi-schema.prisma-kopyası&gt; --to-schema-datamodel
schema.prisma --script` istisnası kabul edilebilir (`rule_sets`/
`Deadline` genişletmesi ve Otonom Mevzuat Sistemi tabloları için
`20260724124251_legislation_system` migration'ı, `LegislationDocument.rawText`
alanı için de `20260724130046_legislation_document_rawtext` migration'ı bu
yöntemle üretildi) — gerçek bir geliştirme makinesinde bundan sonraki
değişiklikler için `prisma migrate dev` tercih edilmelidir.

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
