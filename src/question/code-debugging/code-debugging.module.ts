// src/question/code-debugging/code-debugging.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeDebuggingService } from './code-debugging.service';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { QuestionModule } from '../question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    forwardRef(() => QuestionModule),
  ],
  providers: [CodeDebuggingService],
  exports: [CodeDebuggingService],
})
export class CodeDebuggingModule {}
