import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * GET /api/public/tenants
   */
  @Get('tenants')
  async listTenants() {
    return this.publicService.listTenants();
  }

  /**
   * GET /api/public/:tenant/catalog
   */
  @Get(':tenant/catalog')
  async getCatalog(@Param('tenant') tenant: string) {
    return this.publicService.getCatalogByTenant(tenant);
  }
}
