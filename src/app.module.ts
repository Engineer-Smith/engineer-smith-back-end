import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GradingModule } from './grading';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SchemasModule } from './schemas/schemas.module';
import { QuestionModule } from './question';
import { TestModule } from './test/test.module';
import { TestSessionModule } from './test-session/test-session.module';
import { ResultModule } from './result/result.module';
import { UserModule } from './user';
import { StudentModule } from './student';
import { OrganizationModule } from './organization';
import { AdminModule } from './admin';
import { CodeChallengeModule } from './code-challenge';
import { NotificationModule } from './notification';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI environment variable is required');
        }
        return {
          uri,
          // Connection pool settings (matching your current server.js)
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        };
      },
      inject: [ConfigService],
    }),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting (matching your current setup)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Shared schemas (User, Organization, etc.)
    SchemasModule,

    // Feature modules
    AuthModule,
    GradingModule,
    QuestionModule,
    TestModule,
    TestSessionModule,
    ResultModule,
    UserModule,
    StudentModule,
    OrganizationModule,
    AdminModule,
    CodeChallengeModule,
    NotificationModule,
    GatewayModule, // WebSocket gateway for real-time features
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT auth guard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}