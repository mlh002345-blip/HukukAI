import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { parseApiEnv, type ApiEnv } from "@hukukai/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { SearchModule } from "./modules/search/search.module";
import { FoldersModule } from "./modules/folders/folders.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { DocumentAnalysisModule } from "./modules/document-analysis/document-analysis.module";
import { RulesModule } from "./modules/rules/rules.module";
import { DeadlinesModule } from "./modules/deadlines/deadlines.module";
import { CalculationsModule } from "./modules/calculations/calculations.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { BillingModule } from "./modules/billing/billing.module";
import { AdminModule } from "./modules/admin/admin.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { SentryExceptionsFilter } from "./common/filters/sentry-exceptions.filter";
import { parseRedisConnection } from "./queue/redis-connection";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => parseApiEnv(env),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<ApiEnv, true>) => ({
        connection: parseRedisConnection(
          configService.get("REDIS_URL", { infer: true }),
        ),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ToolsModule,
    SearchModule,
    FoldersModule,
    DocumentsModule,
    DocumentAnalysisModule,
    RulesModule,
    DeadlinesModule,
    CalculationsModule,
    ReportsModule,
    BillingModule,
    AdminModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: SentryExceptionsFilter },
  ],
})
export class AppModule {}
