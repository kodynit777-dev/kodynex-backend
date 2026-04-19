import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus, OptionGroupType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  selectedOptions?: string[];
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: string,
    tenantRestaurantId: string,
    items: CreateOrderItemInput[],
    branchId?: string,
    notes?: string,
    paymentMethod?: string,
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('السلة فارغة');
    }

    return this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.findUnique({
        where: { id: tenantRestaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('المطعم غير موجود');
      }

      const productIds = items.map((item) => item.productId);

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

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

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

      const allSelectedOptionIds = items.flatMap(
        (item) => item.selectedOptions || [],
      );

      const [productOptions, optionGroups] = await Promise.all([
        tx.productOption.findMany({
          where: {
            id: { in: allSelectedOptionIds },
            isActive: true,
            group: {
              productId: { in: productIds },
              isActive: true,
            },
          },
          include: {
            group: true,
          },
        }),
        tx.productOptionGroup.findMany({
          where: {
            productId: { in: productIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            type: true,
            isRequired: true,
            minSelect: true,
            maxSelect: true,
            productId: true,
          },
        }),
      ]);

      const optionsById = new Map(
        productOptions.map((option) => [option.id, option]),
      );
      const optionGroupsByProductId = optionGroups.reduce(
        (groupsMap, group) => {
          const groups = groupsMap.get(group.productId) || [];
          groups.push(group);
          groupsMap.set(group.productId, groups);
          return groupsMap;
        },
        new Map<string, typeof optionGroups>(),
      );

      let totalPrice = new Prisma.Decimal(0);

      const orderItemsData = await Promise.all(
        items.map(async (item) => {
          const product = productsById.get(item.productId);

          if (!product) {
            throw new NotFoundException(`المنتج غير موجود: ${item.productId}`);
          }

          const optionIds = item.selectedOptions || [];

          if (new Set(optionIds).size !== optionIds.length) {
            throw new BadRequestException('لا يمكن تكرار نفس الخيار');
          }

          const options = optionIds.map((optionId) => {
            const option = optionsById.get(optionId);
            if (!option || option.group?.productId !== product.id) {
              throw new BadRequestException('بعض الخيارات غير صالحة');
            }

            return option;
          });

          if (options.length !== optionIds.length) {
            throw new BadRequestException('بعض الخيارات غير صالحة');
          }

          const productOptionGroups =
            optionGroupsByProductId.get(product.id) || [];

          const selectedCountByGroup = options.reduce((counts, option) => {
            const current = counts.get(option.groupId) || 0;
            counts.set(option.groupId, current + 1);
            return counts;
          }, new Map<string, number>());

          for (const group of productOptionGroups) {
            const selectedCount = selectedCountByGroup.get(group.id) || 0;

            if (group.type === OptionGroupType.SINGLE && selectedCount > 1) {
              throw new BadRequestException(
                `لا يمكن اختيار أكثر من خيار من مجموعة ${group.name}`,
              );
            }

            if (group.minSelect !== null && selectedCount < group.minSelect) {
              throw new BadRequestException(
                `الحد الأدنى لمجموعة ${group.name} هو ${group.minSelect}`,
              );
            }

            if (group.maxSelect !== null && selectedCount > group.maxSelect) {
              throw new BadRequestException(
                `الحد الأقصى لمجموعة ${group.name} هو ${group.maxSelect}`,
              );
            }

            if (group.isRequired && selectedCount === 0) {
              throw new BadRequestException(
                `يجب اختيار خيار واحد على الأقل من مجموعة ${group.name}`,
              );
            }
          }

          const optionsPrice = options.reduce(
            (sum, option) => sum.plus(option.priceDelta),
            new Prisma.Decimal(0),
          );

          const basePrice = new Prisma.Decimal(product.price);
          const finalPrice = basePrice.plus(optionsPrice);
          const subtotal = finalPrice.times(item.quantity);

          totalPrice = totalPrice.plus(subtotal);

          return {
            productId: product.id,
            quantity: item.quantity,
            price: finalPrice,
            selections: options.map((option) => ({
              optionId: option.id,
              groupName: option.group.name,
              optionName: option.name,
              priceDelta: option.priceDelta,
            })),
          };
        }),
      );

      const order = await tx.order.create({
        data: {
          userId,
          restaurantId: tenantRestaurantId,
          branchId,
          notes,
          totalPrice,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              selections: {
                create: item.selections,
              },
            })),
          },
          paymentIntent:
            paymentMethod && paymentMethod !== 'cash'
              ? {
                  create: {
                    provider: 'MOYASAR',
                    method: paymentMethod,
                    amount: totalPrice,
                    currency: 'SAR',
                    status: 'PENDING',
                  },
                }
              : undefined,
        },
        include: {
          items: {
            include: {
              product: true,
              selections: true,
            },
          },
          restaurant: true,
        },
      });

      return order;
    });
  }

  async myOrders(userId: string, tenantRestaurantId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
        restaurantId: tenantRestaurantId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
            selections: true,
          },
        },
        restaurant: true,
        paymentIntent: true,
      },
    });
  }

  async getRestaurantOrders(tenantRestaurantId: string, ownerId: string) {
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
        items: {
          include: {
            product: true,
            selections: true,
          },
        },
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateStatus(
    orderId: string,
    ownerId: string,
    tenantRestaurantId: string,
    newStatus: OrderStatus,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: tenantRestaurantId,
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
