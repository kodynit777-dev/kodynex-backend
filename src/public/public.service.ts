import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogByTenant(tenant: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: tenant, // مؤقتًا نستخدم id
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

    // ✅ نرجّع الشكل اللي الواجهة تتوقعه
    return {
      data: {
        restaurant: {
          id: restaurant.id,
          name: {
            ar: restaurant.name,
            en: restaurant.name,
          },
        },

        categories: [
          {
            key: 'general',
            name: {
              ar: 'القائمة',
              en: 'Menu',
            },
          },
        ],

        products: restaurant.products.map(product => ({
          id: product.id,
          name: {
            ar: product.name,
            en: product.name,
          },
          description: {
            ar: product.description ?? '',
            en: product.description ?? '',
          },
          price: product.price,
          image: product.image,
          categoryKey: 'general',
        })),
      },
    };
  }
}
