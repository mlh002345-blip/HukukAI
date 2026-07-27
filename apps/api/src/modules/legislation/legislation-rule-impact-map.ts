/**
 * Etkilenen mevzuatın başlığından hangi `RuleSet.ruleKey`lerin
 * etkilendiğine dair MVP eşlemesi. Anahtar kelime tabanlıdır (diğer
 * sağlayıcılardaki `MockAIProvider`'ın sınıflandırma deseniyle aynı
 * üslup) — gerçek bir NLP tabanlı eşleme değildir. Bu projede şu an
 * yalnızca `DEADLINE` modülünde kural var (bkz. CLAUDE.md — hesaplama
 * motoru henüz RuleSet'ten okumuyor); bu yüzden harita yalnızca süre
 * kurallarını kapsar. Yeni bir ruleKey eklendiğinde bu tabloya bir
 * girdi eklenmelidir.
 */
export interface RuleImpactMapEntry {
  keywords: string[];
  module: string;
  ruleIds: string[];
}

export const RULE_IMPACT_MAP: RuleImpactMapEntry[] = [
  {
    keywords: ["trafik"],
    module: "DEADLINE",
    ruleIds: ["TR_TRAFFIC_FINE_OBJECTION", "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT"],
  },
  {
    keywords: ["icra", "ödeme emri"],
    module: "DEADLINE",
    ruleIds: ["TR_ENFORCEMENT_PAYMENT_ORDER_OBJECTION"],
  },
  {
    keywords: ["haciz ihbarname", "üçüncü şahıs"],
    module: "DEADLINE",
    ruleIds: ["TR_ENFORCEMENT_THIRD_PARTY_NOTICE_OBJECTION"],
  },
  {
    keywords: ["vergi", "uzlaşma"],
    module: "DEADLINE",
    ruleIds: ["TR_TAX_COURT_ACTION", "TR_TAX_SETTLEMENT_APPLICATION"],
  },
  {
    keywords: ["sgk", "sosyal güvenlik"],
    module: "DEADLINE",
    ruleIds: ["TR_SGK_OBJECTION"],
  },
  {
    // Ceza Muhakemesi Kanunu'na özgü bir değişiklik hem istinaf hem temyiz
    // kurallarını etkileyebileceğinden ikisi birden kısıtlanır — bu, genel
    // "istinaf"/"temyiz" (HUKUK) girdilerinden ÖNCE kontrol edilir.
    keywords: ["ceza muhakemesi kanunu", "5271 sayılı", "7499 sayılı"],
    module: "DEADLINE",
    ruleIds: ["TR_CRIMINAL_COURT_APPEAL", "TR_CRIMINAL_COURT_CASSATION"],
  },
  {
    keywords: ["istinaf"],
    module: "DEADLINE",
    ruleIds: ["TR_COURT_APPEAL"],
  },
  {
    keywords: ["temyiz", "yargıtay"],
    module: "DEADLINE",
    ruleIds: ["TR_COURT_CASSATION"],
  },
];

export function resolveRuleImpact(
  affectedLegislation: string,
): { module: string; ruleIds: string[] } | null {
  const normalized = affectedLegislation.toLocaleLowerCase("tr");
  for (const entry of RULE_IMPACT_MAP) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return { module: entry.module, ruleIds: entry.ruleIds };
    }
  }
  return null;
}
