export interface OcrRecognizeInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface OcrResult {
  text: string;
  confidence: number;
  pageCount: number;
}

export interface OcrProvider {
  readonly name: string;
  recognize(input: OcrRecognizeInput): Promise<OcrResult>;
}

export const OCR_PROVIDER = Symbol("OCR_PROVIDER");
