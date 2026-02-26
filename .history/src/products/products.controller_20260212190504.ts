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

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('restaurants/:id/products')
  async createProduct(
    @Param('id') restaurantId: string,
    @Req() req,
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.productsService.create(
      restaurantId,
      req.user.id,
      dto,
    );

    return {
      status: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  @Get('restaurants/:id/products')
  async listProducts(@Param('id') restaurantId: string) {
    const products = await this.productsService.list(restaurantId);

    return {
      status: true,
      message: 'Products list loaded',
      data: products,
    };
  }

  @Get('products/:id')
  async findOneProduct(@Param('id') productId: string) {
    const product = await this.productsService.findOne(productId);

    return {
      status: true,
      message: 'Product details loaded',
      data: product,
    };
  }
}
