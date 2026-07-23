import { describe, expect, it } from "vitest";
import { parseRedisConnection } from "./redis-connection";

describe("parseRedisConnection", () => {
  it("host ve portu ayrıştırır", () => {
    expect(parseRedisConnection("redis://localhost:6379")).toEqual({
      host: "localhost",
      port: 6379,
      username: undefined,
      password: undefined,
    });
  });

  it("port belirtilmemişse varsayılan 6379 kullanır", () => {
    expect(parseRedisConnection("redis://localhost").port).toBe(6379);
  });

  it("kullanıcı adı ve parolayı ayrıştırır", () => {
    const result = parseRedisConnection("redis://user:secret@redis-host:6380");
    expect(result).toEqual({
      host: "redis-host",
      port: 6380,
      username: "user",
      password: "secret",
    });
  });
});
