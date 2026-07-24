import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ApiEnv } from "@hukukai/config";
import { OCR_PROVIDER } from "./ocr-provider";
import { MockOcrProvider } from "./mock-ocr-provider";
import { TesseractOcrProvider } from "./tesseract-ocr-provider";

@Module({
  providers: [
    {
      provide: OCR_PROVIDER,
      useFactory: (configService: ConfigService<ApiEnv, true>) => {
        if (configService.get("OCR_PROVIDER", { infer: true }) === "tesseract") {
          return new TesseractOcrProvider({
            languages: configService.get("OCR_TESSERACT_LANGUAGES", {
              infer: true,
            }),
            langPath: configService.get("OCR_TESSERACT_LANG_PATH", {
              infer: true,
            }),
          });
        }
        return new MockOcrProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [OCR_PROVIDER],
})
export class OcrModule {}
