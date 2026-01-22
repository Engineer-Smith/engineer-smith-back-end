// src/question/question.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './question.controller';
import { QuestionService } from './services/question.service';
import { QuestionValidationService } from './services/question-validation.service';
import { QuestionFormatterService } from './services/question-formatter.service';
import { QuestionTestingService } from './services/question-testing.service';
import { QuestionDuplicateService } from './services/question-duplicate.service';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { GradingModule } from '../grading/grading.module';

// Import sub-modules
import { MultipleChoiceModule } from './multiple-choice';
import { TrueFalseModule } from './true-false';
import { FillInBlankModule } from './fill-in-blank';
import { DragDropClozeModule } from './drag-drop-cloze';
import { CodeChallengeModule } from './code-challenge';
import { CodeDebuggingModule } from './code-debugging';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    GradingModule,
    // Import sub-modules with forwardRef to handle circular dependency
    forwardRef(() => MultipleChoiceModule),
    forwardRef(() => TrueFalseModule),
    forwardRef(() => FillInBlankModule),
    forwardRef(() => DragDropClozeModule),
    forwardRef(() => CodeChallengeModule),
    forwardRef(() => CodeDebuggingModule),
  ],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    QuestionValidationService,
    QuestionFormatterService,
    QuestionTestingService,
    QuestionDuplicateService,
  ],
  exports: [
    QuestionService,
    QuestionFormatterService,
    QuestionDuplicateService,
    // Re-export sub-modules (their services become available to importers)
    MultipleChoiceModule,
    TrueFalseModule,
    FillInBlankModule,
    DragDropClozeModule,
    CodeChallengeModule,
    CodeDebuggingModule,
  ],
})
export class QuestionModule {}
