import { Injectable } from "@nestjs/common";
import type { OcrProvider, OcrRecognizeInput, OcrResult } from "./ocr-provider";
import { estimatePdfPageCount } from "./pdf-page-count";

const PLACEHOLDER_CONFIDENCE = 0.5;

/**
 * Faz 4 yer tutucusu: gerçek bir OCR motoru (ör. Tesseract, Google
 * Cloud Vision) entegrasyonu bu servisin yerini alacaktır. Bugün
 * gerçek metin çıkarımı yapmaz; sabit ve düşük bir güven skoru
 * döndürerek her belgenin "İnceleme gerekli" durumuna düşmesini
 * (dolayısıyla kullanıcı tarafından gözden geçirilmesini) sağlar.
 */
@Injectable()
export class MockOcrProvider implements OcrProvider {
  readonly name = "mock-ocr-v1";

  async recognize(input: OcrRecognizeInput): Promise<OcrResult> {
    const pageCount =
      input.mimeType === "application/pdf"
        ? estimatePdfPageCount(input.buffer)
        : 1;

    return {
      text: `[OCR yer tutucusu] "${input.originalName}" (${input.mimeType}, ${input.buffer.byteLength} bayt) için otomatik metin çıkarımı henüz etkin değildir.`,
      confidence: PLACEHOLDER_CONFIDENCE,
      pageCount,
    };
  }
}
