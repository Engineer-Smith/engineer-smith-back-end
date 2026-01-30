import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ValidateInviteDto,
  ChangePasswordDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { RequestUser } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * POST /auth/register - Public route
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);

    return {
      success: true,
      user: result.user,
      csrfToken: result.csrfToken,
    };
  }

  /**
   * POST /auth/login - Public route
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);

    return {
      success: true,
      user: result.user,
      csrfToken: result.csrfToken,
    };
  }

  /**
   * POST /auth/refresh-token - Public route
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh token from cookie or body
    const refreshToken = (req as any).cookies?.refreshToken || dto.refreshToken;

    if (!refreshToken) {
      this.clearAuthCookies(res);
      throw new BadRequestException('Refresh token required');
    }

    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken, tokens.csrfToken);

      return {
        success: true,
        csrfToken: tokens.csrfToken,
      };
    } catch (error) {
      this.clearAuthCookies(res);
      throw error;
    }
  }

  /**
   * POST /auth/validate-invite - Public route
   */
  @Public()
  @Post('validate-invite')
  @HttpCode(HttpStatus.OK)
  async validateInvite(@Body() dto: ValidateInviteDto) {
    const organization = await this.authService.validateInviteCode(dto);

    return {
      success: true,
      organization,
    };
  }

  /**
   * GET /auth/sso/login - Simple SSO login endpoint
   * External sites link to this directly with a signed JWT token
   * Example: /auth/sso/login?token=xxx&redirect=/dashboard
   */
  @Public()
  @Get('sso/login')
  async ssoLogin(
    @Query('token') token: string,
    @Query('redirect') redirect: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.ssoLogin(token, redirect);

    if (result.success && result.tokens) {
      // Set auth cookies
      this.setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
        result.tokens.csrfToken,
      );
    }

    // Redirect to appropriate URL
    return res.redirect(result.redirectUrl);
  }

  /**
   * POST /auth/logout - Protected route with CSRF
   */
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * GET /auth/me - Protected route
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: RequestUser) {
    const fullUser = await this.authService.getCurrentUser(user.userId);

    return {
      success: true,
      user: fullUser,
    };
  }

  /**
   * GET /auth/socket-token - Protected route
   */
  @UseGuards(JwtAuthGuard)
  @Get('socket-token')
  async getSocketToken(@CurrentUser() user: RequestUser) {
    const socketToken = this.authService.generateSocketToken(user);

    return {
      success: true,
      socketToken,
    };
  }

  /**
   * POST /auth/change-password - Protected route with CSRF
   */
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(user.userId, dto);

    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * GET /auth/status - Protected route (health check for auth)
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAuthStatus(@CurrentUser() user: RequestUser) {
    return {
      success: true,
      authenticated: true,
      user: {
        _id: user.userId,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Helper: Set auth cookies
   */
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    csrfToken: string,
  ) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const cookieSettings: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieSettings,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieSettings,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', csrfToken, {
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Helper: Clear auth cookies
   */
  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');
  }
}