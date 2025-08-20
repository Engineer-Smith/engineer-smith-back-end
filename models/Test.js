// /models/Test.js
const { Schema, model } = require('mongoose');

const testSchema = new Schema({
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
  testType: {
    type: String,
    enum: ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'],
    default: 'custom',
  },
  languages: {
    type: [String],
    enum: ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'],
    default: [],
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
      'mobile-development',
    ],
    default: [],
  },
  settings: {
    timeLimit: { type: Number, required: true }, // Minutes
    attemptsAllowed: { type: Number, required: true },
    shuffleQuestions: { type: Boolean, default: false },
    useSections: { type: Boolean, default: false },
  },
  sections: {
    type: [{
      name: { type: String, required: true, trim: true },
      timeLimit: { type: Number, required: true }, // Minutes
      questions: [{
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        points: { type: Number, required: true },
      }],
    }],
    default: undefined,
    required: function () {
      return this.settings.useSections;
    },
  },
  questions: {
    type: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
      points: { type: Number, required: true },
    }],
    default: undefined,
    required: function () {
      return !this.settings.useSections;
    },
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    default: null, // Null for global tests
  },
  isGlobal: {
    type: Boolean,
    default: false,
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
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
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
testSchema.index({ organizationId: 1 });
testSchema.index({ isGlobal: 1 });
testSchema.index({ status: 1 });
testSchema.index({ createdBy: 1 });
testSchema.index({ testType: 1 });
testSchema.index({ languages: 1 });
testSchema.index({ tags: 1 });

// Update updatedAt on save
testSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('Test', testSchema);