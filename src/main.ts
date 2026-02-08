import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('🚀 Starting Kodynex Backend...');

  const app = await NestFactory.create(AppModule);

  /**
   * 🌐 Global API Prefix
   * كل المسارات تبدأ بـ /api
   * مثال: /api/auth/login
   *        /api/public/demo/catalog
   */
  app.setGlobalPrefix('api');

  /**
   * 🌍 CORS Configuration
   * يدعم Expo + Web + Domains مستقبلية
   */
  app.enableCors({
  origin: true, // مؤقتًا: اسمح لكل الدومينات
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});


  /**
   * 🛡️ Global Validation
   * حماية + تحويل تلقائي للـ DTOs
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * 🚢 ECS / Fargate compatibility
   * لازم يسمع على 0.0.0.0
   */
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Kodynex Backend is running on port ${port}`);
  console.log('📡 Listening on 0.0.0.0 (AWS ALB compatible)');
  console.log('📡 Logs available in ECS & CloudWatch');
}

bootstrap();
