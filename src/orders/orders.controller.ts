import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // إنشاء طلب
  @Post()
  async createOrder(
    @GetUser('id') userId: string,
    @Body()
    body: {
      restaurantId: string;
      items: { productId: string; quantity: number }[];
    },
  ) {
    const order = await this.ordersService.createOrder(
      userId,
      body.restaurantId,
      body.items,
    );

    return {
      status: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: order,
    };
  }

  // عرض طلبات المستخدم
  @Get('my')
  async myOrders(@GetUser('id') userId: string) {
    const orders = await this.ordersService.myOrders(userId);

    return {
      status: true,
      message: '',
      data: orders,
    };
  }

  // عرض طلبات مطعم لصاحب المطعم
  @Get('/restaurant/:id')
  async restaurantOrders(
    @GetUser('id') ownerId: string,
    @Param('id') restaurantId: string,
  ) {
    const orders = await this.ordersService.restaurantOrders(ownerId, restaurantId);

    return {
      status: true,
      message: '',
      data: orders,
    };
  }
}
