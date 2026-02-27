import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';

@UseGuards(TenantGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 🏪 إنشاء منتج (Owner/Admin فقط)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  async createProduct(
    @Req() req,
    @GetUser('id') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.productsService.create(
      req.tenantId, // 👈 من TenantGuard فقط
      userId,
      dto,
    );

    return {
      status: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  // 📦 قائمة منتجات المطعم الحالي (عزل SaaS)
  @Get()
  async listProducts(@Req() req) {
    const products = await this.productsService.list(req.tenantId);

    return {
      status: true,
      message: 'Products list loaded',
      data: products,
    };
  }

  // 🔎 تفاصيل منتج (معزولة حسب Tenant)
  @Get(':id')
  async findOneProduct(@Param('id') productId: string, @Req() req) {
    const product = await this.productsService.findOne(
      productId,
      req.tenantId, // 👈 يمنع cross-tenant leak
    );

    return {
      status: true,
      message: 'Product details loaded',
      data: product,
    };
  }
}
