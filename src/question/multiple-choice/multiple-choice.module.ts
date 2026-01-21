// src/question/multiple-choice/multiple-choice.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MultipleChoiceService } from './multiple-choice.service';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { QuestionModule } from '../question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    forwardRef(() => QuestionModule), // For QuestionFormatterService
  ],
  providers: [MultipleChoiceService],
  exports: [MultipleChoiceService],
})
export class MultipleChoiceModule {}
