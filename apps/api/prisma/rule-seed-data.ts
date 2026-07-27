/**
 * Faz 5 — Süre motoru için başlangıç `RuleSet` verisi.
 *
 * ÖNEMLİ (Bölüm 16 notu ile birebir): Buradaki süre değerleri, yaygın
 * bilinen ve nispeten istikrarlı kanun maddelerine dayanır (İİK, HMK,
 * Kabahatler Kanunu, KTK, İYUK, 5510 sayılı Kanun). Ancak bunlar
 * GERÇEK ÜRETİME ALINMADAN ÖNCE güncel mevzuattan ve/veya bir hukuk
 * uzmanı tarafından doğrulanmalı, `sourceUrl`/`sourceHash` alanları
 * gerçek resmi kaynakla doldurulmalı ve gerekiyorsa yeni bir `RuleSet`
 * sürümü olarak (bu sürüm silinip değiştirilmeden) eklenmelidir.
 * Bu seed, geliştirme/demo ortamı içindir — her kuralın `warnings`
 * alanında bu durum açıkça belirtilir ve kullanıcıya gösterilir.
 *
 * Dini bayram tatilleri (Ramazan/Kurban Bayramı) bu seed'e DAHİL
 * DEĞİLDİR (hicri takvime göre yıldan yıla kaydığından güvenilir bir
 * kaynak olmadan buraya eklenmemiştir); yalnızca sabit tarihli resmi
 * tatiller eklenmiştir.
 */

const UNVERIFIED_WARNING =
  "Bu süre bir ön hesaptır ve geliştirme ortamı için seed edilmiştir; " +
  "üretime alınmadan önce güncel mevzuattan bir hukuk uzmanı tarafından " +
  "doğrulanmalıdır.";

export interface RuleSeed {
  id: string;
  module: string;
  ruleKey: string;
  version: string;
  validFrom: string;
  validTo?: string;
  conditions: Array<{ field: string; operator: string; value: unknown }>;
  calculation: {
    duration: number;
    durationUnit: "DAY" | "WEEK" | "MONTH" | "YEAR";
    dayType: "CALENDAR_DAY" | "BUSINESS_DAY";
    includeStartDate: boolean;
    extendIfHoliday: boolean;
  };
  legalBasis: Array<{ law: string; article?: string }>;
  warnings: string[];
}

