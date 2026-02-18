import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /* ============================
     Get All Tenants (Restaurants)
     ============================ */
  async listTenants() {
    const restaurants = await this.prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return restaurants;
  }

  /* ============================
     Get Catalog By Tenant
     ============================ */
  async getCatalogByTenant(tenant: string) {
    /**
     * مؤقتًا نستخدم id كتحديد للتينانت
     * لاحقًا نضيف slug رسمي
     */

    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: tenant,
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
