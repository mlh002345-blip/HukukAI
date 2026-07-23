import { Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.findActiveUserOrThrow(userId);
    return this.toPublicProfile(user);
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; phone?: string },
  ) {
    await this.findActiveUserOrThrow(userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
    return this.toPublicProfile(updated);
  }

  /**
   * Hesap silme; KVKK gereği kişisel veriler önce yumuşak silinir,
   * kalıcı silme ayrı bir arka plan işiyle (retention policy'e göre)
   * yapılır (Bölüm 20).
   */
  async softDeleteAccount(userId: string) {
    await this.findActiveUserOrThrow(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  private async findActiveUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }
    return user;
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
