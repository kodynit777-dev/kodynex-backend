import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  // إنشاء مطعم جديد
  async create(ownerId: string, dto: CreateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        ownerId,
      },
    });

    // تنظيف البيانات
    return {
      id: restaurant.id,
      name: restaurant.name,
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
      description: restaurant.description,
      logo: restaurant.logo,
      createdAt: restaurant.createdAt,
    };
  }
}
