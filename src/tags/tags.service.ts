// src/tags/tags.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { CodeChallenge, CodeChallengeDocument } from '../schemas/code-challenge.schema';

interface GetTagsOptions {
  languages?: string[];
  type?: string; // 'question' | 'challenge' | undefined (both)
}

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(CodeChallenge.name) private challengeModel: Model<CodeChallengeDocument>,
  ) {}

  async getTags(options: GetTagsOptions = {}): Promise<any> {
    const { languages, type } = options;

    const results: { tags: string[]; topics: string[] } = {
      tags: [],
      topics: [],
    };

    // Get tags from questions
    if (!type || type === 'question') {
      const questionQuery: any = { status: { $ne: 'archived' } };
      if (languages?.length) {
        questionQuery.language = { $in: languages };
      }

      const questionTags = await this.questionModel.distinct('tags', questionQuery);
      results.tags.push(...questionTags.filter(Boolean));
    }

    // Get tags and topics from code challenges
    if (!type || type === 'challenge') {
      const challengeQuery: any = { status: { $ne: 'archived' } };
      if (languages?.length) {
        challengeQuery.supportedLanguages = { $in: languages };
      }

      const [challengeTags, challengeTopics] = await Promise.all([
        this.challengeModel.distinct('tags', challengeQuery),
        this.challengeModel.distinct('topics', challengeQuery),
      ]);

      results.tags.push(...challengeTags.filter(Boolean));
      results.topics.push(...challengeTopics.filter(Boolean));
    }

    // Deduplicate and sort
    const uniqueTags = [...new Set(results.tags)].sort();
    const uniqueTopics = [...new Set(results.topics)].sort();

    return {
      success: true,
      tags: uniqueTags,
      topics: uniqueTopics,
      count: {
        tags: uniqueTags.length,
        topics: uniqueTopics.length,
      },
    };
  }
}
