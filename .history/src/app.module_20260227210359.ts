import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

// ⭐ Public (Catalog / Public APIs)
import { PublicModule } from './public/public.module';
import { PrismaModule } from './prisma/prisma.module';

import { APP_GUARD } from '@nestjs/core';
import { TenantGuard } from './auth/guards/tenant.guard';

@Module({
  imports: [
    // 🌍 Global config (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,

    // ✅ Project modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    ProductsModule,
    OrdersModule,

    // 🌐 Public APIs (no auth)
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
