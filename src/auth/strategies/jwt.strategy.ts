import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Custom extractor that checks cookies first, then Authorization header
// Matches your current verifyToken middleware behavior
const cookieOrBearerExtractor = (req: Request): string | null => {
  // Primary: Check for access token in cookies (most secure)
  if ((req as any).cookies && (req as any).cookies.accessToken) {
    return (req as any).cookies.accessToken;
  }

  // Fallback: Check Authorization header for API clients
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // The payload is already verified by passport-jwt
    // Return it to be attached to request.user
    if (!payload.userId || !payload.organizationId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.userId,
      loginId: payload.loginId,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}