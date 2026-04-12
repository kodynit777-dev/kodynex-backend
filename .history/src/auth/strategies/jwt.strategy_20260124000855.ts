import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
    });
  }

  async validate(payload: any) {
    /**
     * التوكن عندك يحتوي:
     * {
     *   id: string,
     *   email: string,
     *   iat: number,
     *   exp: number
     * }
     */

    const user = await this.usersService.findById(payload.id);

    // إذا المستخدم غير موجود → Unauthorized
    if (!user) {
      return null;
    }

    // يرجع المستخدم كامل (بدون password)
    return user;
  }
}
