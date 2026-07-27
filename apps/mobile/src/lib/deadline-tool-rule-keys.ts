/**
 * Süre motoru tarafından desteklenen araç slug'larından `RuleSet.ruleKey`'e
 * eşleme. Hem Araçlar sekmesi (manuel araç seçimi) hem de Belge Detayı'ndaki
 * "Önerilen Araçlar" (belge analizinden gelen otomatik öneri) bu haritayı
 * kullanır — bir kural yalnızca burada bir girdisi varsa gerçekten
 * tetiklenebilir (bkz. CLAUDE.md "Mevzuat kapsama araştırması" bulgusu).
 *
 * `istinaf-suresi`/`temyiz-suresi` (HUKUK) ve `ceza-istinaf-suresi`/
 * `ceza-temyiz-suresi` (CEZA) bilinçli olarak yalnızca burada (manuel
 * seçim) yer alır — Belge Detayı'ndaki `COURT_REASONED_DECISION` otomatik
 * önerisine EKLENMEMİŞTİR, çünkü hukuk/ceza yargılaması ayrımı belge
 * modelinde hiç yok; kullanıcı kendi davasının türünü bilerek doğru aracı
 * seçmelidir. (Not: 7499 sayılı Kanun'la 1 Haziran 2024'ten itibaren
 * verilen ceza kararlarında süre HMK ile aynı hâle geldi — ama bu tarihten
 * önceki ceza kararları hâlâ farklı bir süreye tabi, bkz. `TR_CRIMINAL_
 * COURT_APPEAL`/`TR_CRIMINAL_COURT_CASSATION`'ın eski sürümü.)
 */
export const DEADLINE_TOOL_RULE_KEYS: Record<string, string> = {
  "icra-itiraz-suresi": "TR_ENFORCEMENT_PAYMENT_ORDER_OBJECTION",
  "trafik-cezasi-itiraz-suresi": "TR_TRAFFIC_FINE_OBJECTION",
  "trafik-cezasi-indirimli-odeme-suresi": "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT",
  "haciz-ihbarnamesi-itiraz-suresi": "TR_ENFORCEMENT_THIRD_PARTY_NOTICE_OBJECTION",
  "vergi-mahkemesi-dava-suresi": "TR_TAX_COURT_ACTION",
  "vergi-uzlasma-basvuru-suresi": "TR_TAX_SETTLEMENT_APPLICATION",
  "sgk-itiraz-suresi": "TR_SGK_OBJECTION",
  "istinaf-suresi": "TR_COURT_APPEAL",
  "temyiz-suresi": "TR_COURT_CASSATION",
  "ceza-istinaf-suresi": "TR_CRIMINAL_COURT_APPEAL",
  "ceza-temyiz-suresi": "TR_CRIMINAL_COURT_CASSATION",
};
