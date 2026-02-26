import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';

import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // =====================================================
  // 🏗 إنشاء مطعم (Owner أو Admin فقط)
  // =====================================================
  @Roles('OWNER', 'ADMIN')
  @Post()
  async create(@Req() req, @Body() dto: CreateRestaurantDto) {
    const ownerId = req.user.id;

    const restaurant = await this.restaurantsService.create(ownerId, dto);

    return {
      status: true,
      message: 'تم إنشاء المطعم بنجاح',
      data: restaurant,
    };
  }

  // =====================================================
  // 🏢 عرض جميع المطاعم (Admin فقط — Platform Layer)
  // =====================================================
  @Roles('ADMIN')
  @Get()
  async findAll() {
    const restaurants = await this.restaurantsService.findAll();

    return {
      status: true,
      message: 'قائمة المطاعم',
      data: restaurants,
    };
  }

  // =====================================================
  // 🔎 عرض مطعم واحد (Admin فقط)
  // =====================================================
  @Roles('ADMIN')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findOne(id);

    return {
      status: true,
      message: 'تفاصيل المطعم',
      data: restaurant,
    };
  }
}
