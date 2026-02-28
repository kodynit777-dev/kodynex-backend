import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantSettingsService } from './tenant-settings.service';

@Controller('tenant/settings')
@UseGuards(TenantGuard)
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Get()
  getSettings(@Req() req) {
    return this.tenantSettingsService.getByTenant(req.tenant.id);
  }
}
