import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OrganizationGuard } from './guards/organization.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return {
          secret,
          signOptions: {
            expiresIn: 900, // 15 minutes in seconds
          },
        };
      },
      inject: [ConfigService],
    }),
    // Import schemas needed for guards and auth service
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    OrganizationGuard,
    CsrfGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    OrganizationGuard,
    CsrfGuard,
    JwtModule,
  ],
})
export class AuthModule {}