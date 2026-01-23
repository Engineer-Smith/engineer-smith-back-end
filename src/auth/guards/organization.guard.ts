import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { REQUIRE_SUPER_ORG_KEY } from '../decorators/super-org.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // If no user, let JwtAuthGuard handle it (or skip if it already passed for public route)
    if (!user) {
      return true; // Let other guards handle authentication
    }

    if (!user.organizationId) {
      throw new ForbiddenException('No organization assigned');
    }

    // Look up the organization to check if it's super org
    const org = await this.organizationModel.findById(user.organizationId).lean();

    if (org) {
      // Set isSuperOrgAdmin flag - must be admin of the super org
      request.user.isSuperOrgAdmin = org.isSuperOrg && user.role === 'admin';
      
      // Attach organization info to user
      request.user.organization = {
        _id: org._id.toString(),
        name: org.name,
        isSuperOrg: org.isSuperOrg,
      };
    } else {
      request.user.isSuperOrgAdmin = false;
    }

    // Check if route requires super org admin
    const requireSuperOrg = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SUPER_ORG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireSuperOrg && !request.user.isSuperOrgAdmin) {
      throw new ForbiddenException('Requires super org admin access');
    }

    return true;
  }
}