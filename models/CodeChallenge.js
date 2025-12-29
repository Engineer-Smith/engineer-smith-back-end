// /models/CodeChallenge.js - Model for code challenges
const { Schema, model } = require('mongoose');

const codeChallengeSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true // Allow multiple null values, but unique non-null values
  },
  
  description: {
    type: String,
    required: true
  },
  
  problemStatement: {
    type: String,
    required: true
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  
  // Language support
  supportedLanguages: [{
    type: String,
    enum: ['javascript', 'python', 'dart', 'sql'],
    required: true
  }],
  
  // Categorization
  topics: [String],
  tags: [String],
  companyTags: [String],
  
  // Examples and constraints
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  
  constraints: [String],
  
  // Code configuration per language
  codeConfig: {
    javascript: {
      runtime: { type: String, default: 'node' },
      entryFunction: String,
      timeoutMs: { type: Number, default: 3000 }
    },
    python: {
      runtime: { type: String, default: 'python3' },
      entryFunction: String,
      timeoutMs: { type: Number, default: 3000 }
    },
    dart: {
      runtime: { type: String, default: 'dart' },
      entryFunction: String,
      timeoutMs: { type: Number, default: 3000 }
    },
    sql: {
      runtime: { type: String, default: 'sql' },
      timeoutMs: { type: Number, default: 5000 }
    }
  },
  
  // Starting code templates per language
  startingCode: {
    javascript: String,
    python: String,
    dart: String,
    sql: String
  },
  
  // Solution code per language
  solutionCode: {
    javascript: String,
    python: String,
    dart: String,
    sql: String
  },
  
  // Test cases
  testCases: [{
    name: { type: String, required: true },
    args: [Schema.Types.Mixed],
    expected: Schema.Types.Mixed,
    hidden: { type: Boolean, default: false }
  }],
  
  // Complexity analysis
  timeComplexity: String,
  spaceComplexity: String,
  
  // Hints and editorial
  hints: [String],
  editorial: String,
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active'
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  isGlobal: {
    type: Boolean,
    default: true
  },
  
  // Usage statistics
  usageStats: {
    totalAttempts: { type: Number, default: 0 },
    successfulSolutions: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from title before saving
codeChallengeSchema.pre('save', function(next) {
  if ((this.isModified('title') || this.isNew) && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `challenge-${this._id}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Indexes - Define them once here only
codeChallengeSchema.index({ slug: 1 }, { unique: true, sparse: true });
codeChallengeSchema.index({ difficulty: 1 });
codeChallengeSchema.index({ supportedLanguages: 1 });
codeChallengeSchema.index({ topics: 1 });
codeChallengeSchema.index({ tags: 1 });
codeChallengeSchema.index({ status: 1 });
codeChallengeSchema.index({ createdAt: -1 });

// Compound indexes
codeChallengeSchema.index({ difficulty: 1, supportedLanguages: 1 });
codeChallengeSchema.index({ status: 1, difficulty: 1 });
codeChallengeSchema.index({ organizationId: 1, status: 1 });

// Instance methods
codeChallengeSchema.methods.updateStats = function(newAttempt) {
  this.usageStats.totalAttempts++;
  if (newAttempt.success) {
    this.usageStats.successfulSolutions++;
  }
  
  this.usageStats.successRate = (this.usageStats.successfulSolutions / this.usageStats.totalAttempts) * 100;
  
  return this.save();
};

// Static methods
codeChallengeSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, status: 'active' });
};

codeChallengeSchema.statics.findByLanguage = function(language) {
  return this.find({ 
    supportedLanguages: language, 
    status: 'active' 
  }).sort({ createdAt: 1 }); // Sort by creation date instead
};

codeChallengeSchema.statics.findByTopics = function(topics) {
  return this.find({ 
    topics: { $in: topics }, 
    status: 'active' 
  });
};

codeChallengeSchema.statics.getRandomChallenge = function(difficulty, language) {
  const query = { status: 'active' };
  if (difficulty) query.difficulty = difficulty;
  if (language) query.supportedLanguages = language;
  
  return this.aggregate([
    { $match: query },
    { $sample: { size: 1 } }
  ]);
};

// Virtual for challenge URL
codeChallengeSchema.virtual('url').get(function() {
  return `/challenges/${this.slug}`;
});

// Virtual for difficulty badge color
codeChallengeSchema.virtual('difficultyColor').get(function() {
  const colors = {
    easy: 'green',
    medium: 'orange', 
    hard: 'red'
  };
  return colors[this.difficulty] || 'gray';
});

// Ensure virtuals are included in JSON output
codeChallengeSchema.set('toJSON', { virtuals: true });
codeChallengeSchema.set('toObject', { virtuals: true });

module.exports = model('CodeChallenge', codeChallengeSchema);