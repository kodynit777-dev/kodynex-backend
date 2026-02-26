import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // إنشاء طلب (نسخة احترافية)
  async createOrder(
    userId: string,
    restaurantId: string,
    items: { productId: string; quantity: number }[],
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('السلة فارغة');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ تحقق أن المطعم موجود
      const restaurant = await tx.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('المطعم غير موجود');
      }

      // 2️⃣ جلب المنتجات والتأكد أنها تتبع نفس المطعم وغير محذوفة
      const productIds = items.map((i) => i.productId);

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          restaurantId,
          deletedAt: null,
        },
      });

      if (products.length !== items.length) {
        throw new BadRequestException('بعض المنتجات غير موجودة');
      }

      // 3️⃣ حساب السعر من DB (مو من الفرونت)
      let totalPrice = 0;

      const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new NotFoundException(`المنتج غير موجود: ${item.productId}`);
        }

        const price = Number(product.price); // Decimal → number
        const subtotal = price * item.quantity;

        totalPrice += subtotal;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price, // snapshot
        };
      });

      // 4️⃣ إنشاء الطلب + العناصر
      const order = await tx.order.create({
        data: {
          userId,
          restaurantId,
          totalPrice,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          restaurant: true,
        },
      });

      return order;
    });
  }

  // عرض طلبات المستخدم
  async myOrders(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        restaurant: true,
      },
    });
  }

  // عرض طلبات مطعم
  async getRestaurantOrders(restaurantId: string) {
    return await this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // تغيير حالة الطلب
  async updateStatus(orderId: string, ownerId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('غير مسموح لك بتغيير حالة الطلب');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING],
      [OrderStatus.PREPARING]: [],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[order.status];

    if (!allowed.includes(newStatus)) {
      throw new ForbiddenException(
        `لا يمكن الانتقال من ${order.status} إلى ${newStatus}`,
      );
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
}
