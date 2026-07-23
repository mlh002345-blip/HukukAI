/**
 * KVKK Aydınlatma Metni ve Kullanım Koşulları — taslak (Faz 10).
 * İÇERİK TASLAKTIR: yayına/mağazaya alınmadan önce bir hukuk
 * danışmanı tarafından incelenip onaylanmalıdır. Şirket unvanı,
 * iletişim ve başvuru bilgileri yer tutucudur.
 */

export const LEGAL_TEXT_VERSION = "1.0.0";

export const LEGAL_DRAFT_NOTICE =
  "Bu metin taslak niteliğindedir; yayına alınmadan önce bir hukuk danışmanı tarafından incelenmelidir.";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export const KVKK_SECTIONS: LegalSection[] = [
  {
    heading: "1. Veri Sorumlusu",
    paragraphs: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla [Şirket Unvanı Yer Tutucu] (\"HukukAI\") tarafından, aşağıda açıklanan kapsamda işlenmektedir.",
    ],
  },
  {
    heading: "2. İşlenen Kişisel Veri Kategorileri",
    paragraphs: [
      "Kimlik ve iletişim verileri (ad soyad, e-posta, telefon).",
      "Hesap ve işlem güvenliği verileri (giriş kayıtları, cihaz/IP bilgisi — IP adresi yalnızca özetlenmiş/karma (hash) biçimde saklanır).",
      "Yüklediğiniz belgeler ve bu belgelerden çıkarılan hukuki/mali veriler (belge türü, taraf bilgileri, tutarlar, tarihler).",
      "Paket, kullanım ve ödeme işlem verileri.",
    ],
  },
  {
    heading: "3. İşleme Amaçları",
    paragraphs: [
      "Hizmetin (belge analizi, süre hesaplama, hukuki/mali hesaplama, rapor üretimi) sunulması ve sözleşmenin ifası.",
      "Hesap güvenliğinin sağlanması, kötüye kullanımın önlenmesi.",
      "Yasal yükümlülüklerin yerine getirilmesi ve paket/kota yönetimi.",
      "Hizmet kalitesinin ölçülmesi ve geliştirilmesi.",
    ],
  },
  {
    heading: "4. Aktarım",
    paragraphs: [
      "Belge içerikleri, analiz amacıyla ve mümkün olduğunca kimliksizleştirilmiş biçimde, sözleşmesel yükümlülük altındaki üçüncü taraf AI/bulut altyapı sağlayıcılarına aktarılabilir.",
      "Kişisel verileriniz, yasal zorunluluk olmadıkça pazarlama amacıyla üçüncü taraflarla paylaşılmaz.",
      "Belgeleriniz, sağlayıcı modellerinin eğitiminde kullanılmaz.",
    ],
  },
  {
    heading: "5. Toplama Yöntemi ve Hukuki Sebep",
    paragraphs: [
      "Kişisel verileriniz, mobil uygulama üzerinden elektronik ortamda, sözleşmenin kurulması/ifası ve açık rızanız hukuki sebeplerine dayanılarak toplanır.",
    ],
  },
  {
    heading: "6. İlgili Kişi Hakları (KVKK m.11)",
    paragraphs: [
      "Kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini/yok edilmesini isteme, yapılan işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç ortaya çıkmasına itiraz etme ve zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
      "Bu haklarınızı kullanmak için uygulama içindeki \"Hesabımı Sil\" veya profil ekranındaki iletişim bilgileri üzerinden [başvuru e-postası yer tutucu] adresine yazılı olarak başvurabilirsiniz.",
    ],
  },
  {
    heading: "7. Saklama Süresi ve İmha",
    paragraphs: [
      "Kişisel verileriniz, hesabınız aktif olduğu sürece ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır.",
      "Hesabınızı sildiğinizde, yasal saklama yükümlülükleri hariç, verileriniz makul bir süre içinde silinir/anonim hale getirilir.",
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Hizmetin Tanımı",
    paragraphs: [
      "HukukAI, hukuki ve mali belgelerin analiz edilmesi, yasal sürelerin hesaplanması ve bilgilendirme amaçlı hesaplamalar (faiz, harç, vergi vb.) yapılması amacıyla sunulan bir yazılım hizmetidir.",
    ],
  },
  {
    heading: "2. Hukuki Tavsiye Niteliği Taşımaz",
    paragraphs: [
      "HukukAI tarafından üretilen analiz, süre hesabı, hesaplama ve raporlar yalnızca bilgilendirme amaçlıdır; bir avukat veya mali müşavirin profesyonel görüşünün yerine geçmez ve hukuki/mali tavsiye teşkil etmez.",
      "Nihai kararlarınızı almadan önce yetkili bir meslek mensubuna danışmanız önemle tavsiye edilir. Uygulamadaki hesaplama ve süre sonuçları, ilgili mevzuatın güncel ve doğru yorumlandığı varsayımıyla üretilir; olası hata ve gecikmelerden HukukAI sorumlu tutulamaz.",
    ],
  },
  {
    heading: "3. Hesap Oluşturma ve Kullanıcı Sorumlulukları",
    paragraphs: [
      "Hesabınıza ait giriş bilgilerinin gizliliğinden siz sorumlusunuz.",
      "Uygulamaya yüklediğiniz belgelerin içeriğinden ve bunları paylaşma yetkinizin bulunduğundan siz sorumlusunuz.",
    ],
  },
  {
    heading: "4. Paket, Kota ve Ödeme Koşulları",
    paragraphs: [
      "Ücretsiz, Bireysel ve Pro paketler farklı kullanım kotalarına (aylık belge analizi, aktif süre sayısı vb.) sahiptir; güncel paket limitleri uygulama içindeki \"Kullanım ve Paket\" ekranında yer alır.",
      "Tek seferlik kredi satın alımları ve paket yükseltmeleri iade edilemez, aksi yönde bir yasal düzenleme bulunmadıkça.",
    ],
  },
  {
    heading: "5. Fikri Mülkiyet",
    paragraphs: [
      "Uygulama, tasarımı ve yazılımı üzerindeki tüm haklar HukukAI'ye aittir. Yüklediğiniz belgeler üzerindeki haklar size aittir.",
    ],
  },
  {
    heading: "6. Sorumluluğun Sınırlandırılması",
    paragraphs: [
      "HukukAI, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Uygulama çıktılarına dayanılarak alınan kararlardan doğabilecek zararlardan, kasıt veya ağır ihmal halleri saklı kalmak kaydıyla, sorumlu tutulamaz.",
    ],
  },
  {
    heading: "7. Hesabın Sona Ermesi",
    paragraphs: [
      "Hesabınızı dilediğiniz zaman uygulama içinden kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.",
      "Bu koşulların ihlali halinde hesabınız askıya alınabilir veya sona erdirilebilir.",
    ],
  },
  {
    heading: "8. Değişiklikler",
    paragraphs: [
      "Bu koşullar zaman zaman güncellenebilir; önemli değişikliklerde uygulama içinden yeniden onayınız istenir.",
    ],
  },
];
