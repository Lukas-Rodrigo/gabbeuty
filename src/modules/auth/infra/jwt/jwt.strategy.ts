import { Env } from '@/env';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod';

const tokenSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
});

export type TokenSchema = z.infer<typeof tokenSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService<Env, true>) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: TokenSchema) {
    try {
      // Validate token payload structure
      const validatedPayload = tokenSchema.parse(payload);

      this.logger.log(
        `Token validated successfully for user: ${validatedPayload.sub}`,
      );

      return validatedPayload;
    } catch {
      // If token payload is malformed or invalid, throw UnauthorizedException
      this.logger.warn('Invalid token payload structure');

      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
