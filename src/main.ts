import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log("🚀 Starting Kodynex Backend...");

  const app = await NestFactory.create(AppModule);

  // ⭐ CORS من env
  app.enableCors({
    origin: [
      process.env.EXPO_URL,
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  });

  // ⭐ Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`✅ Kodynex Backend is running on port ${port}`);
  console.log("📡 Logs will now appear in ECS & CloudWatch");
}

bootstrap();
