import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 جلب المستخدم بالـ ID (بدون password)
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.cleanUser(user);
  }

  // 🔹 جلب المستخدم بالإيميل (نرجع الباسورد لأجل Login)
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // لا نرمي خطأ هنا — لأن Login يعتمد على النتيجة
    return user;
  }

  // 🔹 تنظيف بيانات المستخدم (إزالة password فقط)
  cleanUser(user: any) {
    if (!user) return null;
    const { password, ...cleaned } = user;
    return cleaned;
  }
}
