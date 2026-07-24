import { dirname, join } from "node:path";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createWorker, type Worker } from "tesseract.js";
import type * as PdfjsDist from "pdfjs-dist/legacy/build/pdf.mjs";
import type { OcrProvider, OcrRecognizeInput, OcrResult } from "./ocr-provider";
import { hasSufficientEmbeddedText } from "./pdf-text-layer";

export interface TesseractOcrProviderOptions {
  languages: string;
  langPath?: string;
}

// Gömülü metin katmanı doğrudan okunur (tahmini değil), bu yüzden
// yüksek bir sabit güven skoru atanır.
const PDF_TEXT_LAYER_CONFIDENCE = 0.98;
const SCANNED_DOCUMENT_NOTICE =
  "Bu belge taranmış bir görüntü olabilir; otomatik metin katmanı bulunamadı. Lütfen sayfayı net bir fotoğraf (JPEG/PNG) olarak tekrar yükleyin veya verileri manuel olarak girin.";

type PdfjsModule = typeof PdfjsDist;

function resolvePdfjsAssetDir(subdir: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS derlemesinde çalışma zamanı yol çözümlemesi için
  const pkgPath = require.resolve("pdfjs-dist/package.json") as string;
  return `${join(dirname(pkgPath), subdir)}/`;
}

/**
 * Üretim sağlayıcısı (`OCR_PROVIDER=tesseract`). PDF'lerde önce gömülü
 * metin katmanı `pdfjs-dist` ile okunur (çoğu kurumsal belge — icra
 * ödeme emri, trafik cezası vb. — dijital üretildiğinden bu
 * yeterlidir); metin katmanı yoksa (taranmış PDF) sayfa görüntüye
 * dönüştürülmeden gerçek OCR yapılamaz (bu, yerel poppler/ghostscript
 * bağımlılığı gerektirir ve bu sürümün kapsamı dışındadır — bkz.
 * CLAUDE.md). JPEG/PNG görüntülerde `tesseract.js` ile gerçek OCR
 * uygulanır.
 */
@Injectable()
export class TesseractOcrProvider implements OcrProvider, OnModuleDestroy {
  readonly name = "tesseract-v1";
  private workerPromise: Promise<Worker> | null = null;
  private pdfjsPromise: Promise<PdfjsModule> | null = null;

  constructor(private readonly options: TesseractOcrProviderOptions) {}

  async recognize(input: OcrRecognizeInput): Promise<OcrResult> {
    if (input.mimeType === "application/pdf") {
      return this.recognizePdf(input.buffer);
    }
    if (input.mimeType === "image/heic") {
      // tesseract.js'in görüntü çözücüsü HEIC'i desteklemez.
      return { text: SCANNED_DOCUMENT_NOTICE, confidence: 0, pageCount: 1 };
    }
    return this.recognizeImage(input.buffer);
  }

  private async recognizePdf(buffer: Buffer): Promise<OcrResult> {
    const { getDocument } = await this.getPdfjs();
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      standardFontDataUrl: resolvePdfjsAssetDir("standard_fonts"),
      cMapUrl: resolvePdfjsAssetDir("cmaps"),
      cMapPacked: true,
      useSystemFonts: true,
    }).promise;

    let text = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      text += `${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`;
    }

    if (hasSufficientEmbeddedText(text)) {
      return {
        text: text.trim(),
        confidence: PDF_TEXT_LAYER_CONFIDENCE,
        pageCount: pdf.numPages,
      };
    }

    return {
      text: SCANNED_DOCUMENT_NOTICE,
      confidence: 0,
      pageCount: pdf.numPages || 1,
    };
  }

  private async recognizeImage(buffer: Buffer): Promise<OcrResult> {
    const worker = await this.getWorker();
    const {
      data: { text, confidence },
    } = await worker.recognize(buffer);
    return {
      text: text.trim(),
      confidence: confidence / 100,
      pageCount: 1,
    };
  }

  private getWorker(): Promise<Worker> {
    if (!this.workerPromise) {
      this.workerPromise = createWorker(this.options.languages, undefined, {
        langPath: this.options.langPath,
      });
    }
    return this.workerPromise;
  }

  private getPdfjs(): Promise<PdfjsModule> {
    if (!this.pdfjsPromise) {
      this.pdfjsPromise = import(
        "pdfjs-dist/legacy/build/pdf.mjs"
      ) as Promise<PdfjsModule>;
    }
    return this.pdfjsPromise;
  }

  async onModuleDestroy(): Promise<void> {
    const worker = await this.workerPromise;
    await worker?.terminate();
    this.workerPromise = null;
  }
}
