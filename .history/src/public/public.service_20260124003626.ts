import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogByTenant(tenant: string) {
    /**
     * ⚠️ ملاحظة هندسية:
     * حاليًا لا يوجد slug أو isActive في schema.prisma
     * لذلك نستخدم id كمعرّف مؤقت للتينانت (MVP)
     * لاحقًا نضيف slug رسميًا مع migration
     */

    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: tenant, // 👈 مؤقتًا بدل slug
      },
      include: {
        products: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      products: restaurant.products,
    };
  }
}
