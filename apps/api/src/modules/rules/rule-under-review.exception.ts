import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Fail-closed davranış (Otonom Mevzuat Sistemi, bkz. CLAUDE.md): bir
 * kuralda mevzuat değişikliği tespit edilip henüz bağımsız olarak
 * doğrulanmadıysa (`RuleSet.status = TEMPORARILY_RESTRICTED`),
 * `RulesService` eski kuralla sessizce "kesin" bir sonuç üretmeye
 * devam etmez — bu istisnayı fırlatır. Yanıt gövdesi doğrudan bu
 * istisnanın kurucusundaki nesnedir; istemci (mobil) `status: 409` ve
 * `underReview: true` alanına bakarak bunu normal bir hatadan ayırt
 * edip "doğrulanıyor" bannerını gösterir.
 */
export class RuleUnderReviewException extends HttpException {
  constructor(ruleKey: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: "RuleUnderReview",
        underReview: true,
        ruleKey,
        message:
          `"${ruleKey}" kuralında yakın zamanda bir mevzuat değişikliği tespit edildi ve ` +
          "henüz bağımsız olarak doğrulanmadı. Doğrulama tamamlanana kadar bu kural için " +
          "kesin bir sonuç üretilemez.",
      },
      HttpStatus.CONFLICT,
    );
  }
}
