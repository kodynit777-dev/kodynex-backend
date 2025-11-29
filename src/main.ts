import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log("🚀 Starting Kodynex Backend...");  // Log 1

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`✅ Kodynex Backend is running on port ${port}`); // Log 2
  console.log("📡 Logs will now appear in ECS & CloudWatch"); // Log 3
}

bootstrap();
