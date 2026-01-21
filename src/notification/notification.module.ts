// src/notification/notification.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GatewayModule } from '../gateway/gateway.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Test, TestSchema } from '../schemas/test.schema';
import { AttemptRequest, AttemptRequestSchema } from '../schemas/attempt-request.schema';
import {
  StudentTestOverride,
  StudentTestOverrideSchema,
} from '../schemas/student-test-override.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Test.name, schema: TestSchema },
      { name: AttemptRequest.name, schema: AttemptRequestSchema },
      { name: StudentTestOverride.name, schema: StudentTestOverrideSchema },
    ]),
    forwardRef(() => GatewayModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}