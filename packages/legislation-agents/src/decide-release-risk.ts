import {
  AUTO_PUBLISH_ELIGIBLE_CHANGE_TYPES,
  NEVER_AUTO_PUBLISH_CHANGE_TYPES,
  type ReleaseDecision,
  type ReleaseRiskInput,
} from "./types";

/** Kullanıcının belirttiği eşik: güven skoru bunun altındaysa otomatik
 * yayın asla yapılmaz, katmanların tamamı geçse bile. */
export const AUTO_PUBLISH_CONFIDENCE_THRESHOLD = 0.995;

/**
 * Release Decision Agent'ın saf çekirdeği. Kullanıcının verdiği
 * "otomatik yayınlanabilir" / "otomatik yayınlanmamalı" listelerini
 * birebir kodlar:
 *
 * - `changeType` asla-otomatik-değil listesindeyse → her zaman REJECT
 *   değil, `HOLD_FOR_REVIEW` (insan onayı bekler; sistem eski kuralı da
 *   güvenilir kabul etmeyi bırakır — bkz. fail-closed durum makinesi).
 * - Herhangi bir doğrulama katmanı başarısız olduysa → HOLD_FOR_REVIEW.
 * - `changeType` otomatik-uygun listesinde, tüm katmanlar geçti ve
 *   güven skoru eşiğin üzerindeyse → AUTO_PUBLISH.
 * - Bunların dışındaki (listede olmayan bir changeType, ör.
 *   NEW_PROVISION/AMENDED_PROVISION) durumlar temkinli olarak
 *   HOLD_FOR_REVIEW'a düşer — "otomatik yayınlanabilir" listesi
 *   kapsayıcı değil, dışlayıcıdır (yalnızca açıkça izin verilenler
 *   otomatik yayınlanır).
 */
export function decideReleaseRisk(input: ReleaseRiskInput): ReleaseDecision {
  const reasons: string[] = [];

  if (NEVER_AUTO_PUBLISH_CHANGE_TYPES.includes(input.changeType)) {
    return {
      outcome: "HOLD_FOR_REVIEW",
      reasons: [`"${input.changeType}" değişiklik türü hiçbir koşulda otomatik yayınlanmaz.`],
    };
  }

  const failedLayers = input.verificationResults.filter((result) => !result.passed);
  if (failedLayers.length > 0) {
    return {
      outcome: "HOLD_FOR_REVIEW",
      reasons: failedLayers.map((result) => `"${result.layer}" katmanı geçmedi.`),
    };
  }

  if (!AUTO_PUBLISH_ELIGIBLE_CHANGE_TYPES.includes(input.changeType)) {
    return {
      outcome: "HOLD_FOR_REVIEW",
      reasons: [`"${input.changeType}" değişiklik türü otomatik yayın için açıkça izinli listede değil.`],
    };
  }

  if (input.confidenceScore < AUTO_PUBLISH_CONFIDENCE_THRESHOLD) {
    return {
      outcome: "HOLD_FOR_REVIEW",
      reasons: [
        `Güven skoru (${input.confidenceScore}) otomatik yayın eşiğinin (${AUTO_PUBLISH_CONFIDENCE_THRESHOLD}) altında.`,
      ],
    };
  }

  reasons.push(`"${input.changeType}" otomatik yayın için uygun, tüm doğrulama katmanları geçti.`);
  return { outcome: "AUTO_PUBLISH", reasons };
}
