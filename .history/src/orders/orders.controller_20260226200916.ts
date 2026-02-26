import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';

import { Req } from '@nestjs/common';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ===============================
  // إنشاء طلب
  // ===============================
  @Post()
  async createOrder(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrderDto,
    @Req() req,
  ) {
    const order = await this.ordersService.createOrder(
      userId,
      req.tenantId,
      dto.items,
      dto.branchId,
      dto.notes,
    );

    return {
      status: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: order,
    };
  }
  // ===============================
  // عرض طلبات المستخدم
  // ===============================
  @Get('my')
  async myOrders(@GetUser('id') userId: string) {
    const orders = await this.ordersService.myOrders(userId);

    return {
      status: true,
      message: '',
      data: orders,
    };
  }

  // ===============================
  // عرض طلبات مطعم (للصاحب)
  // ===============================
  @Get('restaurant/:id')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async restaurantOrders(@Param('id') restaurantId: string) {
    const orders = await this.ordersService.getRestaurantOrders(restaurantId);

    return {
      status: true,
      message: '',
      data: orders,
    };
  }

  // ===============================
  // تغيير حالة الطلب
  // ===============================
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateStatusDto,
    @GetUser('id') ownerId: string,
  ) {
    const updated = await this.ordersService.updateStatus(
      orderId,
      ownerId,
      dto.status,
    );

    return {
      status: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: updated,
    };
  }
}
