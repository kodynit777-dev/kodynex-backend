import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // ← أهم سطر
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ← مفيد مستقبلاً
})
export class UsersModule {}
