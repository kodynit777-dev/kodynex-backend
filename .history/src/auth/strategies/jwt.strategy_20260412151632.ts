// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // لا تستخدم قيمة افتراضية في الإنتاج
      algorithms: ['HS256'], // عدّلها حسب توقيعك (HS256/RS256...)
    });

    // فشل سريع لو السر غير مهيأ (اختياري، مفيد خارج التطوير)
    if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'development') {
      throw new Error('JWT_SECRET is not set');
    }
  }

  async validate(payload: any) {
    // دعم id أو sub
    const userId = payload?.id ?? payload?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      // UsersService.findById يعيد مستخدمًا منزوع الـ password أو يرمي NotFound
      const user = await this.usersService.findById(userId);
      return user; // يصبح في req.user
    } catch {
      // وحّد الاستجابة إلى 401 بدل 404
      throw new UnauthorizedException('User not found or token invalid');
    }
  }
}
