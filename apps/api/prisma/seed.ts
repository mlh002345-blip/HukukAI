import { PrismaClient } from "@prisma/client";
import { TOOL_CATALOG_SEED } from "@hukukai/search-engine";
import { DEADLINE_RULE_SEED, HOLIDAY_SEED } from "./rule-seed-data";

const prisma = new PrismaClient();

/**
 * Otonom Mevzuat Sistemi'nin izleyeceği resmî kaynaklar. Tarama sıklığı
 * (`pollIntervalMinutes`) kullanıcının belirttiği önerilen aralıkları
 * yansıtır. `LEGISLATION_SOURCE_WATCHER=mock` olduğu sürece bu kaynaklar
 * gerçekten taranmaz — yalnızca gerçek bir sağlayıcı eklendiğinde
 * anlamlı hâle gelir.
 */
const LEGISLATION_SOURCE_SEED = [
  {
    key: "resmi_gazete",
    name: "Resmî Gazete",
    url: "https://www.resmigazete.gov.tr",
    category: "RESMI_GAZETE" as const,
    pollIntervalMinutes: 15,
  },
  {
    key: "gib",
    name: "Gelir İdaresi Başkanlığı",
    url: "https://www.gib.gov.tr",
    category: "GIB" as const,
    pollIntervalMinutes: 60,
  },
  {
    key: "sgk",
    name: "Sosyal Güvenlik Kurumu",
    url: "https://www.sgk.gov.tr",
    category: "SGK" as const,
    pollIntervalMinutes: 60,
  },
  {
    key: "adalet_bakanligi",
    name: "Adalet Bakanlığı",
    url: "https://www.adalet.gov.tr",
    category: "ADALET_BAKANLIGI" as const,
    pollIntervalMinutes: 60,
  },
  {
    key: "cte_genel_mudurlugu",
    name: "Ceza ve Tevkifevleri Genel Müdürlüğü",
    url: "https://cte.adalet.gov.tr",
    category: "CTE_GENEL_MUDURLUGU" as const,
    pollIntervalMinutes: 60,
  },
  {
    key: "anayasa_mahkemesi",
    name: "Anayasa Mahkemesi (Karar Bilgi Bankası)",
    url: "https://kararlarbilgibankasi.anayasa.gov.tr",
    category: "ANAYASA_MAHKEMESI" as const,
    pollIntervalMinutes: 60,
  },
];

async function main() {
  console.warn(`Araç kataloğu seed ediliyor (${TOOL_CATALOG_SEED.length} araç)...`);

  for (const tool of TOOL_CATALOG_SEED) {
    await prisma.toolDefinition.upsert({
      where: { id: tool.id },
      create: {
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        shortDescription: tool.shortDescription,
        categories: tool.categories,
        audiences: tool.audiences,
        keywords: tool.keywords,
        synonyms: tool.synonyms,
        icon: tool.icon,
        route: tool.route,
        isActive: tool.isActive,
        isBeta: tool.isBeta,
        requiresSubscription: tool.requiresSubscription,
        rolePriorities: tool.sortPriorityByRole,
      },
      update: {
        slug: tool.slug,
        name: tool.name,
        shortDescription: tool.shortDescription,
        categories: tool.categories,
        audiences: tool.audiences,
        keywords: tool.keywords,
        synonyms: tool.synonyms,
        icon: tool.icon,
        route: tool.route,
        isActive: tool.isActive,
        isBeta: tool.isBeta,
        requiresSubscription: tool.requiresSubscription,
        rolePriorities: tool.sortPriorityByRole,
      },
    });
  }

  console.warn("Araç kataloğu seed tamamlandı.");

  console.warn(`Resmi tatiller seed ediliyor (${HOLIDAY_SEED.length} gün)...`);
  for (const holiday of HOLIDAY_SEED) {
    const date = new Date(`${holiday.date}T00:00:00.000Z`);
    const existing = await prisma.holiday.findUnique({ where: { date } });
    if (!existing) {
      await prisma.holiday.create({ data: { date, name: holiday.name } });
    }
  }
  console.warn("Resmi tatiller seed tamamlandı.");

  console.warn(
    `Süre kuralları (RuleSet) seed ediliyor (${DEADLINE_RULE_SEED.length} kural)...`,
  );
  for (const rule of DEADLINE_RULE_SEED) {
    await prisma.ruleSet.upsert({
      where: { ruleKey_version: { ruleKey: rule.ruleKey, version: rule.version } },
      create: {
        id: rule.id,
        module: rule.module,
        ruleKey: rule.ruleKey,
        version: rule.version,
        validFrom: new Date(`${rule.validFrom}T00:00:00.000Z`),
        ruleData: { conditions: rule.conditions, calculation: rule.calculation, warnings: rule.warnings },
        legalBasis: rule.legalBasis,
        isPublished: true,
        publishedAt: new Date(),
        // status, isPublished ile senkron tutulur (bkz. CLAUDE.md
        // Otonom Mevzuat Sistemi) — seed verisi elle yayınlanmış kabul
        // edilir.
        status: "ACTIVE",
      },
      update: {
        ruleData: { conditions: rule.conditions, calculation: rule.calculation, warnings: rule.warnings },
        legalBasis: rule.legalBasis,
      },
    });
  }
  console.warn(
    "Süre kuralları seed tamamlandı. UYARI: Bu değerler geliştirme " +
      "amaçlıdır; üretime almadan önce güncel mevzuattan doğrulayın.",
  );

  console.warn(
    `Mevzuat kaynakları seed ediliyor (${LEGISLATION_SOURCE_SEED.length} kaynak)...`,
  );
  for (const source of LEGISLATION_SOURCE_SEED) {
    await prisma.legislationSource.upsert({
      where: { key: source.key },
      create: source,
      update: { name: source.name, url: source.url, pollIntervalMinutes: source.pollIntervalMinutes },
    });
  }
  console.warn(
    "Mevzuat kaynakları seed tamamlandı. UYARI: LEGISLATION_SOURCE_WATCHER " +
      "hâlâ mock sağlayıcıdır — bu kaynaklar gerçekten taranmaz (bkz. CLAUDE.md).",
  );
}

main()
  .catch((error) => {
    console.error("Seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
