// src/gateway/guards/ws-jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException('Authentication token required');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach user data to socket
      (client as any).userId = payload.userId;
      (client as any).organizationId = payload.organizationId;
      (client as any).role = payload.role;

      return true;
    } catch (error) {
      this.logger.warn(`WebSocket authentication failed: ${error.message}`);
      throw new WsException('Authentication failed');
    }
  }

  private extractTokenFromSocket(socket: Socket): string | null {
    // Try auth object first
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }

    // Try cookie
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const match = cookies.match(/accessToken=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    // Try query params
    if (socket.handshake.query?.token) {
      return socket.handshake.query.token as string;
    }

    return null;
  }
}