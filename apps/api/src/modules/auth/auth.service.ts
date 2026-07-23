import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { createHash, randomUUID } from "node:crypto";
import type { ApiEnv } from "@hukukai/config";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from "@hukukai/validation";
import type { PrismaService } from "../../prisma/prisma.service";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ApiEnv, true>,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException("Bu e-posta adresi zaten kayıtlı.");
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        acceptedTermsVersion: input.acceptedTermsVersion,
        acceptedKvkkVersion: input.acceptedKvkkVersion,
      },
    });

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { user: this.toPublicProfile(user), ...tokens };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException("E-posta veya parola hatalı.");
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException("E-posta veya parola hatalı.");
    }

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { user: this.toPublicProfile(user), ...tokens };
  }

  /**
   * Refresh token rotation + reuse detection.
   * Bir refresh token yalnızca bir kez kullanılabilir; ikinci kullanım
   * denemesi, tokenin sızdırıldığını gösterebileceğinden kullanıcının
   * tüm oturumları iptal edilir (Bölüm 20 — Güvenlik ve KVKK).
   */
  async refresh(input: RefreshTokenInput) {
    const tokenHash = hashToken(input.refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException("Geçersiz oturum.");
    }

    if (stored.revokedAt || stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        "Oturum süresi doldu veya yeniden kullanım tespit edildi. Lütfen tekrar giriş yapın.",
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokenPair(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );
    return { user: this.toPublicProfile(stored.user), ...tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      {
        secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
        expiresIn: this.configService.get("JWT_ACCESS_TTL", { infer: true }),
      },
    );

    const refreshToken = randomUUID() + randomUUID();
    const refreshTtl = this.configService.get("JWT_REFRESH_TTL", {
      infer: true,
    });
    const expiresAt = new Date(
      Date.now() + parseTtlToMs(refreshTtl ?? "30d"),
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private toPublicProfile(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    subscriptionPlan: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

function parseTtlToMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    unit as "s" | "m" | "h" | "d"
  ];
  return value * unitMs;
}
