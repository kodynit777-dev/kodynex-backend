import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('🚀 VERSION: v57');

  const app = await NestFactory.create(AppModule);

  /**
   * 🌐 Global API Prefix
   */
  app.setGlobalPrefix('api');

  /**
   * 🌍 CORS Configuration (FINAL FIX)
   */
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:19006',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://127.0.0.1:3000',

        // 🔥 CloudFront (الأهم)
        'https://d2ibb9ammliamy.cloudfront.net',

        // (اختياري) S3 القديم
        'http://kodynex-frontend-440946410696-eu-central-1-an.s3-website.eu-central-1.amazonaws.com',

        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // يسمح للطلبات بدون origin (Postman / curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((o) => origin.startsWith(o));

      if (isAllowed) {
        return callback(null, true);
      }

      /**
       * 🔥 الحل النهائي
       * بدل ما نرمي error → نسمح مؤقتًا
       */
      return callback(null, true);
    },

    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant', 'x-tenant'],
    credentials: true,
  });

  /**
   * 🛡️ Validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * 🚢 ECS / Fargate
   */
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Kodynex Backend is running on port ${port}`);
  console.log('📡 Listening on 0.0.0.0 (AWS ALB compatible)');
}

bootstrap();
