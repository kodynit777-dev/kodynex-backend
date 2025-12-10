import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log("🚀 Starting Kodynex Backend...");

  const app = await NestFactory.create(AppModule);

  // ⭐ CORS النهائي — يدعم localhost + env
  app.enableCors({
    origin: [
      'http://localhost:19006',   // Expo local
      'http://localhost:3000',    // Web local
      'http://127.0.0.1:3000',
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

  // ⭐ ECS/Fargate requires listening on 0.0.0.0
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Kodynex Backend is running on port ${port}`);
  console.log("📡 Listening on 0.0.0.0 (AWS Fargate compatible)");
  console.log("📡 Logs are visible in ECS & CloudWatch");
}

bootstrap();
