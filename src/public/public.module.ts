import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PublicController],
  providers: [PublicService, PrismaService],
  exports: [PublicService], // 👈 مهم
})
export class PublicModule {
  constructor() {
    console.log('🔥 PublicModule Loaded');
  }
}
