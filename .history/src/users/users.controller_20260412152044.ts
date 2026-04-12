// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Header,
} from '@nestjs/common';
import type { User as PrismaUser } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

type SafeUser = Omit<PrismaUser, 'password'>;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ready')
  ready(): string {
    return 'OK';
  }

  // GET /users/me — بيانات المستخدم الحالي (بدون password) + تعطيل الكاش
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Header('Cache-Control', 'no-store, private, max-age=0, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @Header('Vary', 'Authorization, X-Tenant')
  async getMe(@GetUser() user: { id: string }): Promise<SafeUser> {
    const data = await this.usersService.findById(user.id);
    return data as unknown as SafeUser;
  }

  // PATCH /users/me — تحديث البروفايل + تعطيل الكاش
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @Header('Cache-Control', 'no-store, private, max-age=0, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async updateProfile(
    @GetUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    const data = await this.usersService.updateProfile(user.id, dto);
    return data as unknown as SafeUser;
  }
}
