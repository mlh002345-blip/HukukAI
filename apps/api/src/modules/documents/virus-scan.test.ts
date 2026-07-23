import { describe, expect, it } from "vitest";
import { scanChecksum } from "./virus-scan";

describe("scanChecksum", () => {
  it("bilinmeyen checksum için temiz sonuç döner", () => {
    const result = scanChecksum(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect(result.clean).toBe(true);
  });

  it("EICAR test imzasını reddeder", () => {
    const result = scanChecksum(
      "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0",
    );
    expect(result.clean).toBe(false);
  });

  it("büyük/küçük harf duyarsız çalışır", () => {
    const result = scanChecksum(
      "275A021BBFB6489E54D471899F7DB9D1663FC695EC2FE2A2C4538AABF651FD0",
    );
    expect(result.clean).toBe(false);
  });
});
