import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogByTenant(tenant: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug: tenant,
        isActive: true,
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
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
        slug: restaurant.slug,
      },
      products: restaurant.products,
    };
  }
}
