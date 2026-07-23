import { PrismaClient } from "@prisma/client";
import { TOOL_CATALOG_SEED } from "@hukukai/search-engine";

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

  const holidayCount = await prisma.holiday.count();
  if (holidayCount === 0) {
    // Faz 5'te resmi tatil listesi ayrı ve kapsamlı şekilde doldurulacaktır.
    await prisma.holiday.create({
      data: { date: new Date("2026-01-01"), name: "Yılbaşı" },
    });
    console.warn("Örnek resmi tatil eklendi (Faz 5'te tamamlanacak).");
  }
}

main()
  .catch((error) => {
    console.error("Seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
