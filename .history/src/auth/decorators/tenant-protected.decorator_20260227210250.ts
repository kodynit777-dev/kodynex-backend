import { applyDecorators, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

export function TenantProtected() {
  return applyDecorators(UseGuards(TenantGuard, JwtAuthGuard));
}
