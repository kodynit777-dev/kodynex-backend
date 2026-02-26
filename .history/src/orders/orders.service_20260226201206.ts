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

  // 🛒 إنشاء طلب (Tenant-aware)
  async createOrder(
    userId: string,
    tenantRestaurantId: string, // 👈 يأتي من req.tenantId
    items: { productId: string; quantity: number }[],
    branchId?: string,
    notes?: string,
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('السلة فارغة');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ تحقق أن المطعم موجود (عبر Tenant)
      const restaurant = await tx.restaurant.findUnique({
        where: { id: tenantRestaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('المطعم غير موجود');
      }

      // 2️⃣ تحقق المنتجات (لا يسمح بمنتجات من مطعم آخر)
      const productIds = items.map((i) => i.productId);

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          restaurantId: tenantRestaurantId,
          deletedAt: null,
        },
      });

      if (products.length !== items.length) {
        throw new BadRequestException('بعض المنتجات غير موجودة');
      }

      // 3️⃣ تحقق الفرع (إن وجد)
      if (branchId) {
        const branch = await tx.branch.findFirst({
          where: {
            id: branchId,
            restaurantId: tenantRestaurantId,
            deletedAt: null,
            isActive: true,
          },
        });

        if (!branch) {
          throw new ForbiddenException('الفرع غير صالح لهذا المطعم');
        }
      }

      // 4️⃣ حساب السعر من DB
      let totalPrice = 0;

      const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new NotFoundException(`المنتج غير موجود: ${item.productId}`);
        }

        const price = Number(product.price);
        const subtotal = price * item.quantity;

        totalPrice += subtotal;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price, // snapshot
        };
      });

      // 5️⃣ إنشاء الطلب
      const order = await tx.order.create({
        data: {
          userId,
          restaurantId: tenantRestaurantId, // 👈 من Tenant فقط
          branchId,
          notes,
          totalPrice,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          restaurant: true,
        },
      });

      return order;
    });
  }

  // 👤 عرض طلبات المستخدم (معزولة حسب Tenant)
  async myOrders(userId: string, tenantRestaurantId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
        restaurantId: tenantRestaurantId, // 👈 عزل SaaS
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        restaurant: true,
      },
    });
  }

  // 🏪 عرض طلبات المطعم (Owner check عبر DB)
  async getRestaurantOrders(tenantRestaurantId: string, ownerId: string) {
    // تحقق الملكية عبر DB (أقوى أمنيًا)
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: tenantRestaurantId,
        ownerId,
      },
    });

    if (!restaurant) {
      throw new ForbiddenException('غير مصرح');
    }

    return this.prisma.order.findMany({
      where: { restaurantId: tenantRestaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // 🔄 تغيير حالة الطلب (Tenant-aware + Owner check)
  async updateStatus(
    orderId: string,
    ownerId: string,
    tenantRestaurantId: string,
    newStatus: OrderStatus,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: tenantRestaurantId, // 👈 يمنع Cross-tenant
      },
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

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
}
