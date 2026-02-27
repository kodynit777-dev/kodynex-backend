import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

import { TenantProtected } from '../common/decorators/tenant-protected.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';

import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(TenantGuard, JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 🛒 إنشاء طلب
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

  // 👤 عرض طلبات المستخدم (معزولة حسب المطعم)
  @Get('my')
  async myOrders(@GetUser('id') userId: string, @Req() req) {
    const orders = await this.ordersService.myOrders(userId, req.tenantId);

    return {
      status: true,
      message: '',
      data: orders,
    };
  }

  // 🏪 عرض طلبات المطعم (بدون param id — SaaS صحيح)
  @Get('restaurant')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async restaurantOrders(@GetUser('id') ownerId: string, @Req() req) {
    const orders = await this.ordersService.getRestaurantOrders(
      req.tenantId,
      ownerId,
    );

    return {
      status: true,
      message: '',
      data: orders,
    };
  }

  // 🔄 تغيير حالة الطلب
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async updateStatus(
    @Param('id') orderId: string,
    @GetUser('id') ownerId: string,
    @Req() req,
    @Body() dto: UpdateStatusDto,
  ) {
    const updated = await this.ordersService.updateStatus(
      orderId,
      ownerId,
      req.tenantId,
      dto.status,
    );

    return {
      status: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: updated,
    };
  }
}
