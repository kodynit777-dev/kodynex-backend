import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // يمنع أي بيانات زايدة
      forbidNonWhitelisted: true,   // يعطي خطأ لو أرسلوا Keys ممنوعة
      transform: true,              // يحول الأنواع تلقائيًا (string → number)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
