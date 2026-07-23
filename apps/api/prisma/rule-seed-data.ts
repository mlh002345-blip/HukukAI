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
    warnings: [UNVERIFIED_WARNING],
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
    warnings: [UNVERIFIED_WARNING],
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
    warnings: [UNVERIFIED_WARNING],
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