export const DEADLINE_RULE_SEED: RuleSeed[] = [
  {
    id: "rule_enforcement_objection",
    module: "DEADLINE",
    ruleKey: "TR_ENFORCEMENT_PAYMENT_ORDER_OBJECTION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "ENFORCEMENT_PAYMENT_ORDER" },
    ],
    calculation: {
      duration: 7,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "İcra ve İflas Kanunu", article: "62" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Bu süre hem itiraz hem ödeme için genel bir tahmindir; takibin ilamlı/ilamsız oluşuna göre değişebilir.",
    ],
  },
  {
    id: "rule_traffic_fine_objection",
    module: "DEADLINE",
    ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "TRAFFIC_ADMINISTRATIVE_FINE" },
    ],
    calculation: {
      duration: 15,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "Kabahatler Kanunu", article: "27" }],
    warnings: [UNVERIFIED_WARNING, "Tebliğ yöntemi ve güncel mevzuat sonucu değiştirebilir."],
  },
  {
    id: "rule_traffic_fine_discount",
    module: "DEADLINE",
    ruleKey: "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT",
    version: "1.0.0",
    validFrom: "2020-01-01",
    validTo: "2024-01-30",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "TRAFFIC_ADMINISTRATIVE_FINE" },
    ],
    calculation: {
      duration: 15,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "Karayolları Trafik Kanunu", article: "115" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Yalnızca 31 Ocak 2024'ten ÖNCE tebliğ edilen cezalar için geçerlidir. " +
        "31.01.2024 tarihli (RG 32446) yönetmelik değişikliğiyle indirimli ödeme " +
        "süresi 1 aya çıkarıldı — bkz. bu ruleKey'in 2.0.0 sürümü.",
    ],
  },
  // WebSearch ile doğrulandı (icisleri.gov.tr, aa.com.tr, çok sayıda mali
  // müşavirlik sirküleri): 31 Ocak 2024 tarihli 32446 sayılı Resmî Gazete'de
  // yayımlanan yönetmelik değişikliğiyle, trafik idari para cezalarının %25
  // indirimli ödenebildiği süre 15 günden 1 aya çıkarıldı. Önceki sürümde
  // (v1.0.0) bu değişiklik hiç yansıtılmamıştı — kural GÜNCEL DEĞİLDİ.
  {
    id: "rule_traffic_fine_discount_2024",
    module: "DEADLINE",
    ruleKey: "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT",
    version: "2.0.0",
    validFrom: "2024-01-31",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "TRAFFIC_ADMINISTRATIVE_FINE" },
    ],
    calculation: {
      duration: 1,
      durationUnit: "MONTH",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [
      { law: "Karayolları Trafik Kanunu (31.01.2024 tarihli RG 32446 sayılı yönetmelik değişikliğiyle)", article: "115" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "31 Ocak 2024'ten (RG 32446) itibaren tebliğ edilen cezalar için geçerlidir: " +
        "indirimli ödeme süresi 15 günden 1 aya çıkarıldı. Bu bilgi ikincil " +
        "kaynaklardan (İçişleri Bakanlığı web sitesi, AA, mali müşavirlik " +
        "sirkülerleri) WebSearch ile derlendi, resmî yönetmelik metni üzerinden " +
        "ayrıca doğrulanmadı.",
    ],
  },
  {
    id: "rule_court_appeal",
    module: "DEADLINE",
    ruleKey: "TR_COURT_APPEAL",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [],
    calculation: {
      duration: 2,
      durationUnit: "WEEK",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "Hukuk Muhakemeleri Kanunu", article: "345" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Bu kural yalnızca HUKUK yargılaması içindir. Ceza yargılamasında " +
        "istinaf süresi 1 Haziran 2024'ten önce verilen kararlarda farklıydı " +
        "(CMK m.273 eski hâli — 7 gün, hükmün açıklanmasından itibaren); " +
        "7499 sayılı Kanun'la (RG 12.03.2024/32487) 1 Haziran 2024'ten " +
        "itibaren verilen ceza kararlarında süre bu kuralla aynı hâle geldi " +
        "(2 hafta, tebliğden). Ceza yargılaması için TR_CRIMINAL_COURT_APPEAL " +
        "kuralı kullanılmalıdır.",
    ],
  },
  {
    id: "rule_court_cassation",
    module: "DEADLINE",
    ruleKey: "TR_COURT_CASSATION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [],
    calculation: {
      duration: 2,
      durationUnit: "WEEK",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "Hukuk Muhakemeleri Kanunu", article: "361" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Bu kural yalnızca HUKUK yargılaması içindir. Ceza yargılamasında " +
        "temyiz süresi 1 Haziran 2024'ten önce verilen kararlarda farklıydı " +
        "(CMK m.291 eski hâli — 15 gün, hükmün açıklanmasından itibaren); " +
        "7499 sayılı Kanun'la (RG 12.03.2024/32487) 1 Haziran 2024'ten " +
        "itibaren verilen ceza kararlarında süre bu kuralla aynı hâle geldi " +
        "(2 hafta, tebliğden). Ceza yargılaması için TR_CRIMINAL_COURT_CASSATION " +
        "kuralı kullanılmalıdır.",
    ],
  },
  {
    id: "rule_tax_court_action",
    module: "DEADLINE",
    ruleKey: "TR_TAX_COURT_ACTION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "TAX_NOTICE" },
    ],
    calculation: {
      duration: 30,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "İdari Yargılama Usulü Kanunu", article: "7" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Uzlaşma veya düzeltme başvurusu yapılması bu süreyi durdurabilir/değiştirebilir.",
    ],
  },
  {
    id: "rule_sgk_objection",
    module: "DEADLINE",
    ruleKey: "TR_SGK_OBJECTION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "SGK_NOTICE" },
    ],
    calculation: {
      duration: 15,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu", article: "102" }],
    warnings: [UNVERIFIED_WARNING],
  },
  {
    id: "rule_enforcement_third_party_notice_objection",
    module: "DEADLINE",
    ruleKey: "TR_ENFORCEMENT_THIRD_PARTY_NOTICE_OBJECTION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "ENFORCEMENT_NOTICE" },
    ],
    calculation: {
      duration: 7,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [{ law: "İcra ve İflas Kanunu", article: "89" }],
    warnings: [
      UNVERIFIED_WARNING,
      "Bu kural İİK m.89 üçüncü şahıs haciz ihbarnamesine itiraz süresini varsayar; " +
        "ENFORCEMENT_NOTICE belge türü altında farklı ihbarname alt türleri (ör. " +
        "muhtelif icra ihbarnameleri) bulunabilir ve süre/usul bunlara göre değişebilir — " +
        "belge türünün gerçek alt kategorisi mutlaka kontrol edilmelidir.",
    ],
  },
  {
    id: "rule_tax_settlement_application",
    module: "DEADLINE",
    ruleKey: "TR_TAX_SETTLEMENT_APPLICATION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    conditions: [
      { field: "documentType", operator: "EQUALS", value: "TAX_NOTICE" },
    ],
    calculation: {
      duration: 30,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    // DÜZELTME (WebSearch ile doğrulandı): önceki sürüm yanlışlıkla "Ek 3"
    // atıfı yapıyordu — VUK Ek Madde 3 uzlaşma KOMİSYONLARININ kuruluşunu
    // düzenler, süreyi değil. Süreyi düzenleyen madde Ek Madde 1 (uzlaşmanın
    // şümulü/kapsamı) + Uzlaşma Yönetmeliği m.9'dur. Süre (30 gün) doğruydu,
    // yalnızca madde numarası hatalıydı.
    legalBasis: [
      { law: "213 sayılı Vergi Usul Kanunu", article: "Ek 1" },
      { law: "Uzlaşma Yönetmeliği", article: "9" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "Bu, dava açma süresinden (TR_TAX_COURT_ACTION — İYUK m.7) önceki isteğe bağlı " +
        "uzlaşma başvurusu süresidir; ikisi birbirinin alternatifi/ardışığıdır, aynı anda " +
        "her ikisi de 'geçerli' gösterilmemelidir — kullanıcıya hangi yolun seçildiği " +
        "ayrıca sorulmalıdır.",
    ],
  },
  // Ceza yargılamasında istinaf/temyiz — 7499 sayılı Kanun'la (RG 12.03.2024/32487,
  // 1 Haziran 2024'ten itibaren verilen kararlara uygulanır) CMK m.273/291
  // "hükmün açıklanmasından itibaren X gün" yerine "gerekçeli kararın tebliğinden
  // itibaren iki hafta" hâline getirildi — artık HMK m.345/361 ile aynı mekanizma
  // ve süre. Bu, WebSearch ile (barandogan.av.tr, ferhatkule.av.tr, nazaligundem.com
  // gibi kaynaklardan çapraz doğrulanarak) bu oturumda araştırılıp teyit edildi —
  // yine de RESMÎ metin (Resmî Gazete/mevzuat.gov.tr) üzerinden ayrıca doğrulanmalı,
  // bu kaynaklar ikincil (avukat blogu) niteliğindedir.
  {
    id: "rule_criminal_court_appeal_pre_2024",
    module: "DEADLINE",
    ruleKey: "TR_CRIMINAL_COURT_APPEAL",
    version: "1.0.0",
    validFrom: "2020-01-01",
    validTo: "2024-05-31",
    conditions: [],
    calculation: {
      duration: 7,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [
      { law: "5271 sayılı Ceza Muhakemesi Kanunu (7499 s.K. öncesi hâli)", article: "273" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "Yalnızca 1 Haziran 2024'ten ÖNCE verilen ceza kararları için geçerlidir; " +
        "süre hükmün AÇIKLANMASINDAN itibaren işler (tebliğden değil). " +
        "1 Haziran 2024'ten sonraki kararlar için TR_CRIMINAL_COURT_APPEAL'ın " +
        "yeni sürümü (2 hafta, tebliğden) geçerlidir.",
    ],
  },
  {
    id: "rule_criminal_court_appeal_post_2024",
    module: "DEADLINE",
    ruleKey: "TR_CRIMINAL_COURT_APPEAL",
    version: "2.0.0",
    validFrom: "2024-06-01",
    conditions: [],
    calculation: {
      duration: 2,
      durationUnit: "WEEK",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [
      { law: "5271 sayılı Ceza Muhakemesi Kanunu (7499 sayılı Kanun'la değişik)", article: "273" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "7499 sayılı Kanun'la (RG 12.03.2024/32487) değişen, 1 Haziran 2024'ten " +
        "itibaren verilen ceza kararlarına uygulanan süre: gerekçeli kararın " +
        "tebliğinden itibaren iki hafta. Bu tarihten önceki kararlarda " +
        "TR_CRIMINAL_COURT_APPEAL'ın eski sürümü (7 gün, hükmün açıklanmasından) " +
        "geçerlidir.",
    ],
  },
  {
    id: "rule_criminal_court_cassation_pre_2024",
    module: "DEADLINE",
    ruleKey: "TR_CRIMINAL_COURT_CASSATION",
    version: "1.0.0",
    validFrom: "2020-01-01",
    validTo: "2024-05-31",
    conditions: [],
    calculation: {
      duration: 15,
      durationUnit: "DAY",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [
      { law: "5271 sayılı Ceza Muhakemesi Kanunu (7499 s.K. öncesi hâli)", article: "291" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "Yalnızca 1 Haziran 2024'ten ÖNCE verilen ceza kararları için geçerlidir; " +
        "süre hükmün AÇIKLANMASINDAN itibaren işler (tebliğden değil). " +
        "1 Haziran 2024'ten sonraki kararlar için TR_CRIMINAL_COURT_CASSATION'ın " +
        "yeni sürümü (2 hafta, tebliğden) geçerlidir.",
    ],
  },
  {
    id: "rule_criminal_court_cassation_post_2024",
    module: "DEADLINE",
    ruleKey: "TR_CRIMINAL_COURT_CASSATION",
    version: "2.0.0",
    validFrom: "2024-06-01",
    conditions: [],
    calculation: {
      duration: 2,
      durationUnit: "WEEK",
      dayType: "CALENDAR_DAY",
      includeStartDate: false,
      extendIfHoliday: true,
    },
    legalBasis: [
      { law: "5271 sayılı Ceza Muhakemesi Kanunu (7499 sayılı Kanun'la değişik)", article: "291" },
    ],
    warnings: [
      UNVERIFIED_WARNING,
      "7499 sayılı Kanun'la (RG 12.03.2024/32487) değişen, 1 Haziran 2024'ten " +
        "itibaren verilen ceza kararlarına uygulanan süre: gerekçeli kararın " +
        "tebliğinden itibaren iki hafta. Bu tarihten önceki kararlarda " +
        "TR_CRIMINAL_COURT_CASSATION'ın eski sürümü (15 gün, hükmün " +
        "açıklanmasından) geçerlidir.",
    ],
  },
];

function fixedDateHolidays(year: number): Array<{ date: string; name: string }> {
  return [
    { date: `${year}-01-01`, name: "Yılbaşı" },
    { date: `${year}-04-23`, name: "Ulusal Egemenlik ve Çocuk Bayramı" },
    { date: `${year}-05-01`, name: "Emek ve Dayanışma Günü" },
    { date: `${year}-05-19`, name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı" },
    { date: `${year}-07-15`, name: "Demokrasi ve Millî Birlik Günü" },
    { date: `${year}-08-30`, name: "Zafer Bayramı" },
    { date: `${year}-10-29`, name: "Cumhuriyet Bayramı" },
  ];
}

export const HOLIDAY_SEED: Array<{ date: string; name: string }> = [
  2025, 2026, 2027,
].flatMap(fixedDateHolidays);
