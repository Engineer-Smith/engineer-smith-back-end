// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Test, TestSchema } from '../schemas/test.schema';
import { TestSession, TestSessionSchema } from '../schemas/test-session.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { AttemptRequest, AttemptRequestSchema } from '../schemas/attempt-request.schema';
import {
  StudentTestOverride,
  StudentTestOverrideSchema,
} from '../schemas/student-test-override.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: TestSession.name, schema: TestSessionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: AttemptRequest.name, schema: AttemptRequestSchema },
      { name: StudentTestOverride.name, schema: StudentTestOverrideSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService, OrganizationGuard],
  exports: [StudentService],
})
export class StudentModule {}