// src/question/true-false/true-false.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrueFalseService } from './true-false.service';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { QuestionModule } from '../question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    forwardRef(() => QuestionModule),
  ],
  providers: [TrueFalseService],
  exports: [TrueFalseService],
})
export class TrueFalseModule {}
