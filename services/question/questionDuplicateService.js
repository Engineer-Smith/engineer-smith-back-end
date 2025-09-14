// /services/question/questionDuplicateService.js - Duplicate detection service
const Question = require('../../models/Question');
const createError = require('http-errors');

class QuestionDuplicateService {
  async findSimilarQuestions(searchParams, user) {
    const { title, description, type, language, category, entryFunction, codeTemplate } = searchParams;

    // STAGE 1: Fast regex-based database pre-filter
    const potentialMatches = await this._findPotentialMatches(searchParams, user);

    if (potentialMatches.length === 0) {
      return [];
    }

    // STAGE 2: Smart similarity scoring and ranking
    const scoredResults = this._scoreAndRankResults(
      { title, description, entryFunction, codeTemplate },
      potentialMatches,
      type
    );

    // Get type-specific similarity threshold
    const threshold = this._getSimilarityThreshold(type);

    // Filter by threshold and sort by similarity
    return scoredResults
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Limit final results
  }

  // STAGE 1: Fast regex-based database query
  async _findPotentialMatches(searchParams, user) {
    const { title, description, type, language, category, entryFunction } = searchParams;

    // Build base query for accessible questions only
    const baseQuery = {
      ...this._buildAccessQuery(user),
      type,
      language
    };

    // Add category for code questions
    if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(type) && category) {
      baseQuery.category = category;
    }

    // Build regex conditions based on available search terms
    const regexConditions = [];

    if (title?.trim()) {
      regexConditions.push({ title: { $regex: this._escapeRegex(title), $options: 'i' } });
    }

    if (description?.trim()) {
      regexConditions.push({ description: { $regex: this._escapeRegex(description), $options: 'i' } });
    }

    // For code questions, also match on function name
    if (entryFunction && ['codeChallenge', 'codeDebugging'].includes(type)) {
      regexConditions.push({ 'codeConfig.entryFunction': entryFunction });
    }

    // Need at least one condition to search
    if (regexConditions.length === 0) {
      return [];
    }

