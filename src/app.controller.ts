import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// أضف هذا:
import { PrismaClient } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return 'OK';
  }

  // أضف هذا المسار الجديد:
  @Get('db-health')
  async dbHealth() {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return { db: 'OK' };
  }
}
