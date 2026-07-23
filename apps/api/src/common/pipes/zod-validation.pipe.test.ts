import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BadRequestException } from "@nestjs/common";
import { ZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  const schema = z.object({ email: z.string().email() });
  const pipe = new ZodValidationPipe(schema);

  it("geçerli veriyi olduğu gibi döner", () => {
    const result = pipe.transform({ email: "test@example.com" });
    expect(result).toEqual({ email: "test@example.com" });
  });

  it("geçersiz veri için BadRequestException fırlatır", () => {
    expect(() => pipe.transform({ email: "gecersiz" })).toThrow(
      BadRequestException,
    );
  });
});
