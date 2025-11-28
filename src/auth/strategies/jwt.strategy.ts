import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
    });
  }

  async validate(payload: any) {
    // payload.sub = user.id (من يوم 3 في Login)
    const user = await this.usersService.findById(payload.sub);

    // إذا مالقينا المستخدم — نرجع null أو نخلي Nest يرفض الطلب
    if (!user) return null;

    // UsersService أصلاً يرجع بيانات بدون password
    return user;
  }
}
