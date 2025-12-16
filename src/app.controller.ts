import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return { status: 'OK' };
  }

  @Get('db-health')
  async dbHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { database: 'OK' };
  }
}
