import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if CSRF should be skipped for this route
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Skip CSRF for GET, HEAD, OPTIONS requests (matches your middleware)
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF for API clients using Bearer tokens (matches your middleware)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return true;
    }

    // Require CSRF token for cookie-based auth
    const csrfToken =
      (request.headers['x-csrf-token'] as string) || request.body?._csrf;
    const sessionCsrf = request.cookies?.csrfToken;

    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
