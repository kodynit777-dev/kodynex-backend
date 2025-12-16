import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    // 1) التحقق من البيانات الأساسية
    if (!data.email || !data.password || !data.name || !data.phone) {
      throw new BadRequestException('Missing required fields');
    }

    // 2) منع تكرار الإيميل
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 3) تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 4) إنشاء المستخدم داخل قاعدة البيانات
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phoneE164: data.phone,
        password: hashedPassword,
      },
    });

    // 5) تنظيف الرد بدون كلمة المرور
    const { password, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    // 1) البحث عن المستخدم
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // 2) مقارنة الباسورد
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('Invalid password');
    }

    // 3) تجهيز payload للتوكن
    const payload = {
      id: user.id,
      email: user.email,
    };

    // 4) إصدار التوكن
    const accessToken = await this.jwtService.signAsync(payload);

    // 5) تنظيف الرد بدون كلمة المرور
    const { password: _, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }
}
