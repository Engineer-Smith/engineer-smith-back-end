// src/types/auth.ts - Updated to match User model with firstName/lastName
import type { User, Organization, Role } from './common';

// =====================
// AUTHENTICATION STATE
// =====================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  csrfToken: string | null;
}

export interface AuthContext {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// =====================
// CREDENTIAL TYPES - UPDATED WITH NAME FIELDS
// =====================

export interface LoginCredentials {
  loginCredential: string; // Backend accepts username or email
  password: string;
}

export interface RegisterData {
  username: string; // Backend expects 'username', not 'loginId'
  email?: string;
  firstName: string; // NEW: Required field
  lastName: string; // NEW: Required field
  password: string;
  inviteCode: string;
  role?: Role;
}

export interface SSOData {
  ssoId: string;
  ssoToken: string;
  email?: string;
  username?: string;
  firstName?: string; // NEW: May come from SSO providers
  lastName?: string; // NEW: May come from SSO providers
}

// =====================
// AUTHENTICATION RESULTS - MATCH BACKEND RESPONSES
// =====================

export interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
  csrfToken?: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// =====================
// SESSION MANAGEMENT
// =====================

export interface SessionInfo {
  sessionId: string;
  userId: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RefreshTokenData {
  refreshToken: string;
  expiresAt: string;
}

// =====================
// ORGANIZATION VALIDATION - MATCH BACKEND
// =====================

export interface InviteCodeValidation {
  inviteCode: string;
  isValid: boolean;
  organization?: {
    _id: string; // Backend returns '_id', not 'id'
    name: string;
    isSuperOrg?: boolean; // Optional in some responses
  };
  error?: string;
}

// =====================
// PERMISSION SYSTEM - ALIGN WITH BACKEND MIDDLEWARE
// =====================

export interface Permission {
  resource: string;
  action: string;
  scope: 'own' | 'organization' | 'global';
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// Match backend middleware resource types
export type ResourceType = 
  | 'questions' 
  | 'tests' 
  | 'test-sessions' 
  | 'results' 
  | 'users' 
  | 'organizations' 
  | 'analytics';

export type ActionType = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage' 
  | 'execute' 
  | 'analyze';

// Based on backend middleware permission checks
export interface AccessControl {
  canCreateQuestions: boolean; // validateContentManagement
  canManageUsers: boolean; // validateOrgAdminOnly
  canAccessAnalytics: boolean; // validateOrgAdminOrInstructor
  canCreateGlobalContent: boolean; // isSuperOrgAdmin
  canTakeTests: boolean; // role === 'student'
  canManageOrganization: boolean; // validateOrgAccess
  isSuperOrgAdmin: boolean; // checkSuperOrgAdmin result
}

// =====================
// BACKEND-SPECIFIC USER EXTENSIONS
// =====================

// What backend adds to user object in JWT and responses
export interface AuthenticatedUser extends User {
  // These fields are added by backend auth middleware
  isSuperOrgAdmin?: boolean; // Set by validateSuperOrgAdmin middleware
  organization?: Organization; // Populated in getCurrentUser
}

// =====================
// FORM VALIDATION - UPDATED WITH NAME FIELDS
// =====================

export interface LoginFormData {
  loginCredential: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string; // Match backend expectation
  email?: string;
  firstName: string; // NEW: Required field
  lastName: string; // NEW: Required field
  password: string;
  confirmPassword: string; // Frontend validation only
  inviteCode: string;
  role?: Role;
  agreeToTerms: boolean; // Frontend validation only
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// =====================
// PASSWORD MANAGEMENT - NOT IMPLEMENTED IN BACKEND YET
// =====================

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =====================
// PROFILE MANAGEMENT - UPDATED WITH NAME FIELDS
// =====================

export interface ProfileUpdateData {
  loginId?: string;
  email?: string;
  firstName?: string; // NEW: Can update first name
  lastName?: string; // NEW: Can update last name
}

export interface ProfileValidation {
  loginId?: {
    isValid: boolean;
    isAvailable?: boolean;
    message?: string;
  };
  email?: {
    isValid: boolean;
    isAvailable?: boolean;
    message?: string;
  };
  firstName?: {
    isValid: boolean;
    message?: string;
  };
  lastName?: {
    isValid: boolean;
    message?: string;
  };
}

// =====================
// SSO INTEGRATION - UPDATED WITH NAME FIELDS
// =====================

export interface SSOProvider {
  id: string;
  name: string;
  loginUrl: string;
  enabled: boolean;
}

export interface SSOCallback {
  code: string;
  state: string;
  error?: string;
}

export interface SSOUser {
  ssoId: string;
  username?: string;
  email?: string;
  firstName?: string; // NEW: Name from SSO provider
  lastName?: string; // NEW: Name from SSO provider
  ssoToken: string;
  provider: string;
}

// =====================
// SECURITY & AUDIT - FUTURE IMPLEMENTATION
// =====================

export interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'token_refresh';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// =====================
// AUTH UTILITIES
// =====================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: {
    resource: ResourceType;
    action: ActionType;
  };
  fallback?: React.ComponentType;
  redirectTo?: string;
}

// Helper functions that should align with backend middleware logic
export interface RoleCheck {
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasPermission: (resource: ResourceType, action: ActionType) => boolean;
  isSuperOrgAdmin: () => boolean;
  isOrgAdmin: () => boolean;
  canAccessResource: (resource: ResourceType, resourceOrgId?: string) => boolean;
}

// =====================
// API TOKEN MANAGEMENT - FUTURE FEATURE
// =====================

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  permissions: Permission[];
  expiresAt?: string;
  lastUsed?: string;
  createdAt: string;
}

export interface CreateApiTokenRequest {
  name: string;
  permissions: Permission[];
  expiresAt?: string;
}

export interface ApiTokenResponse {
  success: boolean;
  token: ApiToken;
  message: string;
}

// =====================
// ROLE-BASED PERMISSION MAPPING
// =====================

// Map backend roles to frontend permissions
export const getRolePermissions = (role: Role, isSuperOrg: boolean = false): AccessControl => {
  const basePermissions: AccessControl = {
    canCreateQuestions: false,
    canManageUsers: false,
    canAccessAnalytics: false,
    canCreateGlobalContent: false,
    canTakeTests: false,
    canManageOrganization: false,
    isSuperOrgAdmin: false,
  };

  switch (role) {
    case 'student':
      return {
        ...basePermissions,
        canTakeTests: true,
      };
    
    case 'instructor':
      return {
        ...basePermissions,
        canCreateQuestions: true,
        canAccessAnalytics: true,
        canTakeTests: false,
      };
    
    case 'admin':
      const adminPermissions = {
        ...basePermissions,
        canCreateQuestions: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canManageOrganization: true,
        canTakeTests: false,
      };

      if (isSuperOrg) {
        return {
          ...adminPermissions,
          canCreateGlobalContent: true,
          isSuperOrgAdmin: true,
        };
      }

      return adminPermissions;
    
    default:
      return basePermissions;
  }
};

// Check if user can access specific organization content
export const canAccessOrganizationContent = (
  userOrgId: string,
  contentOrgId: string | null,
  isGlobal: boolean = false,
  isSuperOrgAdmin: boolean = false
): boolean => {
  // Super org admins can access everything
  if (isSuperOrgAdmin) return true;
  
  // Global content is accessible to everyone
  if (isGlobal) return true;
  
  // Content must belong to user's organization
  return contentOrgId === userOrgId;
};