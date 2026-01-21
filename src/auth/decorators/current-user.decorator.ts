import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../interfaces/jwt-payload.interface';

/**
 * Decorator to extract the current user from the request
 * Usage: @CurrentUser() user: RequestUser
 * Or for specific properties: @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return just that
    if (data) {
      return user[data];
    }

    return user;
  },
);