    // Execute fast regex-based query
    return await Question.find({
      ...baseQuery,
      $or: regexConditions
    })
      .select('title description type language category difficulty organizationId isGlobal createdBy createdAt codeConfig.entryFunction codeTemplate correctAnswer options')
      .limit(50) // Cast wider net for stage 1
      .lean();
  }

  // STAGE 2: Smart similarity scoring
  _scoreAndRankResults(searchInput, potentialMatches, questionType) {
    return potentialMatches.map(result => {
      // Calculate base similarity score
      const similarity = this._calculateSimilarityScore(searchInput, result, questionType);

      // Determine if this is an exact regex match
      const exactMatch = this._isExactMatch(searchInput, result);

      // Determine match reason for user feedback
      const matchReason = this._getMatchReason(similarity, questionType, searchInput, result, exactMatch);

      return {
        ...result,
        similarity: Math.round(similarity),
        exactMatch,
        source: result.isGlobal ? 'Global' : 'Your Organization',
        matchReason
      };
    });
  }

  // Build query for questions user has access to
  _buildAccessQuery(user) {
    return {
      $or: [
        { isGlobal: true },                    // Global questions (super org created)
        {
          organizationId: user.organizationId, // User's org questions
          isGlobal: false
        }
      ]
    };
  }

  // Get similarity threshold based on question type
  _getSimilarityThreshold(type) {
    const thresholds = {
      'trueFalse': 60,        // Strict - T/F questions are simple
      'multipleChoice': 70,   // Moderate - options can vary
      'fillInTheBlank': 75,   // Moderate - template-based
      'codeChallenge': 85,    // Lenient - many ways to solve same problem
      'codeDebugging': 85     // Lenient - different bugs, same concept
    };

    return thresholds[type] || 70;
  }

  // Build type-specific search query
  _buildSearchQuery({ title, description, type, language, category, entryFunction, codeTemplate, accessQuery }) {
    const baseQuery = {
      ...accessQuery,
      type,
      language
    };

    // Add category for code questions
    if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(type)) {
      if (category) {
        baseQuery.category = category;
      }
    }

    // Type-specific search logic
    switch (type) {
      case 'trueFalse':
        // Very strict matching for T/F questions
        return {
          ...baseQuery,
          $or: [
            { title: { $regex: this._escapeRegex(title), $options: 'i' } },
            { description: { $regex: this._escapeRegex(description), $options: 'i' } }
          ]
        };

      case 'multipleChoice':
        // Match on title and description
        return {
          ...baseQuery,
          $or: [
            { title: { $regex: this._escapeRegex(title), $options: 'i' } },
            { description: { $regex: this._escapeRegex(description), $options: 'i' } }
          ]
        };

      case 'fillInTheBlank':
        // Match on description and potentially code template structure
        return {
          ...baseQuery,
          $or: [
            { title: { $regex: this._escapeRegex(title), $options: 'i' } },
            { description: { $regex: this._escapeRegex(description), $options: 'i' } }
          ]
        };

      case 'codeChallenge':
      case 'codeDebugging':
        // For code questions, check entry function name + description
        const codeQuery = {
          ...baseQuery,
          $or: [
            { title: { $regex: this._escapeRegex(title), $options: 'i' } },
            { description: { $regex: this._escapeRegex(description), $options: 'i' } }
          ]
        };

        // If entry function provided, add it as additional filter
        if (entryFunction) {
          codeQuery['codeConfig.entryFunction'] = entryFunction;
        }

        return codeQuery;

      default:
        return {
          ...baseQuery,
          $or: [
            { title: { $regex: this._escapeRegex(title), $options: 'i' } },
            { description: { $regex: this._escapeRegex(description), $options: 'i' } }
          ]
        };
    }
  }

  // Calculate comprehensive similarity score
  _calculateSimilarityScore(searchInput, result, questionType) {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Title similarity (weight: 30)
    if (searchInput.title && result.title) {
      const titleScore = this._fuzzyMatch(searchInput.title, result.title);
      totalScore += titleScore * 0.3;
      maxPossibleScore += 30;
    }

    // Description similarity (weight: 50)
    if (searchInput.description && result.description) {
      const descScore = this._fuzzyMatch(searchInput.description, result.description);
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
        // Could add code template similarity in the future
        if (searchInput.codeTemplate && result.codeTemplate) {
          bonusScore = this._compareCodeTemplates(searchInput.codeTemplate, result.codeTemplate) * 0.2;
        }
        break;

      case 'trueFalse':
      case 'multipleChoice':
        // For these simple types, content is everything
        // No additional bonus needed
        break;
    }

    totalScore += bonusScore;
    maxPossibleScore += 20;

    // Normalize to 0-100 scale
    return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  }

  // Check if this is considered an "exact" match via regex
  _isExactMatch(searchInput, result) {
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

  // Determine why this question was matched (for user feedback)
  _getMatchReason(similarity, questionType, searchInput, result, exactMatch) {
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

  // Simple code template comparison (for future enhancement)
  _compareCodeTemplates(template1, template2) {
    if (!template1 || !template2) return 0;

    // Normalize whitespace and compare structure
    const normalize = (code) => code.replace(/\s+/g, ' ').trim().toLowerCase();
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

  // Simple fuzzy matching algorithm
  _fuzzyMatch(str1, str2) {
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
    const words1 = s1.split(/\s+/).filter(w => w.length > 2);
    const words2 = s2.split(/\s+/).filter(w => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const commonWords = words1.filter(word =>
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );

    const overlapRatio = (commonWords.length * 2) / (words1.length + words2.length);
    return Math.round(overlapRatio * 100);
  }

  // Escape special regex characters
  _escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Quick validation of search parameters
  validateSearchParams(searchParams) {
    const { title, description, type, language } = searchParams;

    if (!title?.trim() && !description?.trim()) {
      throw createError(400, 'Either title or description is required');
    }

    if (!type) {
      throw createError(400, 'Question type is required');
    }

    if (!language) {
      throw createError(400, 'Language is required');
    }

    const validTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
    if (!validTypes.includes(type)) {
      throw createError(400, 'Invalid question type');
    }

    const validLanguages = [
      'javascript', 'css', 'html', 'sql', 'dart', 'react',
      'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'
    ];
    if (!validLanguages.includes(language)) {
      throw createError(400, 'Invalid language');
    }
  }
}

module.exports = new QuestionDuplicateService();