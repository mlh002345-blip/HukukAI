import { describe, expect, it } from "vitest";
import { DOCUMENT_TYPES } from "@hukukai/types";
import {
  DOCUMENT_TYPE_TOOL_SLUGS,
  recommendToolSlugsForDocumentType,
} from "./tool-recommendations";

describe("recommendToolSlugsForDocumentType", () => {
  it("null belge türü için boş liste döner", () => {
    expect(recommendToolSlugsForDocumentType(null)).toEqual([]);
  });

  it("bilinen her belge türü için bir eşleme tanımlıdır", () => {
    for (const type of DOCUMENT_TYPES) {
      expect(DOCUMENT_TYPE_TOOL_SLUGS[type]).toBeDefined();
    }
  });

  it("kira sözleşmesi için kira artışı aracını önerir", () => {
    expect(recommendToolSlugsForDocumentType("RENT_AGREEMENT")).toContain(
      "kira-artisi",
    );
  });

  it("bilinmeyen belge türü için öneri yapmaz", () => {
    expect(
      recommendToolSlugsForDocumentType("UNKNOWN_OFFICIAL_DOCUMENT"),
    ).toEqual([]);
  });
});
