import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const tenantKey = request.headers['x-tenant'];

    if (!tenantKey) {
      throw new BadRequestException('Tenant header missing');
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: tenantKey },
    });

    if (!restaurant) {
      throw new NotFoundException('Tenant not found');
    }

    request.tenant = restaurant;
    request.tenantId = restaurant.id;

    return true;
  }
}
