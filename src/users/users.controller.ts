
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {

  @Get('ready')
  ready() {
    return 'OK';
  }

}
