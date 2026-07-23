import { describe, expect, it } from "vitest";
import { createAIProvider } from "./factory";
import { MockAIProvider } from "./providers/mock-ai-provider";
import { AnthropicAIProvider } from "./providers/anthropic-ai-provider";

describe("createAIProvider", () => {
  it("varsayılan/mock için MockAIProvider döner", () => {
    const provider = createAIProvider({ AI_PROVIDER: "mock" });
    expect(provider).toBeInstanceOf(MockAIProvider);
  });

  it("anthropic + API anahtarı için AnthropicAIProvider döner", () => {
    const provider = createAIProvider({
      AI_PROVIDER: "anthropic",
      AI_API_KEY: "test-key",
    });
    expect(provider).toBeInstanceOf(AnthropicAIProvider);
  });

  it("anthropic + API anahtarı yoksa hata fırlatır", () => {
    expect(() => createAIProvider({ AI_PROVIDER: "anthropic" })).toThrow();
  });
});
