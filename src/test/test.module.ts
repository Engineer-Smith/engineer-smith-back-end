// src/test/test.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestController } from './test.controller';
import { TestService } from './services/test.service';
import { TestValidationService } from './services/test-validation.service';
import { TestFormatterService } from './services/test-formatter.service';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Test, TestSchema } from '../schemas/test.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [TestController],
  providers: [TestService, TestValidationService, TestFormatterService, OrganizationGuard],
  exports: [TestService, TestFormatterService],
})
export class TestModule {}