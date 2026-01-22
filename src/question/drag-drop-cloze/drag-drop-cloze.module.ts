// src/question/drag-drop-cloze/drag-drop-cloze.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DragDropClozeService } from './drag-drop-cloze.service';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { QuestionModule } from '../question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    forwardRef(() => QuestionModule),
  ],
  providers: [DragDropClozeService],
  exports: [DragDropClozeService],
})
export class DragDropClozeModule {}
