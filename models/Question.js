const { Schema, model } = require('mongoose');
const { VALID_TAGS } = require('../constants/tags'); // Import centralized tags

// Valid language-category combinations
const VALID_COMBINATIONS = {
  'html': ['ui', 'syntax'],
  'css': ['ui', 'syntax'],
  'react': ['ui', 'syntax'],
  'flutter': ['ui', 'syntax'],
  'reactNative': ['ui', 'syntax'],
  'javascript': ['logic', 'syntax'],
  'typescript': ['logic', 'syntax'],
  'python': ['logic', 'syntax'],
  'sql': ['logic', 'syntax'],
  'dart': ['logic', 'syntax'],
  'express': ['logic', 'syntax'],
  'json': ['syntax']
};

// Valid language+category+type combinations
const VALID_TYPE_COMBINATIONS = {
  'html': { 
    'ui': ['multipleChoice', 'trueFalse', 'fillInTheBlank'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'css': { 
    'ui': ['multipleChoice', 'trueFalse', 'fillInTheBlank'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'react': { 
    'ui': ['multipleChoice', 'trueFalse', 'fillInTheBlank'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'flutter': { 
    'ui': ['multipleChoice', 'trueFalse', 'fillInTheBlank'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'reactNative': { 
    'ui': ['multipleChoice', 'trueFalse', 'fillInTheBlank'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'javascript': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'typescript': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'python': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'sql': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'dart': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'express': { 
    'logic': ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'], 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  },
  'json': { 
    'syntax': ['multipleChoice', 'trueFalse', 'fillInTheBlank'] 
  }
};

const questionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'],
    required: true,
    validate: {
      validator: function (questionType) {
        // Skip validation if language or category is missing
        if (!this.language || !this.category) {
          return true;
        }
        
        // Handle different validation contexts (create vs update)
        let language = this.language;
        let category = this.category;
        
        // For update operations, 'this' might not have all fields
        if (!language || !category) {
          if (this.getUpdate && typeof this.getUpdate === 'function') {
            const update = this.getUpdate();
            language = language || update.language || update.$set?.language;
            category = category || update.category || update.$set?.category;
          }
          
          if (this.get && typeof this.get === 'function') {
            language = language || this.get('language');
            category = category || this.get('category');
          }
          
          // If we still can't determine language/category, skip validation
          if (!language || !category) {
            return true;
          }
        }
        
        const validTypes = VALID_TYPE_COMBINATIONS[language]?.[category] || [];
        return validTypes.includes(questionType);
      },
      message: function(props) {
        let language = this.language;
        let category = this.category;
        
        // Handle update operations for error message
        if (!language || !category) {
          if (this.getUpdate && typeof this.getUpdate === 'function') {
            const update = this.getUpdate();
            language = language || update.language || update.$set?.language;
            category = category || update.category || update.$set?.category;
          }
          
          if (this.get && typeof this.get === 'function') {
            language = language || this.get('language');
            category = category || this.get('category');
          }
        }
        
        const validTypes = VALID_TYPE_COMBINATIONS[language]?.[category] || [];
        return `'${props.value}' is not valid for ${language} ${category} questions. Valid types: ${validTypes.join(', ')}`;
      }
    }
  },
  language: {
    type: String,
    enum: ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'],
    required: true,
  },
  category: {
    type: String,
    enum: ['logic', 'ui', 'syntax'],
    required: function () {
      return ['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(this.type);
    },
    validate: {
      validator: function (category) {
        if (!category) return true;
        
        // Handle different validation contexts (create vs update)
        let language = this.language;
        
        // For update operations, 'this' might not have all fields
        if (!language) {
          // Try to get language from the update operation
          if (this.getUpdate && typeof this.getUpdate === 'function') {
            const update = this.getUpdate();
            language = update.language || update.$set?.language;
          }
          
          // If still no language, try to get from the document being updated
          if (!language && this.get && typeof this.get === 'function') {
            language = this.get('language');
          }
          
          // If we still can't determine language, skip validation
          // (it will be caught by other validators)
          if (!language) {
            return true;
          }
        }
        
        const validCategories = VALID_COMBINATIONS[language] || [];
        return validCategories.includes(category);
      },
      message: function(props) {
        // Get language for error message
        let language = this.language;
        if (!language && this.getUpdate && typeof this.getUpdate === 'function') {
          const update = this.getUpdate();
          language = update.language || update.$set?.language;
        }
        if (!language && this.get && typeof this.get === 'function') {
          language = this.get('language');
        }
        
        return `'${props.value}' is not a valid category for ${language || 'the selected'} language`;
      }
    }
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },

  // Multiple Choice / True False fields
  options: {
    type: [String],
    default: undefined,
    required: function () {
      return this.type === 'multipleChoice' || this.type === 'trueFalse';
    },
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    default: undefined,
    required: function () {
      return this.type === 'multipleChoice' || this.type === 'trueFalse';
    },
  },

  // Code execution config for LOGIC codeChallenge and codeDebugging questions only
  codeConfig: {
    runtime: {
      type: String,
      enum: ['node', 'python', 'sql', 'dart'],
      required: function () {
        return (this.type === 'codeChallenge' || this.type === 'codeDebugging') && this.category === 'logic';
      }
    },
    entryFunction: {
      type: String,
      required: function () {
        // SQL doesn't need entryFunction
        return (this.type === 'codeChallenge' || this.type === 'codeDebugging') &&
          this.category === 'logic' &&
          this.language !== 'sql';
      }
    },
    timeoutMs: { type: Number, default: 3000 },
    allowPreview: { type: Boolean, default: true }
  },

  // Test cases for LOGIC codeChallenge and codeDebugging questions only
  testCases: {
    type: [{
      name: { type: String, default: 'Test case' },
      args: [Schema.Types.Mixed],
      expected: Schema.Types.Mixed,
      hidden: { type: Boolean, default: false }
    }],
    default: undefined,
    required: function () {
      return (this.type === 'codeChallenge' || this.type === 'codeDebugging') && this.category === 'logic';
    },
  },

  // Template for fill-in-the-blank questions (ALL categories: logic, ui, syntax)
  codeTemplate: {
    type: String,
    required: function () {
      return this.type === 'fillInTheBlank';
    }
  },

  // Blanks configuration for fill-in-the-blank (ALL categories)
  blanks: {
    type: [{
      id: { type: String, required: true },
      correctAnswers: { type: [String], required: true },
      caseSensitive: { type: Boolean, default: true },
      hint: String,
      points: { type: Number, default: 1 }
    }],
    default: undefined,
    required: function () {
      return this.type === 'fillInTheBlank';
    }
  },

  // Buggy code for debugging questions
  buggyCode: {
    type: String,
    required: function () {
      return this.type === 'codeDebugging';
    }
  },

  // Solution code only for codeDebugging questions
  solutionCode: {
    type: String,
    required: function () {
      return this.type === 'codeDebugging';
    }
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: {
    type: [String],
    enum: VALID_TAGS,
    default: [],
  },
  usageStats: {
    timesUsed: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
questionSchema.index({ organizationId: 1 });
questionSchema.index({ isGlobal: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ language: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ language: 1, category: 1 });
questionSchema.index({ type: 1, category: 1 });
questionSchema.index({ language: 1, category: 1, type: 1 }); // New composite index

// Pre-save hook
questionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Auto-set runtime based on language for logic questions
  if ((this.type === 'codeChallenge' || this.type === 'codeDebugging') &&
    this.category === 'logic' &&
    !this.codeConfig?.runtime) {
    const runtimeMap = {
      'javascript': 'node',
      'typescript': 'node',
      'react': 'node',
      'reactNative': 'node',
      'express': 'node',
      'python': 'python',
      'sql': 'sql',
      'dart': 'dart'
    };

    if (this.codeConfig) {
      this.codeConfig.runtime = runtimeMap[this.language] || 'node';
    }
  }

  next();
});

// Additional pre-validation hook for update operations
questionSchema.pre('findOneAndUpdate', function(next) {
  // Add updatedAt for update operations
  this.set({ updatedAt: Date.now() });
  next();
});

// Virtual for getting valid categories based on language
questionSchema.virtual('validCategories').get(function () {
  return VALID_COMBINATIONS[this.language] || [];
});

// Virtual for getting valid question types based on language and category
questionSchema.virtual('validQuestionTypes').get(function () {
  if (!this.language || !this.category) return [];
  return VALID_TYPE_COMBINATIONS[this.language]?.[this.category] || [];
});

// Static method to get valid combinations
questionSchema.statics.getValidCombinations = function () {
  return VALID_COMBINATIONS;
};

// Static method to get valid type combinations
questionSchema.statics.getValidTypeCombinations = function () {
  return VALID_TYPE_COMBINATIONS;
};

// Instance method to validate language-category combination
questionSchema.methods.isValidCombination = function () {
  const validCategories = VALID_COMBINATIONS[this.language] || [];
  return !this.category || validCategories.includes(this.category);
};

// Instance method to validate language-category-type combination
questionSchema.methods.isValidTypeForLanguageCategory = function () {
  if (!this.language || !this.category) return true;
  const validTypes = VALID_TYPE_COMBINATIONS[this.language]?.[this.category] || [];
  return validTypes.includes(this.type);
};

module.exports = model('Question', questionSchema);