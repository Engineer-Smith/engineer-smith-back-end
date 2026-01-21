import { SetMetadata } from '@nestjs/common';
import { Role } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * Usage: @Roles('admin', 'instructor')
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Convenience decorators for common role combinations
// Matches your validateOrgAdminOrInstructor, validateContentManagement, etc.

/**
 * Requires admin or instructor role
 * Equivalent to your validateOrgAdminOrInstructor / validateContentManagement
 */
export const AdminOrInstructor = () => Roles('admin', 'instructor');

/**
 * Requires admin role only
 * Equivalent to your validateOrgAdminOnly
 */
export const AdminOnly = () => Roles('admin');

/**
 * Allows any authenticated user (admin, instructor, student)
 * Equivalent to your validateContentAccess
 */
export const AnyRole = () => Roles('admin', 'instructor', 'student');
