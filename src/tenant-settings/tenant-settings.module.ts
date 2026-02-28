import { Module } from '@nestjs/common';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsService } from './tenant-settings.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService, PrismaService],
})
export class TenantSettingsModule {}
