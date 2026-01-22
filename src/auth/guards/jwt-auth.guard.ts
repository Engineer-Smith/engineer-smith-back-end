import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, isObservable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public routes, still try to authenticate to populate request.user
      // but don't fail if authentication fails
      try {
        const result = super.canActivate(context);
        if (isObservable(result)) {
          await firstValueFrom(result);
        } else {
          await result;
        }
      } catch {
        // Ignore auth errors on public routes - user will be null
      }
      return true;
    }

    const result = super.canActivate(context);
    if (isObservable(result)) {
      return firstValueFrom(result);
    }
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Check if route is public (allow unauthenticated access)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user || null;
    }

    if (err || !user) {
      // Match your current error message
      throw err || new UnauthorizedException('Authentication token required');
    }

    return user;
  }
}
