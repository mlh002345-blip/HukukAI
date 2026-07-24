import type { LegalBasisRef } from "@hukukai/rule-engine";

export interface RuleVersionLike {
  ruleKey: string;
  version: string;
  validFrom: string;
  validTo: string | null;
  legalBasis: LegalBasisRef[];
  ruleData?: Record<string, unknown>;
}

export interface SchemaValidationOptions {
  /** ruleData içinde ondalık (decimal.js uyumlu string) olması gereken alan adları. */
  decimalFields?: string[];
  /** ruleData içinde ISO tarih olması gereken alan adları. */
  dateFields?: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

function isValidIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

/**
 * Kural Üretim Agent çıktısının şema/çakışma denetimi (Doğrulama katmanı
 * D — kullanıcının belirttiği "çakışan geçerlilik aralığı oluşturmamalı,
 * tarih boşluğu oluşturmamalı, decimal ve tarih formatları doğru olmalı,
 * kaynak dayanağı olmadan yayınlanmamalı" kuralları). Saf fonksiyon —
 * Prisma'ya erişmez; `existingVersions` çağıran tarafça (aynı `ruleKey`
 * için veritabanındaki diğer sürümler) sağlanır.
 */
export function validateRuleSchema(
  candidate: RuleVersionLike,
  existingVersions: RuleVersionLike[],
  options: SchemaValidationOptions = {},
): SchemaValidationResult {
  const errors: string[] = [];

  if (!isValidIsoDate(candidate.validFrom)) {
    errors.push("validFrom geçerli bir ISO tarih değil.");
  }
  if (candidate.validTo !== null && !isValidIsoDate(candidate.validTo)) {
    errors.push("validTo geçerli bir ISO tarih değil.");
  }
  if (
    candidate.validTo !== null &&
    isValidIsoDate(candidate.validFrom) &&
    isValidIsoDate(candidate.validTo) &&
    candidate.validFrom >= candidate.validTo
  ) {
    errors.push("validTo, validFrom'dan sonra olmalıdır.");
  }
  if (candidate.legalBasis.length === 0) {
    errors.push("legalBasis boş olamaz — kaynak dayanağı olmadan kural yayınlanamaz.");
  }

  for (const field of options.decimalFields ?? []) {
    const value = candidate.ruleData?.[field];
    if (typeof value !== "string" || !DECIMAL_PATTERN.test(value)) {
      errors.push(`"${field}" alanı geçerli bir decimal string değil: ${JSON.stringify(value)}`);
    }
  }
  for (const field of options.dateFields ?? []) {
    const value = candidate.ruleData?.[field];
    if (typeof value !== "string" || !isValidIsoDate(value)) {
      errors.push(`"${field}" alanı geçerli bir ISO tarih değil: ${JSON.stringify(value)}`);
    }
  }

  const sameKeyOthers = existingVersions.filter(
    (v) => v.ruleKey === candidate.ruleKey && v.version !== candidate.version,
  );
  if (existingVersions.some((v) => v.ruleKey === candidate.ruleKey && v.version === candidate.version)) {
    errors.push(`"${candidate.ruleKey}" için "${candidate.version}" sürümü zaten var.`);
  }

  const timeline = [...sameKeyOthers, candidate].sort((a, b) => a.validFrom.localeCompare(b.validFrom));
  for (let i = 0; i < timeline.length - 1; i += 1) {
    const current = timeline[i];
    const next = timeline[i + 1];
    if (!current || !next) continue;
    if (current.validTo === null) {
      errors.push(
        `"${current.version}" sürümü açık uçlu (validTo yok) ama ondan sonra "${next.version}" başlıyor — çakışma.`,
      );
    } else if (current.validTo < next.validFrom) {
      errors.push(
        `"${current.version}" ve "${next.version}" sürümleri arasında boşluk var: ${current.validTo} – ${next.validFrom} tarih aralığını kapsayan bir kural yok.`,
      );
    } else if (current.validTo > next.validFrom) {
      errors.push(`"${current.version}" ve "${next.version}" sürümleri çakışıyor.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
