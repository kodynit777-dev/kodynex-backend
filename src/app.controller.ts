import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // مسار صحة بسيط
  @Get('health')
  health() {
    // تقدر ترجع نص أو JSON
    return 'OK';
    // أو:
    // return { status: 'ok' };
  }
}

