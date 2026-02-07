import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import slugify from 'slugify';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  // إنشاء مطعم جديد
  async create(ownerId: string, dto: CreateRestaurantDto) {
    // توليد slug من الاسم
    const baseSlug = slugify(dto.name, {
      lower: true,
      strict: true,
    });

    // منع التكرار
    const count = await this.prisma.restaurant.count({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    });

    const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        slug, // ✅ مهم جدًا
        description: dto.description,
        logo: dto.logo,
        ownerId,
      },
    });

    // تنظيف البيانات
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logo: restaurant.logo,
      createdAt: restaurant.createdAt,
    };
  }

  // عرض كل المطاعم
  async findAll() {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      logo: r.logo,
      createdAt: r.createdAt,
    }));
  }

  // عرض مطعم واحد حسب ID
  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('المطعم غير موجود');
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logo: restaurant.logo,
      createdAt: restaurant.createdAt,
    };
  }
}
