// src/tags/tags.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { CodeChallenge, CodeChallengeSchema } from '../schemas/code-challenge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: CodeChallenge.name, schema: CodeChallengeSchema },
    ]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
