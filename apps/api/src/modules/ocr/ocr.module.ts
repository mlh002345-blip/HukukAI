import { Module } from "@nestjs/common";
import { OCR_PROVIDER } from "./ocr-provider";
import { MockOcrProvider } from "./mock-ocr-provider";

@Module({
  providers: [{ provide: OCR_PROVIDER, useClass: MockOcrProvider }],
  exports: [OCR_PROVIDER],
})
export class OcrModule {}
