import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('ready')
  ready() {
    return 'OK';
  }

  // تحديث البروفايل
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@GetUser() user, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
