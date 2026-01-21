// src/question/services/question-duplicate.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

interface SearchParams {
  title?: string;
  description?: string;
  type?: string;
  language?: string;
  category?: string;
  entryFunction?: string;
  codeTemplate?: string;
}

interface DuplicateResult {
  _id: string;
  title: string;
  description: string;
  type: string;
  language: string;
  category?: string;
  difficulty: string;
  organizationId: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: Date;
  similarity: number;
  exactMatch: boolean;
  source: string;
  matchReason: string;
}

@Injectable()
export class QuestionDuplicateService {
  // Similarity thresholds by question type
  private readonly thresholds: Record<string, number> = {
    trueFalse: 60,
    multipleChoice: 70,
    fillInTheBlank: 75,
    codeChallenge: 85,
    codeDebugging: 85,
  };

  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  /**
   * Find similar questions based on search parameters
   */
  async findSimilarQuestions(
    searchParams: SearchParams,
    user: RequestUser,
  ): Promise<{
    found: boolean;
    count: number;
    duplicates: DuplicateResult[];
    searchParams: Partial<SearchParams>;
  }> {
    const { title, description, type, language, category, entryFunction, codeTemplate } = searchParams;

    // Validate required parameters
    this.validateSearchParams(searchParams);

    // STAGE 1: Fast regex-based database pre-filter
    const potentialMatches = await this.findPotentialMatches(searchParams, user);

    if (potentialMatches.length === 0) {
      return {
        found: false,
        count: 0,
        duplicates: [],
        searchParams: { type, language, category },
      };
    }

    // STAGE 2: Smart similarity scoring and ranking
    const scoredResults = this.scoreAndRankResults(
      { title, description, entryFunction, codeTemplate },
      potentialMatches,
      type!,
    );

    // Get type-specific similarity threshold
    const threshold = this.getSimilarityThreshold(type!);

    // Filter by threshold and sort by similarity
    const duplicates = scoredResults
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return {
      found: duplicates.length > 0,
      count: duplicates.length,
      duplicates,
      searchParams: { type, language, category },
    };
  }

  /**
   * Validate search parameters
   */
  private validateSearchParams(searchParams: SearchParams): void {
    const { title, description, type, language } = searchParams;

    if (!title?.trim() && !description?.trim()) {
      throw new BadRequestException('Either title or description is required');
    }

    if (!type) {
      throw new BadRequestException('Question type is required');
    }

    if (!language) {
      throw new BadRequestException('Language is required');
    }

    const validTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid question type');
    }

