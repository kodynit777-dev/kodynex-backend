import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // إنشاء مطعم — محمي بتوكن + لازم يكون OWNER أو ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  async create(@Req() req, @Body() dto: CreateRestaurantDto) {
    const ownerId = req.user.id; // من التوكن

    return {
      status: true,
      message: 'تم إنشاء المطعم بنجاح',
      data: await this.restaurantsService.create(ownerId, dto),
    };
  }

  // عرض كل المطاعم
  @Get()
  async findAll() {
    return {
      status: true,
      message: 'قائمة المطاعم',
      data: await this.restaurantsService.findAll(),
    };
  }

  // عرض مطعم واحد حسب ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      status: true,
      message: 'تفاصيل المطعم',
      data: await this.restaurantsService.findOne(id),
    };
  }
}
