// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { User, UserSchema } from '../schemas/user.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { Test, TestSchema } from '../schemas/test.schema';
import { TestSession, TestSessionSchema } from '../schemas/test-session.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import {
  StudentTestOverride,
  StudentTestOverrideSchema,
} from '../schemas/student-test-override.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Test.name, schema: TestSchema },
      { name: TestSession.name, schema: TestSessionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: StudentTestOverride.name, schema: StudentTestOverrideSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, OrganizationGuard],
  exports: [AdminService],
})
export class AdminModule {}