    const validLanguages = [
      'javascript', 'css', 'html', 'sql', 'dart', 'react',
      'reactNative', 'flutter', 'express', 'python', 'typescript', 'json',
    ];
    if (!validLanguages.includes(language)) {
      throw new BadRequestException('Invalid language');
    }
  }

  /**
   * STAGE 1: Fast regex-based database query
   */
  private async findPotentialMatches(
    searchParams: SearchParams,
    user: RequestUser,
  ): Promise<any[]> {
    const { title, description, type, language, category, entryFunction } = searchParams;

    // Build base query for accessible questions only
    const baseQuery: any = {
      ...this.buildAccessQuery(user),
      type,
      language,
    };

    // Add category for code questions
    if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(type!) && category) {
      baseQuery.category = category;
    }

    // Build regex conditions based on available search terms
    const regexConditions: any[] = [];

    if (title?.trim()) {
      regexConditions.push({ title: { $regex: this.escapeRegex(title), $options: 'i' } });
    }

    if (description?.trim()) {
      regexConditions.push({ description: { $regex: this.escapeRegex(description), $options: 'i' } });
    }

    // For code questions, also match on function name
    if (entryFunction && ['codeChallenge', 'codeDebugging'].includes(type!)) {
      regexConditions.push({ 'codeConfig.entryFunction': entryFunction });
    }

    // Need at least one condition to search
    if (regexConditions.length === 0) {
      return [];
    }

    // Execute fast regex-based query
    return await this.questionModel
      .find({
        ...baseQuery,
        $or: regexConditions,
      })
      .select('title description type language category difficulty organizationId isGlobal createdBy createdAt codeConfig.entryFunction codeTemplate correctAnswer options')
      .limit(50)
      .lean();
  }

  /**
   * Build query for questions user has access to
   */
  private buildAccessQuery(user: RequestUser): any {
    return {
      $or: [
        { isGlobal: true },
        {
          organizationId: user.organizationId,
          isGlobal: false,
        },
      ],
    };
  }

  /**
   * Get similarity threshold based on question type
   */
  private getSimilarityThreshold(type: string): number {
    return this.thresholds[type] || 70;
  }

  /**
   * STAGE 2: Smart similarity scoring
   */
  private scoreAndRankResults(
    searchInput: { title?: string; description?: string; entryFunction?: string; codeTemplate?: string },
    potentialMatches: any[],
    questionType: string,
  ): DuplicateResult[] {
    return potentialMatches.map((result) => {
      // Calculate base similarity score
      const similarity = this.calculateSimilarityScore(searchInput, result, questionType);

      // Determine if this is an exact regex match
      const exactMatch = this.isExactMatch(searchInput, result);

      // Determine match reason for user feedback
      const matchReason = this.getMatchReason(similarity, questionType, searchInput, result, exactMatch);

      return {
        _id: result._id.toString(),
        title: result.title,
        description: result.description,
        type: result.type,
        language: result.language,
        category: result.category,
        difficulty: result.difficulty,
        organizationId: result.organizationId?.toString(),
        isGlobal: result.isGlobal,
        createdBy: result.createdBy?.toString(),
        createdAt: result.createdAt,
        similarity: Math.round(similarity),
        exactMatch,
        source: result.isGlobal ? 'Global' : 'Your Organization',
        matchReason,
      };
    });
  }

  /**
   * Calculate comprehensive similarity score
   */
  private calculateSimilarityScore(
    searchInput: { title?: string; description?: string; entryFunction?: string; codeTemplate?: string },
    result: any,
    questionType: string,
  ): number {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Title similarity (weight: 30)
    if (searchInput.title && result.title) {
      const titleScore = this.fuzzyMatch(searchInput.title, result.title);
      totalScore += titleScore * 0.3;
      maxPossibleScore += 30;
    }

    // Description similarity (weight: 50)
    if (searchInput.description && result.description) {
      const descScore = this.fuzzyMatch(searchInput.description, result.description);
      totalScore += descScore * 0.5;
      maxPossibleScore += 50;
    }

    // Type-specific bonus scoring (weight: 20)
    let bonusScore = 0;
    switch (questionType) {
      case 'codeChallenge':
      case 'codeDebugging':
        // Big bonus for exact function name match
        if (searchInput.entryFunction && result.codeConfig?.entryFunction === searchInput.entryFunction) {
          bonusScore = 20;
        }
        break;

      case 'fillInTheBlank':
        // Code template similarity
        if (searchInput.codeTemplate && result.codeTemplate) {
          bonusScore = this.compareCodeTemplates(searchInput.codeTemplate, result.codeTemplate) * 0.2;
        }
        break;

      case 'trueFalse':
      case 'multipleChoice':
        // For these simple types, content is everything
        break;
    }

    totalScore += bonusScore;
    maxPossibleScore += 20;

    // Normalize to 0-100 scale
    return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  }

  /**
   * Check if this is considered an "exact" match
   */
  private isExactMatch(
    searchInput: { title?: string; description?: string; entryFunction?: string },
    result: any,
  ): boolean {
    // Exact title match
    if (searchInput.title && result.title) {
      if (searchInput.title.toLowerCase().trim() === result.title.toLowerCase().trim()) {
        return true;
      }
    }

    // Exact description match
    if (searchInput.description && result.description) {
      if (searchInput.description.toLowerCase().trim() === result.description.toLowerCase().trim()) {
        return true;
      }
    }

    // Exact function name match for code questions
    if (searchInput.entryFunction && result.codeConfig?.entryFunction === searchInput.entryFunction) {
      return true;
    }

    return false;
  }

  /**
   * Determine why this question was matched (for user feedback)
   */
  private getMatchReason(
    similarity: number,
    questionType: string,
    searchInput: { entryFunction?: string },
    result: any,
    exactMatch: boolean,
  ): string {
    if (exactMatch) {
      return 'Exact match found';
    }

    if (similarity >= 90) {
      return 'Nearly identical content';
    }

    if (similarity >= 80) {
      return 'Very similar content';
    }

    if (similarity >= 70) {
      return 'Similar title or description';
    }

    // Type-specific reasons
    if (['codeChallenge', 'codeDebugging'].includes(questionType)) {
      if (searchInput.entryFunction === result.codeConfig?.entryFunction) {
        return 'Same function name';
      }
    }

    if (similarity >= 60) {
      return 'Potentially related';
    }

    return 'Regex keyword match';
  }

  /**
   * Simple code template comparison
   */
  private compareCodeTemplates(template1: string, template2: string): number {
    if (!template1 || !template2) return 0;

    // Normalize whitespace and compare structure
    const normalize = (code: string) => code.replace(/\s+/g, ' ').trim().toLowerCase();
    const norm1 = normalize(template1);
    const norm2 = normalize(template2);

    if (norm1 === norm2) return 100;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 80;

    // Simple character overlap
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length >= norm2.length ? norm1 : norm2;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter.charAt(i))) matches++;
    }

    return (matches / shorter.length) * 100;
  }

  /**
   * Simple fuzzy matching algorithm
   */
  private fuzzyMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 100;

    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      return 85;
    }

    // Simple word overlap scoring
    const words1 = s1.split(/\s+/).filter((w) => w.length > 2);
    const words2 = s2.split(/\s+/).filter((w) => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const commonWords = words1.filter((word) =>
      words2.some((w2) => w2.includes(word) || word.includes(w2)),
    );

    const overlapRatio = (commonWords.length * 2) / (words1.length + words2.length);
    return Math.round(overlapRatio * 100);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}