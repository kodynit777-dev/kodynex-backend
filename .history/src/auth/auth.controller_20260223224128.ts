import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // =============================
  // Health Check
  // =============================
  @Get('ready')
  ready() {
    return {
      status: true,
      message: 'Auth module is ready',
      data: null,
    };
  }

  // =============================
  // Send OTP
  // =============================
  @Post('send-otp')
  async sendOtp(@Body('phoneE164') phoneE164: string) {
    const result = await this.authService.sendOtp(phoneE164);

    return {
      status: true,
      message: 'تم إرسال رمز التحقق',
      data: result,
    };
  }

  // =============================
  // Verify OTP
  // =============================
  @Post('verify-otp')
  async verifyOtp(
    @Body('phoneE164') phoneE164: string,
    @Body('otp') otp: string,
  ) {
    const result = await this.authService.verifyOtp(phoneE164, otp);

    return {
      status: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result,
    };
  }

  // =============================
  // Complete Profile
  // =============================
  @UseGuards(JwtAuthGuard)
  @Post('complete-profile')
  async completeProfile(
    @Req() req: any,
    @Body('name') name: string,
    @Body('email') email?: string,
  ) {
    const userId = req.user.id;

    const result = await this.authService.completeProfile(userId, name, email);

    return {
      status: true,
      message: 'تم تحديث البيانات بنجاح',
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
