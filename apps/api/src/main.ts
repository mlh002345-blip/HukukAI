import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { ApiEnv } from "@hukukai/config";
import { API_PREFIX } from "@hukukai/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  const configService = app.get(ConfigService<ApiEnv, true>);

  app.setGlobalPrefix(API_PREFIX.replace(/^\//, ""));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const corsOrigins = configService.get("CORS_ORIGINS", { infer: true });
  app.enableCors({
    origin: corsOrigins === "*" ? true : corsOrigins.split(","),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("HukukAI API")
    .setDescription(
      "AI destekli hukuki/mali profesyonel asistan — REST API dokümantasyonu",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swaggerDocument);

  const port = configService.get("PORT", { infer: true });
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`HukukAI API http://localhost:${port}${API_PREFIX} adresinde çalışıyor`);
  // eslint-disable-next-line no-console
  console.log(`Swagger dokümantasyonu: http://localhost:${port}/docs`);
}

bootstrap();
