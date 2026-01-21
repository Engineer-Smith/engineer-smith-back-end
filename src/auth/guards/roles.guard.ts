import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

export type Role = 'admin' | 'instructor' | 'student';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required - allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super org admins bypass role checks (matches your checkSuperOrgAdmin logic)
    if (user.isSuperOrgAdmin) {
      return true;
    }

    // Check if user has required role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Requires ${requiredRoles.join(' or ')} role`,
      );
    }

    return true;
  }
}
