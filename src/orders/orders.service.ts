import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // إنشاء طلب
  async createOrder(
    userId: string,
    restaurantId: string,
    items: { productId: string; quantity: number }[],
  ) {
    // 1) تحقق أن المطعم موجود
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('المطعم غير موجود');
    }

    // 2) تحقق من المنتجات
    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      throw new NotFoundException('أحد المنتجات غير موجود');
    }

    // 3) حساب السعر
    let totalPrice = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`المنتج غير موجود: ${item.productId}`);
      }
      totalPrice += product.price * item.quantity;
    }

    // 4) إنشاء الطلب
    return await this.prisma.order.create({
      data: {
        userId,
        restaurantId,
        totalPrice,
        status: OrderStatus.PENDING,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
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

  // Day 10 — تغيير حالة الطلب
  async updateStatus(orderId: string, ownerId: string, newStatus: OrderStatus) {
    // 1) هل الطلب موجود؟
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // 2) حماية — لازم يكون صاحب المطعم
    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('غير مسموح لك بتغيير حالة الطلب');
    }

    // 3) منع الانتقال الخاطئ بين الحالات
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


    // 4) تحديث
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
}

