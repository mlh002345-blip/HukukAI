import { Catch, HttpException, type ArgumentsHost } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

/**
 * Beklenmeyen (5xx) hataları Sentry'ye raporlar (Bölüm 20 — Güvenlik
 * ve KVKK). Öngörülen HTTP hataları (4xx — doğrulama, yetkilendirme
 * vb.) uygulama akışının normal bir parçası olduğundan raporlanmaz.
 * `SENTRY_DSN` ayarlanmadıysa Sentry SDK'sı no-op çalışır.
 */
@Catch()
export class SentryExceptionsFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    const isClientError =
      exception instanceof HttpException && exception.getStatus() < 500;
    if (!isClientError) {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }
}
