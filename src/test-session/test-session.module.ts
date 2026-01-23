// src/test-session/test-session.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSessionController } from './test-session.controller';
import { TestSessionService } from './test-session.service';
import { SessionManagerService } from './services/session-manager.service';
import { QuestionHandlerService } from './services/question-handler.service';
import { SnapshotService } from './services/snapshot.service';
import { TimerService } from './services/timer.service';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { TestSession, TestSessionSchema } from '../schemas/test-session.schema';
import { Test, TestSchema } from '../schemas/test.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';
import { GradingModule } from '../grading/grading.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestSession.name, schema: TestSessionSchema },
      { name: Test.name, schema: TestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    GradingModule,
  ],
  controllers: [TestSessionController],
  providers: [
    TestSessionService,
    SessionManagerService,
    QuestionHandlerService,
    SnapshotService,
    TimerService,
    OrganizationGuard,
  ],
  exports: [
    TestSessionService,
    SessionManagerService,
    QuestionHandlerService,
    SnapshotService,
    TimerService,
  ],
})
export class TestSessionModule {}