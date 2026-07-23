import { PrismaClient } from "@prisma/client";
import { TOOL_CATALOG_SEED } from "@hukukai/search-engine";
import { DEADLINE_RULE_SEED, HOLIDAY_SEED } from "./rule-seed-data";

const prisma = new PrismaClient();

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
}

main()
  .catch((error) => {
    console.error("Seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
