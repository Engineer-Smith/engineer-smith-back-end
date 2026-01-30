import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ValidateInviteDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserDocument } from '../schemas/user.schema';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';

// SSO Token payload interface
interface SSOTokenPayload {
  user_id: string;
  email?: string;
  first_name: string;
  last_name: string;
  username?: string;
  organization_code?: string;
  role?: string;
}

const SALT_ROUNDS = 10;

// Token expiry in seconds
const ACCESS_TOKEN_EXPIRY_SECONDS = 900; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 604800; // 7 days

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly ssoSharedSecret: string;
  private readonly frontendUrl: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
    }

    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
    this.ssoSharedSecret = this.configService.get<string>('SSO_SHARED_SECRET') || '';

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.warn('FRONTEND_URL not set - using localhost default (dev only)');
      this.frontendUrl = 'http://localhost:5173';
    } else {
      this.frontendUrl = frontendUrl;
    }
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const { username, email, password, inviteCode, role, firstName, lastName } = dto;

    let organization: OrganizationDocument | null = null;
    let finalRole = role || 'student';

    // Assign organization based on inviteCode
    if (inviteCode) {
      organization = await this.organizationModel.findOne({ inviteCode });
      if (!organization) {
        throw new NotFoundException('Invalid invite code');
      }
    } else {
      // Default to super org for students
      organization = await this.organizationModel.findOne({ isSuperOrg: true });
      if (!organization) {
        throw new BadRequestException('Default organization not found');
      }
      finalRole = 'student'; // Force student role for no inviteCode
    }

    // Check if username is unique
    const existingByUsername = await this.userModel.findOne({
      loginId: username.toLowerCase(),
    });
    if (existingByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email is unique (if provided)
    if (email) {
      const existingByEmail = await this.userModel.findOne({
        email: email.toLowerCase(),
      });
      if (existingByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = new this.userModel({
      loginId: username.toLowerCase(),
      email: email ? email.toLowerCase() : undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      hashedPassword,
      organizationId: organization._id,
      role: finalRole,
      isSSO: false,
    });

    try {
      await user.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }

    // Generate tokens for auto-login
    const tokens = this.generateTokens(user);

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  /**
   * Login with username or email
   */
  async login(dto: LoginDto) {
    const { loginCredential, password } = dto;

    // Find user by username or email
    const isEmail = /\S+@\S+\.\S+/.test(loginCredential);
    const user = isEmail
      ? await this.userModel.findOne({ email: loginCredential.toLowerCase() })
      : await this.userModel.findOne({ loginId: loginCredential.toLowerCase() });

    if (!user) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    // Check if user uses SSO
    if (user.isSSO) {
      throw new UnauthorizedException('Please use SSO to login');
    }

    // Verify password - check hashedPassword exists
    if (!user.hashedPassword) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      const user = await this.userModel.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('organizationId', 'name inviteCode isSuperOrg')
      .select('-hashedPassword -ssoToken');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserResponse(user, true);
  }

  /**
   * Validate invite code
   */
  async validateInviteCode(dto: ValidateInviteDto) {
    const organization = await this.organizationModel.findOne({
      inviteCode: dto.inviteCode,
    });

    if (!organization) {
      throw new NotFoundException('Invalid invite code');
    }

    return {
      _id: organization._id,
      name: organization.name,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user uses SSO
    if (user.isSSO) {
      throw new BadRequestException(
        'SSO users cannot change password. Please contact your SSO provider.',
      );
    }

    // Check hashedPassword exists
    if (!user.hashedPassword) {
      throw new BadRequestException('Password not set for this user');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.hashedPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash and save new password
    user.hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate socket token
   */
  generateSocketToken(user: JwtPayload): string {
    const payload = {
      userId: user.userId,
      loginId: user.loginId,
      organizationId: user.organizationId,
      role: user.role,
      type: 'socket',
    };
    
    return this.jwtService.sign(payload as any, { expiresIn: 3600 }); // 1 hour
  }

  /**
   * Generate CSRF token
   */
  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: UserDocument) {
    const payload = {
      userId: user._id.toString(),
      loginId: user.loginId,
      organizationId: user.organizationId.toString(),
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload as any);

    const refreshToken = this.jwtService.sign(payload as any, {
      secret: this.jwtRefreshSecret,
      expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
    });

    const csrfToken = this.generateCsrfToken();

    return { accessToken, refreshToken, csrfToken };
  }

  /**
   * Format user response
   */
  private formatUserResponse(user: UserDocument, includeOrg = false) {
    const response: any = {
      _id: user._id,
      loginId: user.loginId,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      organizationId:
        typeof user.organizationId === 'object'
          ? (user.organizationId as any)._id
          : user.organizationId,
      role: user.role,
      isSSO: user.isSSO,
      createdAt: user.createdAt,
    };

    // Include populated organization if available
    if (includeOrg && user.organizationId && typeof user.organizationId === 'object') {
      response.organization = user.organizationId;
    }

    return response;
  }

  // ==========================================
  // SSO AUTHENTICATION
  // ==========================================

  /**
   * Validate SSO token (JWT signed with shared secret)
   */
  private validateSSOToken(token: string): { valid: boolean; user?: SSOTokenPayload } {
    if (!this.ssoSharedSecret) {
      this.logger.error('SSO_SHARED_SECRET not configured');
      return { valid: false };
    }

    try {
      const decoded = jwt.verify(token, this.ssoSharedSecret) as any;

      return {
        valid: true,
        user: {
          user_id: decoded.user_id,
          email: decoded.email,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
          username: decoded.username,
          organization_code: decoded.organization_code,
          role: decoded.role,
        },
      };
    } catch (error) {
      this.logger.error(`SSO JWT validation failed: ${error.message}`);
      return { valid: false };
    }
  }

  /**
   * Determine organization for SSO user
   */
  private async determineUserOrganization(
    userData: SSOTokenPayload,
  ): Promise<OrganizationDocument | null> {
    // If organization_code provided, use that
    if (userData.organization_code) {
      const org = await this.organizationModel.findOne({
        inviteCode: userData.organization_code,
      });
      if (org) return org;
    }

    // Fall back to super org
    return this.organizationModel.findOne({ isSuperOrg: true });
  }

  /**
   * Generate unique loginId for SSO user
   */
  private async generateUniqueLoginId(
    email?: string,
    username?: string,
    firstName?: string,
    lastName?: string,
  ): Promise<string> {
    let loginId: string;

    if (email && email.trim()) {
      loginId = email.split('@')[0];
    } else if (username) {
      loginId = username;
    } else {
      loginId = `${firstName}${lastName}`.toLowerCase();
    }

    // Clean up loginId
    loginId = loginId.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Ensure unique
    let counter = 1;
    const originalLoginId = loginId;
    while (await this.userModel.findOne({ loginId })) {
      loginId = `${originalLoginId}${counter}`;
      counter++;
    }

    return loginId;
  }

  /**
   * SSO Login - handles token validation and user creation/update
   * Returns redirect URL with auth cookies set
   */
  async ssoLogin(
    token: string,
    redirect?: string,
  ): Promise<{
    success: boolean;
    redirectUrl: string;
    tokens?: { accessToken: string; refreshToken: string; csrfToken: string };
    error?: string;
  }> {
    // Validate token
    if (!token) {
      return {
        success: false,
        redirectUrl: `${this.frontendUrl}/auth/login?error=missing_token`,
        error: 'missing_token',
      };
    }

    const tokenData = this.validateSSOToken(token);

    if (!tokenData.valid || !tokenData.user) {
      return {
        success: false,
        redirectUrl: `${this.frontendUrl}/auth/login?error=invalid_token`,
        error: 'invalid_token',
      };
    }

    const userData = tokenData.user;

    // Validate required fields
    if (
      !userData.user_id ||
      !userData.first_name ||
      !userData.last_name ||
      (!userData.email && !userData.username)
    ) {
      return {
        success: false,
        redirectUrl: `${this.frontendUrl}/auth/login?error=incomplete_user_data`,
        error: 'incomplete_user_data',
      };
    }

    try {
      // Check if user already exists - by ssoId first, then by email
      let searchQuery: any = { ssoId: userData.user_id };
      if (userData.email && userData.email.trim()) {
        searchQuery = {
          $or: [{ ssoId: userData.user_id }, { email: userData.email.toLowerCase() }],
        };
      }

      let user = await this.userModel.findOne(searchQuery);
      let isNewUser = false;

      if (user) {
        // Update existing user
        user.ssoId = userData.user_id;
        if (userData.email && userData.email.trim()) {
          user.email = userData.email.toLowerCase();
        }
        user.firstName = userData.first_name.trim();
        user.lastName = userData.last_name.trim();
        user.isSSO = true;

        // Update organization if provided and different
        if (userData.organization_code) {
          const newOrg = await this.organizationModel.findOne({
            inviteCode: userData.organization_code,
          });
          if (newOrg && newOrg._id.toString() !== user.organizationId.toString()) {
            user.organizationId = newOrg._id as any;
          }
        }

        await user.save();
        this.logger.log(`SSO user updated: ${user.loginId}`);
      } else {
        // Create new user
        isNewUser = true;

        const organization = await this.determineUserOrganization(userData);
        if (!organization) {
          return {
            success: false,
            redirectUrl: `${this.frontendUrl}/auth/login?error=no_organization`,
            error: 'no_organization',
          };
        }

        const loginId = await this.generateUniqueLoginId(
          userData.email,
          userData.username,
          userData.first_name,
          userData.last_name,
        );

        // Determine role
        let userRole: 'admin' | 'instructor' | 'student' = 'student';
        if (
          userData.role &&
          ['admin', 'instructor', 'student'].includes(userData.role)
        ) {
          userRole = userData.role as 'admin' | 'instructor' | 'student';
        }

        const userObj: any = {
          loginId,
          firstName: userData.first_name.trim(),
          lastName: userData.last_name.trim(),
          ssoId: userData.user_id,
          organizationId: organization._id,
          role: userRole,
          isSSO: true,
        };

        if (userData.email && userData.email.trim()) {
          userObj.email = userData.email.toLowerCase();
        }

        user = new this.userModel(userObj);
        await user.save();
        this.logger.log(`SSO user created: ${user.loginId}`);
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Build redirect URL (with open redirect protection)
      let redirectUrl: string;
      if (redirect && this.isValidRedirectPath(redirect)) {
        redirectUrl = `${this.frontendUrl}${redirect}`;
      } else {
        redirectUrl = `${this.frontendUrl}/dashboard${isNewUser ? '?welcome=true' : ''}`;
      }

      return {
        success: true,
        redirectUrl,
        tokens,
      };
    } catch (error) {
      this.logger.error(`SSO Login Error: ${error.message}`);
      return {
        success: false,
        redirectUrl: `${this.frontendUrl}/auth/login?error=sso_failed`,
        error: 'sso_failed',
      };
    }
  }

  /**
   * Validate redirect path to prevent open redirect attacks
   * Only allows relative paths starting with / but not //
   */
  private isValidRedirectPath(redirect: string): boolean {
    if (!redirect || typeof redirect !== 'string') {
      return false;
    }

    // Must start with single /
    if (!redirect.startsWith('/')) {
      return false;
    }

    // Block protocol-relative URLs (//evil.com)
    if (redirect.startsWith('//')) {
      return false;
    }

    // Block any URL with protocol (http:, https:, javascript:, etc.)
    if (/^\/.*:/.test(redirect) || redirect.includes('://')) {
      return false;
    }

    // Block encoded characters that could bypass checks
    if (redirect.includes('%2f') || redirect.includes('%2F')) {
      return false;
    }

    return true;
  }
}