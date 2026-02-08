@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // ✅ لازم أول
  @Get('tenants')
  async listTenants() {
    return this.publicService.listTenants();
  }

  // ✅ بعده
  @Get(':tenant/catalog')
  async getCatalog(@Param('tenant') tenant: string) {
    return this.publicService.getCatalogByTenant(tenant);
  }
}
