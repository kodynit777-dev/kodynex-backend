import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';            // ← مهم
import { JwtStrategy } from './strategies/jwt.strategy'; // ← مهم

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_jwt_secret',
      signOptions: { expiresIn: '7d' }, // مدة التوكن
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // ← إضافة JwtStrategy
  exports: [AuthService],
})
export class AuthModule {}
