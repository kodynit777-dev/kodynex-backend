import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByTenant(tenantId: string) {
    const settings = await this.prisma.tenantSetting.findFirst({
      where: {
        restaurantId: tenantId, // مهم: لازم يكون مطابق لعلاقتك
      },
      select: {
        theme: true,
        flags: true,
      },
    });

    // لو ما فيه إعدادات، نرجع قيمة افتراضية عشان ما يطيح الفرونت
    return (
      settings ?? {
        theme: { primary: '#0D4C46' },
        flags: {},
      }
    );
  }
}
