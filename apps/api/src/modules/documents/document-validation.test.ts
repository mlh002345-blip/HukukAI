import { describe, expect, it } from "vitest";
import { UPLOAD_LIMITS } from "@hukukai/config";
import {
  UploadValidationError,
  assertExtensionMatchesMime,
  assertMimeTypeAllowed,
  assertSizeWithinLimit,
  validateUploadRequest,
} from "./document-validation";

describe("assertMimeTypeAllowed", () => {
  it("izin verilen MIME türünü kabul eder", () => {
    expect(() => assertMimeTypeAllowed("application/pdf")).not.toThrow();
  });

  it("izin verilmeyen MIME türünü reddeder", () => {
    expect(() => assertMimeTypeAllowed("application/zip")).toThrow(
      UploadValidationError,
    );
  });
});

describe("assertExtensionMatchesMime", () => {
  it("uzantı MIME ile uyuşuyorsa geçer", () => {
    expect(() =>
      assertExtensionMatchesMime("dilekce.pdf", "application/pdf"),
    ).not.toThrow();
    expect(() =>
      assertExtensionMatchesMime("foto.jpeg", "image/jpeg"),
    ).not.toThrow();
  });

  it("uzantı MIME ile uyuşmuyorsa reddeder", () => {
    expect(() =>
      assertExtensionMatchesMime("dilekce.png", "application/pdf"),
    ).toThrow(UploadValidationError);
  });

  it("uzantısı olmayan dosyayı reddeder", () => {
    expect(() =>
      assertExtensionMatchesMime("dilekce", "application/pdf"),
    ).toThrow(UploadValidationError);
  });
});

describe("assertSizeWithinLimit", () => {
  it("azami boyutun altındaki dosyayı kabul eder", () => {
    expect(() => assertSizeWithinLimit(1024)).not.toThrow();
  });

  it("sıfır veya negatif boyutu reddeder", () => {
    expect(() => assertSizeWithinLimit(0)).toThrow(UploadValidationError);
    expect(() => assertSizeWithinLimit(-1)).toThrow(UploadValidationError);
  });

  it("azami boyutu aşan dosyayı reddeder", () => {
    expect(() =>
      assertSizeWithinLimit(UPLOAD_LIMITS.maxFileSizeBytes + 1),
    ).toThrow(UploadValidationError);
  });
});

describe("validateUploadRequest", () => {
  it("geçerli bir yükleme isteğini kabul eder", () => {
    expect(() =>
      validateUploadRequest({
        fileName: "icra-emri.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
      }),
    ).not.toThrow();
  });

  it("ilk başarısız kuralda hata fırlatır", () => {
    expect(() =>
      validateUploadRequest({
        fileName: "icra-emri.exe",
        mimeType: "application/zip",
        sizeBytes: 2048,
      }),
    ).toThrow(UploadValidationError);
  });
});
