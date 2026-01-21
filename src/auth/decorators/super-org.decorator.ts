import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SUPER_ORG_KEY = 'requireSuperOrg';

/**
 * Decorator to require super org admin access
 * Equivalent to your validateSuperOrgAdmin middleware
 * Usage: @RequireSuperOrg()
 */
export const RequireSuperOrg = () => SetMetadata(REQUIRE_SUPER_ORG_KEY, true);
