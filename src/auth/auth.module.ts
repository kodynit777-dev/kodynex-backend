import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],      // ← أهم سطر: إضافة PrismaModule
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
