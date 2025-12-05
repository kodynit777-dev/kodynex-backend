import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // =========================================
  // إنشاء منتج داخل مطعم
  // =========================================
  async create(restaurantId: string, userId: string, dto: CreateProductDto) {
    // 1) تأكد أن المطعم موجود
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // 2) تأكد أن المستخدم صاحب المطعم أو Admin
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to add products to this restaurant',
      );
    }

    // 3) إنشاء المنتج
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        image: dto.image,
        restaurantId,
      },
    });

    return product;
  }

  // =========================================
  // جلب جميع منتجات مطعم معيّن
  // =========================================
  async list(restaurantId: string) {
    const products = await this.prisma.product.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  // =========================================
  // جلب منتج واحد
  // =========================================
  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
