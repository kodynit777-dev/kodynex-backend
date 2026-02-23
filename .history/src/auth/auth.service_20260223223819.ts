import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =============================
  // Send OTP
  // =============================
  async sendOtp(phoneE164: string) {
    if (!phoneE164) {
      throw new BadRequestException('Phone is required');
    }

    let user = await this.prisma.user.findUnique({
      where: { phoneE164 },
    });

    // إنشاء مستخدم تلقائي
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneE164,
          role: 'CUSTOMER',
        },
      });
    }

    // DEV OTP فقط
    const otp = '111111';

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expires,
      },
    });

    console.log(`📩 DEV OTP for ${phoneE164}: ${otp}`);

    return {
      expiresAt: expires,
    };
  }

  // =============================
  // Verify OTP
  // =============================
  async verifyOtp(phoneE164: string, otp: string) {
    if (!phoneE164 || !otp) {
      throw new BadRequestException('Missing phone or otp');
    }

    const user = await this.prisma.user.findUnique({
      where: { phoneE164 },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('OTP not requested');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    // تفعيل الجوال + حذف OTP
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        phoneVerifiedAt: new Date(),
      },
    });

    return this.generateToken(user);
  }

  // =============================
  // Complete Profile
  // =============================
  async completeProfile(userId: string, name: string, email?: string) {
    if (!name || name.trim().length < 2) {
      throw new BadRequestException('Name is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
      },
    });

    const { password, otpCode, otpExpiresAt, ...safeUser } = updatedUser;

    return safeUser;
  }

  // =============================
  // Generate JWT
  // =============================
  private async generateToken(user: any) {
    const payload = {
      id: user.id,
      phoneE164: user.phoneE164,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, otpCode, otpExpiresAt, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }

  // =============================
  // Disable password login
  // =============================
  async login() {
    throw new BadRequestException('Password login disabled. Use OTP.');
  }
}
