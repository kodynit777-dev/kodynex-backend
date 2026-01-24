import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  // 🔹 Test 0: Root
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🔹 Test 1: أبسط Endpoint ممكن
  @Get('ping')
  ping() {
    return {
      ok: true,
      service: 'kodynex-backend',
    };
  }

  // 🔹 Test 2: Health
  @Get('health')
  health() {
    return { status: 'OK' };
  }

  // 🔹 Test 3: DB Health
  @Get('db-health')
  async dbHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { database: 'OK' };
  }
}
