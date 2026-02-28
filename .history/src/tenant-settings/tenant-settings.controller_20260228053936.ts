import { TenantGuard } from '../auth/guards/tenant.guard';
@Controller('tenant/settings')
@UseGuards(TenantGuard)
export class TenantSettingsController {
  @Get()
  getSettings(@Req() req) {
    return this.tenantSettingsService.getByTenant(req.tenant.id);
  }
}
