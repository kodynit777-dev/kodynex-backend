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
  // Register باستخدام الجوال
  // =============================
  async register(data: any) {
    if (!data.phoneE164 || !data.password || !data.name) {
      throw new BadRequestException('Missing required fields');
    }

    // منع تكرار الجوال
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneE164: data.phoneE164 },
    });

    if (existingUser) {
      throw new BadRequestException('Phone already in use');
    }

    // تشفير الباسورد
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
  // Login باستخدام الجوال
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

    const payload = {
      id: user.id,
      phoneE164: user.phoneE164,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password: _, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }
}
