import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('ready')
  ready() {
    return {
      status: true,
      message: 'Auth module is ready',
      data: null,
    };
  }

  // =============================
  // Register (Phone-based)
  // =============================
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    return {
      status: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: user,
    };
  }

  // =============================
  // Login (Phone-based)
  // =============================
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.phoneE164, dto.password);

    return {
      status: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result,
    };
  }

  // =============================
  // Get current user
  // =============================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return {
      status: true,
      message: 'تم جلب بيانات المستخدم',
      data: req.user,
    };
  }
}
