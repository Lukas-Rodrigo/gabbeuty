import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenSchema } from './jwt.strategy';

export interface CurrentUserPayload {
  sub: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user as TokenSchema;
  },
);
