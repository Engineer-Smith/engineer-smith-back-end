// Matches your current JWT payload structure from authController.js
export interface JwtPayload {
  userId: string;
  loginId: string;
  organizationId: string;
  role: 'admin' | 'instructor' | 'student';
  iat?: number;
  exp?: number;
}

// Extended user object after middleware enrichment
export interface RequestUser extends JwtPayload {
  isSuperOrgAdmin?: boolean;
  organization?: {
    _id: string;
    name: string;
    isSuperOrg: boolean;
  };
}
