import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // =========================================
  // إنشاء منتج داخل المطعم الحالي (Tenant-aware)
  // =========================================
  async create(
    tenantRestaurantId: string,
    userId: string,
    dto: CreateProductDto,
  ) {
    // 1) تحقق أن المطعم موجود ويملكه المستخدم
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: tenantRestaurantId,
        ownerId: userId,
      },
    });

    if (!restaurant) {
      throw new ForbiddenException(
        'You are not allowed to add products to this restaurant',
      );
    }

    // 2) إنشاء المنتج
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        image: dto.image,
        restaurantId: tenantRestaurantId,
      },
    });

    return product;
  }

  // =========================================
  // جلب جميع منتجات المطعم الحالي (Tenant-safe)
  // =========================================
  async list(tenantRestaurantId: string) {
    return this.prisma.product.findMany({
      where: {
        restaurantId: tenantRestaurantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================
  // جلب منتج واحد (مع عزل Tenant)
  // =========================================
  async findOne(productId: string, tenantRestaurantId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        restaurantId: tenantRestaurantId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
