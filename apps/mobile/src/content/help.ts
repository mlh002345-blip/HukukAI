/**
 * Yardım Merkezi içeriği — Stitch tasarım paketindeki `yard_m_merkezi`/
 * `yard_m_i_eri_i` ekranlarına karşılık gelir. Statik uygulama içi
 * içerik; sunucu tarafında bir Destek/SSS API'si yoktur.
 */

export interface HelpCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "belge-analizi",
    label: "Belge Analizi",
    description: "OCR ve yapay zeka analizi hakkında yardım.",
    icon: "description",
  },
  {
    id: "hesaplama-motoru",
    label: "Hesaplama Motoru",
    description: "Faiz, icra borcu ve vekâlet ücreti hesapları.",
    icon: "calculate",
  },
  {
    id: "odemeler",
    label: "Ödemeler",
    description: "Paketler, faturalar ve iade süreçleri.",
    icon: "payments",
  },
  {
    id: "hesap-guvenligi",
    label: "Hesap Güvenliği",
    description: "Parola sıfırlama ve hesap silme.",
    icon: "lock",
  },
];

export interface HelpArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface HelpArticle {
  slug: string;
  categoryId: string;
  title: string;
  updatedLabel: string;
  popular: boolean;
  sections: HelpArticleSection[];
  helpfulCount: number;
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "belge-analizi-nasil-calisir",
    categoryId: "belge-analizi",
    title: "Belge Analizi nasıl çalışır?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: true,
    helpfulCount: 428,
    sections: [
      {
        paragraphs: [
          "HukukAI'nın belge analizi motoru, icra tebligatı, mahkeme kararı, vergi yazısı veya trafik cezası gibi belgelerinizi taramak üzere tasarlanmıştır.",
        ],
      },
      {
        heading: "Analiz süreci adımları",
        paragraphs: [
          "Veri Sayısallaştırma: Yüklediğiniz PDF veya fotoğraf, OCR (Optik Karakter Tanıma) teknolojimiz ile dijital metne dönüştürülür. Dijital üretilmiş PDF'lerde gömülü metin katmanı doğrudan okunur.",
          "Anlamsal Ayrıştırma: Metin, yapay zeka modelimiz tarafından taranarak belge türü, taraflar, tarihler ve tutarlar belirlenir.",
          "Özetleme ve Öneri: Çıkarılan verilerden bir özet oluşturulur ve belge türüne uygun araçlar (süre hesaplama, hesaplama motorları) önerilir.",
        ],
      },
      {
        heading: "Bilmeniz gerekenler",
        paragraphs: [
          "Nihai hesaplamalar (süre, faiz, vergi vb.) her zaman deterministik kural motorunda yapılır; yapay zeka yalnızca sınıflandırma ve veri çıkarımı için kullanılır.",
          "Taranmış (görüntü tabanlı) PDF sayfaları ve HEIC formatı şu an desteklenmiyor; bu durumda size belgeyi fotoğraf olarak yeniden yüklemeniz önerilir.",
        ],
      },
    ],
  },
  {
    slug: "desteklenen-dosya-formatlari",
    categoryId: "belge-analizi",
    title: "Desteklenen dosya formatları nelerdir?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: false,
    helpfulCount: 96,
    sections: [
      {
        paragraphs: [
          "PDF, JPEG ve PNG formatındaki belgeleri yükleyebilirsiniz. Dosya boyutu 20 MB'ı, sayfa sayısı 50 sayfayı geçemez.",
          "HEIC formatı ve taranmış (görüntü tabanlı) PDF'ler şu anda OCR ile işlenemiyor; bu belgeler için fotoğraf çekerek yüklemenizi öneririz.",
        ],
      },
    ],
  },
  {
    slug: "belgelerim-ne-kadar-sure-saklaniyor",
    categoryId: "hesap-guvenligi",
    title: "HukukAI belgelerimi ne kadar süre saklıyor?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: true,
    helpfulCount: 214,
    sections: [
      {
        paragraphs: [
          "Belgeleriniz, hesabınız aktif olduğu sürece dosya kasanızda saklanır. Bir klasörü veya belgeyi sildiğinizde kayıt kalıcı olarak kaldırılır.",
          "Hesabınızı sildiğinizde tüm belgeleriniz, hesaplamalarınız, süreleriniz ve raporlarınız kalıcı olarak silinir; bu işlem geri alınamaz.",
        ],
      },
    ],
  },
  {
    slug: "hesaplama-motoru-hangi-araclari-icerir",
    categoryId: "hesaplama-motoru",
    title: "Hesaplama motoru hangi araçları içerir?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: true,
    helpfulCount: 173,
    sections: [
      {
        paragraphs: [
          "Yasal faiz, icra borcu, kira artışı, vekâlet ücreti, harç ön hesabı, serbest meslek makbuzu, KDV, gelir vergisi, SGK işveren maliyeti ve infaz ön hesabı olmak üzere 10 hesaplama aracı bulunur.",
          "Tüm hesaplamalar saf fonksiyonlarla ve ondalık hassasiyet kaybını önlemek için decimal.js ile yapılır; JavaScript'in kayan noktalı sayı hassasiyeti kullanılmaz.",
          "İnfaz ön hesabı, yüksek riskli bir alan olduğu için dört zorunlu yasal uyarıyı her çağrıda değişmez döner.",
        ],
      },
    ],
  },
  {
    slug: "yillik-plandan-aylik-plana-gecis",
    categoryId: "odemeler",
    title: "Paketimi nasıl değiştirebilirim?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: true,
    helpfulCount: 88,
    sections: [
      {
        paragraphs: [
          "Profil > Abonelik menüsünden Kullanım ve Paket ekranına ulaşabilir, istediğiniz pakete anında geçiş yapabilirsiniz.",
          "Paket sınırına (aylık belge analizi, aktif süre sayısı vb.) ulaştığınızda uygulama sizi otomatik olarak bu ekrana yönlendirir.",
        ],
      },
    ],
  },
  {
    slug: "e-tebligat-entegrasyonu",
    categoryId: "odemeler",
    title: "E-tebligat entegrasyonu var mı?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: true,
    helpfulCount: 41,
    sections: [
      {
        paragraphs: [
          "Şu anda doğrudan bir e-Tebligat entegrasyonu bulunmuyor. Tebligatınızı PDF veya fotoğraf olarak Dosyalarım'a yükleyerek analiz ettirebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "sifremi-nasil-sifirlarim",
    categoryId: "hesap-guvenligi",
    title: "Parolamı unuttum, ne yapmalıyım?",
    updatedLabel: "Son güncelleme: yakın zamanda",
    popular: false,
    helpfulCount: 52,
    sections: [
      {
        paragraphs: [
          "Giriş ekranındaki \"Şifremi Unuttum\" bağlantısına dokunarak kayıtlı e-posta adresinize bir sıfırlama bağlantısı gönderebilirsiniz.",
        ],
      },
    ],
  },
];

export function findHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

export function relatedArticles(article: HelpArticle, limit = 2): HelpArticle[] {
  return HELP_ARTICLES.filter(
    (candidate) => candidate.slug !== article.slug && candidate.categoryId === article.categoryId,
  ).slice(0, limit);
}
