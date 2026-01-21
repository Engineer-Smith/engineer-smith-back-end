// src/gateway/gateway.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppGateway } from './gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { TestSessionModule } from '../test-session/test-session.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => TestSessionModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [AppGateway, WsJwtGuard],
  exports: [AppGateway],
})
export class GatewayModule {}