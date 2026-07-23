import { describe, expect, it, vi } from "vitest";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";

function createContext(user: { role: string } | undefined): ExecutionContext {
  return {
    getHandler: () => vi.fn(),
    getClass: () => vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  it("gerekli rol yoksa erişime izin verir", () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new RolesGuard(reflector as never);

    expect(guard.canActivate(createContext({ role: "CITIZEN" }))).toBe(true);
  });

  it("kullanıcının rolü gerekli listede ise izin verir", () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(["ADMIN"]) };
    const guard = new RolesGuard(reflector as never);

    expect(guard.canActivate(createContext({ role: "ADMIN" }))).toBe(true);
  });

  it("kullanıcının rolü gerekli listede değilse ForbiddenException fırlatır", () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(["ADMIN"]) };
    const guard = new RolesGuard(reflector as never);

    expect(() => guard.canActivate(createContext({ role: "CITIZEN" }))).toThrow(
      ForbiddenException,
    );
  });
});
