# Kapalı Test Planı — Taslak (Faz 10)

> Bu belge, doküman Bölüm 24 (Test Stratejisi) ve Bölüm 25 Faz 10
> kapsamındaki "Kapalı test" maddesi için hazırlanmış bir manuel QA
> kontrol listesidir. Otomatik testler (`pnpm test`) bu listenin
> yerine geçmez; ikisi birlikte kullanılmalıdır. Gerçek cihaz/mağaza
> testi bu geliştirme ortamında çalıştırılamaz.

## Ön koşullar

- [ ] API, gerçek PostgreSQL/Redis/MinIO ile ayağa kaldırıldı
      (`docker compose -f infrastructure/docker/docker-compose.yml up -d`)
- [ ] `pnpm --filter @hukukai/api prisma:migrate` ve `prisma:seed` çalıştırıldı
- [ ] Expo uygulaması gerçek bir Android cihazda/emülatörde çalışıyor
- [ ] `pnpm typecheck && pnpm lint && pnpm test` yeşil

## Kimlik doğrulama ve onboarding

- [ ] Kayıt (rol seçimiyle) — Kullanım Koşulları/KVKK onayı olmadan kayıt engelleniyor
- [ ] Kullanım Koşulları / KVKK Aydınlatma Metni ekranları açılıp okunabiliyor
- [ ] Giriş, çıkış, misafir kullanım
- [ ] Hesabımı Sil akışı — silme sonrası tekrar aynı bilgilerle giriş yapılamıyor

## Evrensel arama ve araçlar

- [ ] "Kaç yıl yatar?" araması infaz aracını getiriyor
- [ ] "Radar cezasına itiraz" araması trafik cezası süre aracını getiriyor
- [ ] "SMM" araması serbest meslek makbuzunu getiriyor
- [ ] Rol değişimi hiçbir aracı gizlemiyor

## Dosya kasası ve belge analizi

- [ ] Klasör oluşturma/düzenleme/silme
- [ ] Belge yükleme (MIME/boyut doğrulaması, mükerrer belge tespiti)
- [ ] Belge analizi başlatma → OCR/AI işleniyor → sonuç ekranı
- [ ] Düşük güven skorunda inceleme ekranı açılıyor, veriler düzenlenebiliyor
- [ ] Önerilen araçlar doğru şekilde listeleniyor

## Süre motoru

- [ ] İcra itiraz, trafik cezası itiraz/indirimli ödeme süresi hesaplama
- [ ] Hatırlatıcı ekleme → takvimde görünüyor
- [ ] Hafta sonu/resmi tatil uzatması doğru uygulanıyor
- [ ] Süre tamamlama/silme

## Hesaplama motorları

- [ ] Yasal faiz (çok dönemli), icra borcu, kira artışı, vekâlet ücreti,
      harç, SMM, KDV, gelir vergisi, SGK işveren maliyeti hesaplamaları
- [ ] İnfaz ön hesabı — dört zorunlu uyarı her seferinde görünüyor

## Raporlama

- [ ] PDF oluşturma (belge analizi, hesaplama, süre)
- [ ] FREE planda rapor filigranlı, Bireysel/Pro'da filigransız
- [ ] Raporlarım listesi ve indirme bağlantısı çalışıyor

## Paket ve kota (Faz 8)

- [ ] FREE planda aylık analiz kotası (2) dolunca 403 + "Paketi Yükselt" akışı
- [ ] Sayfa sınırını aşan belge analizi reddediliyor
- [ ] Aktif süre sınırı aşılınca yeni süre eklenemiyor
- [ ] Paket yükseltme ve tek seferlik kredi satın alma (mock ödeme) çalışıyor

## Admin panel (Faz 9)

- [ ] `ADMIN` olmayan bir kullanıcı ile admin paneline giriş reddediliyor
- [ ] Kullanıcı listeleme, dondurma/aktifleştirme — dondurulan kullanıcı
      mobil uygulamada giriş yapamıyor
- [ ] Kural seti taslak oluşturma ve yayınlama
- [ ] Resmi tatil ekleme/silme
- [ ] AI maliyet ve audit log ekranları veri gösteriyor

## Güvenlik (Faz 10)

- [ ] `/docs` (Swagger) üretim ortamında (`NODE_ENV=production`) erişilemiyor
- [ ] Login/register uçlarında sık deneme sonrası 429 (rate limit) alınıyor
- [ ] API yanıtlarında güvenlik başlıkları mevcut (helmet)

## Performans ve kararlılık

- [ ] Uygulama açılışı ve ana ekranlar arası geçiş gözle görülür
      donma/gecikme olmadan çalışıyor
- [ ] Büyük (sınıra yakın sayfa sayısında) bir belge yükleyip analiz
      etmek uygulamayı kilitlemiyor
- [ ] Ağ hatası/timeout senaryolarında anlamlı hata mesajı gösteriliyor

## Bilinen sınırlamalar (bu tur için kapsam dışı)

- Gerçek ödeme sağlayıcısı entegrasyonu yok (`MockPaymentProvider`)
- Gerçek OCR/antivirüs sağlayıcısı yok (yer tutucu implementasyonlar)
- RuleSet seed verisi üretime alınmadan önce mevzuat kaynağıyla
  doğrulanmalı
