import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =============================
  // Register (مؤقت - لا نستخدمه لاحقًا)
  // =============================
  async register(data: any) {
    if (!data.phoneE164 || !data.password || !data.name) {
      throw new BadRequestException('Missing required fields');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phoneE164: data.phoneE164 },
    });

    if (existingUser) {
      throw new BadRequestException('Phone already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        phoneE164: data.phoneE164,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  // =============================
  // OLD Password Login (نتركه مؤقتًا)
  // =============================
  async login(phoneE164: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneE164 },
    });

    if (!user) {
      throw new BadRequestException('Phone not found');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateToken(user);
  }

  // =============================
  // Send OTP (DEV MODE)
  // =============================
  async sendOtp(phoneE164: string) {
    if (!phoneE164) {
      throw new BadRequestException('Phone is required');
    }

    // في المستقبل هنا نرسل SMS حقيقي
    // حاليًا Dev Mode فقط
    return {
      phoneE164,
      devOtp: '111111', // يظهر فقط في dev
    };
  }

  // =============================
  // Verify OTP
  // =============================
  async verifyOtp(phoneE164: string, otp: string) {
    if (!phoneE164 || !otp) {
      throw new BadRequestException('Missing phone or otp');
    }

    // Dev Mode OTP
    const DEV_OTP = '111111';

    if (otp !== DEV_OTP) {
      throw new BadRequestException('Invalid OTP');
    }

    let user = await this.prisma.user.findUnique({
      where: { phoneE164 },
    });

    // لو المستخدم غير موجود → ننشئه تلقائيًا
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneE164,
          name: 'New User',
          role: 'CUSTOMER',
        },
      });
    }

    return this.generateToken(user);
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

    const { password, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }
}
