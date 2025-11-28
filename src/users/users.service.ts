import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 دالة تجيب المستخدم عن طريق الـ ID
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneE164: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // 🔹 دالة تجيب المستخدم عن طريق الإيميل
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phoneE164: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
