const { Schema, model } = require('mongoose');

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
    enum: ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'],
    required: true,
  },
  language: {
    type: String,
    enum: ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'],
    required: true, // Make language required for all questions
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
  testCases: {
    type: [{ input: String, output: String, hidden: { type: Boolean, default: false } }],
    default: undefined,
    required: function () {
      return this.type === 'codeChallenge' || this.type === 'codeDebugging';
    },
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true, // Align with frontend validation
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
    enum: [
      'html',
      'css',
      'javascript',
      'dom',
      'events',
      'async-programming',
      'promises',
      'async-await',
      'es6',
      'closures',
      'scope',
      'hoisting',
      'flexbox',
      'grid',
      'responsive-design',
      'react',
      'react-native',
      'components',
      'hooks',
      'state-management',
      'props',
      'context-api',
      'redux',
      'react-router',
      'jsx',
      'virtual-dom',
      'native-components',
      'navigation',
      'flutter',
      'widgets',
      'state-management-flutter',
      'dart',
      'navigation-flutter',
      'ui-components',
      'express',
      'nodejs',
      'rest-api',
      'middleware',
      'routing',
      'authentication',
      'authorization',
      'jwt',
      'express-middleware',
      'sql',
      'queries',
      'joins',
      'indexes',
      'transactions',
      'database-design',
      'normalization',
      'python',
      'functions',
      'classes',
      'modules',
      'list-comprehensions',
      'decorators',
      'generators',
      'python-data-structures',
      'variables',
      'arrays',
      'objects',
      'loops',
      'conditionals',
      'algorithms',
      'data-structures',
      'error-handling',
      'testing',
      'typescript',
    ],
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
questionSchema.index({ difficulty: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ tags: 1 });

questionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('Question', questionSchema);