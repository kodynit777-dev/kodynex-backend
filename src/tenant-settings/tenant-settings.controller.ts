import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantSettingsService } from './tenant-settings.service';

/**
 * نوسّع Request عشان نضيف tenant
 */
interface TenantRequest extends Request {
  tenant: {
    id: string;
    slug: string;
  };
}

@Controller('tenant/settings')
@UseGuards(TenantGuard)
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Get()
  async getSettings(@Req() req: TenantRequest) {
    return this.tenantSettingsService.getByTenant(req.tenant.id);
  }
}
