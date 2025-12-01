import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  getAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.restaurantsService.create(body);
  }
}
