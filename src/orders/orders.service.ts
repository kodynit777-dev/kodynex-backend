import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // إنشاء طلب
  async createOrder(
    userId: string,
    restaurantId: string,
    items: { productId: string; quantity: number }[],
  ) {
    // الخطوة 1: تحقق أن المطعم موجود
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('المطعم غير موجود');
    }

    // الخطوة 2: تحقق من المنتجات
    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      throw new NotFoundException('أحد المنتجات غير موجود');
    }

    // الخطوة 3: حساب السعر كامل
    let totalPrice = 0;

    for (const item of items) {
  const product = products.find((p) => p.id === item.productId);

  if (!product) {
    throw new NotFoundException(`المنتج غير موجود: ${item.productId}`);
  }

  totalPrice += product.price * item.quantity;
}


    // الخطوة 4: إنشاء الطلب
    const order = await this.prisma.order.create({
      data: {
        userId,
        restaurantId,
        totalPrice,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return order;
  }

  // عرض طلبات المستخدم
  async myOrders(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, restaurant: true },
    });
  }

  // عرض طلبات مطعم لصاحب المطعم
  async restaurantOrders(ownerId: string, restaurantId: string) {
    // تحقق أن المطعم يخص هذا المالك
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('المطعم غير موجود');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('لا تملك صلاحية لعرض طلبات هذا المطعم');
    }

    // رجّع الطلبات
    return await this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    });
  }
}
