// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Test, TestSchema } from '../schemas/test.schema';
import { TestSession, TestSessionSchema } from '../schemas/test-session.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { AttemptRequest, AttemptRequestSchema } from '../schemas/attempt-request.schema';
import {
  StudentTestOverride,
  StudentTestOverrideSchema,
} from '../schemas/student-test-override.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: TestSession.name, schema: TestSessionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: AttemptRequest.name, schema: AttemptRequestSchema },
      { name: StudentTestOverride.name, schema: StudentTestOverrideSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}