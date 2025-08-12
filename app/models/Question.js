// app/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Basic Information (Required for all types)
  title: { type: String, required: true },
  description: { type: String, required: true }, // Question text
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'code_challenge', 'debug_fix'],
    required: true
  },
  
  // Categorization
  skill: {
    type: String,
    enum: ['javascript', 'react', 'html', 'css', 'python', 'flutter', 'react_native', 'backend'],
    required: true
  },
  category: String, // arrays, functions, variables, etc.
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [String], // For search and auto-test generation
  
  // Question Content (varies by type)
  content: {
    // Multiple Choice specific
    options: [String], // ["Option A", "Option B", "Option C", "Option D"]
    correctAnswer: Number, // Index of correct option (0-based)
    shuffleOptions: { type: Boolean, default: true },
    
    // True/False specific  
    correctBoolean: Boolean, // true or false
    
    // Code Challenge specific
    language: String, // javascript, python, etc.
    starterCode: String, // Template code for student
    
    // Debug & Fix specific
    brokenCode: String, // Code with intentional bugs
    bugHint: String, // Optional hint about what's wrong
    
    // Common for coding questions (code_challenge + debug_fix)
    codeSnippet: String, // Optional code snippet for MC/TF questions
    
    // Evaluation configuration (simplified from UI)
    evaluationMode: {
      type: String,
      enum: [
        'flexible',        // Any working solution (output-based)
        'strict',          // Must use specific methods/patterns
        'bonus',           // Flexible + bonus for preferred method
        'minimal_fix'      // For debug questions - minimal changes required
      ],
      default: 'flexible'
    },
    
    // Simple requirements (converted to complex patterns behind scenes)
    mustUse: [String],     // ["for", "callback"] - simple list
    cannotUse: [String],   // ["map", "filter"] - simple list
    bonusPoints: Number,   // Extra points for bonus mode
    
    // Debug-specific settings
    maxLinesChanged: Number,        // For minimal_fix mode
    similarityThreshold: Number,    // How similar to original (0.7-0.9)
    
    // Test cases for coding questions
    testCases: [{
      description: String,
      functionCall: String,        // "findMax([1,2,3])"
      expected: String,            // "3" (stored as string, parsed when needed)
      points: { type: Number, default: 1 },
      hidden: { type: Boolean, default: false },
      
      // For debug questions - what broken code returns
      brokenResult: String,        // What the buggy code outputs
      shouldFail: { type: Boolean, default: false } // Does broken code fail this test?
    }],
    
    // Help content
    explanation: String,  // Shown after answer (for MC/TF)
    hints: [String],     // Progressive hints for coding questions
    
    // Execution settings (auto-generated from simple settings)
    timeLimit: { type: Number, default: 5000 }, // ms for code execution
    memoryLimit: { type: Number, default: 128 }, // MB
  },
  
  // Scoring and Selection
  points: { type: Number, default: 2 }, // Total points for this question
  timeEstimate: { type: Number, default: 60 }, // Seconds (auto-calculated by type)
  weight: { type: Number, default: 1.0 }, // Selection probability
  
  // Status and Permissions
  status: {
    type: String,
    enum: ['active', 'pending_review', 'rejected', 'retired'],
    default: function() {
      return this.createdByRole === 'admin' ? 'active' : 'pending_review';
    }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByRole: { type: String, enum: ['admin', 'instructor'], required: true },
  
  // For instructor suggestions
  suggestion: {
    submittedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNotes: String,
    approved: Boolean
  },
  
  // Usage Analytics (updated by system)
  usageStats: {
    timesUsed: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    lastUsed: Date,
    
    // For MC questions - track which options are selected
    optionStats: [Number], // How often each option is chosen
    
    // For coding questions - track test case performance  
    testCaseStats: [{
      testCaseId: String,
      successRate: Number,
      averageTime: Number
    }]
  },
  
  // Question Relationships (for advanced test generation)
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  followUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  variantGroup: String, // "array_methods" - group similar questions
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  mutuallyExclusive: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  
  // Version Control
  version: { type: Number, default: 1 },
  lastModified: { type: Date, default: Date.now },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Auto-calculate time estimate based on question type and complexity
questionSchema.pre('save', function(next) {
  if (!this.timeEstimate || this.timeEstimate === 60) { // Only if not manually set
    switch(this.type) {
      case 'multiple_choice':
        this.timeEstimate = this.content.codeSnippet ? 90 : 45; // More time if code to read
        break;
      case 'true_false':
        this.timeEstimate = this.content.codeSnippet ? 60 : 30;
        break;
      case 'code_challenge':
        const testCaseCount = this.content.testCases?.length || 1;
        this.timeEstimate = Math.min(600, 180 + (testCaseCount * 60)); // 3-10 minutes
        break;
      case 'debug_fix':
        this.timeEstimate = 240; // 4 minutes average
        break;
    }
  }
  next();
});

// Auto-calculate total points from test cases for coding questions
questionSchema.pre('save', function(next) {
  if ((this.type === 'code_challenge' || this.type === 'debug_fix') && this.content.testCases?.length) {
    const testCasePoints = this.content.testCases.reduce((sum, tc) => sum + (tc.points || 1), 0);
    if (!this.points || this.points === 2) { // Only if not manually set
      this.points = testCasePoints + (this.content.bonusPoints || 0);
    }
  }
  next();
});

// Generate complex evaluation config from simple UI inputs
questionSchema.methods.getEvaluationConfig = function() {
  const config = {
    timeLimit: this.content.timeLimit,
    memoryLimit: this.content.memoryLimit,
    allowConsoleLog: true
  };
  
  switch(this.content.evaluationMode) {
    case 'flexible':
      return {
        ...config,
        strategy: 'output_based',
        implementationRequirements: {}
      };
      
    case 'strict':
      return {
        ...config,
        strategy: 'implementation_required',
        implementationRequirements: {
          requiredMethods: this.content.mustUse || [],
          forbiddenMethods: this.content.cannotUse || [],
          requiredPatterns: this._generatePatterns(this.content.mustUse),
          forbiddenPatterns: this._generatePatterns(this.content.cannotUse, true)
        }
      };
      
    case 'bonus':
      return {
        ...config,
        strategy: 'hybrid',
        implementationRequirements: {
          bonusRequirements: {
            requiredMethods: this.content.mustUse || [],
            bonusPoints: this.content.bonusPoints || Math.ceil(this.points * 0.2)
          }
        }
      };
      
    case 'minimal_fix':
      return {
        ...config,
        strategy: 'minimal_fix',
        implementationRequirements: {
          maxLinesChanged: this.content.maxLinesChanged || 3,
          similarityThreshold: this.content.similarityThreshold || 0.8,
          originalCode: this.content.brokenCode
        }
      };
      
    default:
      return { ...config, strategy: 'output_based' };
  }
};

// Helper method to generate regex patterns from simple requirements
questionSchema.methods._generatePatterns = function(requirements, forbidden = false) {
  if (!requirements) return [];
  
  const patternMap = {
    'for': 'for\\s*\\(',
    'while': 'while\\s*\\(',
    'callback': '\\w+\\s*\\(',
    'map': '\\.map\\s*\\(',
    'filter': '\\.filter\\s*\\(',
    'forEach': '\\.forEach\\s*\\(',
    'reduce': '\\.reduce\\s*\\(',
    'split': '\\.split\\s*\\(',
    'join': '\\.join\\s*\\(',
    'reverse': '\\.reverse\\s*\\('
  };
  
  return requirements.map(req => patternMap[req.toLowerCase()] || req);
};

// Static method for easy question creation from UI
questionSchema.statics.createFromUI = function(uiData) {
  const question = new this({
    title: uiData.title,
    description: uiData.description,
    type: uiData.type,
    skill: uiData.skill,
    category: uiData.category,
    difficulty: uiData.difficulty,
    tags: uiData.tags || [],
    
    content: this._buildContentFromUI(uiData),
    
    points: uiData.points || 2,
    timeEstimate: uiData.timeEstimate,
    weight: uiData.weight || 1.0,
    
    createdBy: uiData.createdBy,
    createdByRole: uiData.createdByRole
  });
  
  return question;
};

// Replace the _buildContentFromUI method in your Question.js model with this:

questionSchema.statics._buildContentFromUI = function(uiData) {
  const content = {
    codeSnippet: uiData.codeSnippet,
    explanation: uiData.explanation,
    // Fix: Check if hints is already an array
    hints: Array.isArray(uiData.hints) 
      ? uiData.hints 
      : (uiData.hints ? uiData.hints.split('\n').filter(h => h.trim()) : [])
  };
  
  switch(uiData.type) {
    case 'multiple_choice':
      content.options = uiData.options;
      content.correctAnswer = uiData.correctAnswer;
      content.shuffleOptions = uiData.shuffleOptions !== false;
      break;
      
    case 'true_false':
      content.correctBoolean = uiData.correctAnswer;
      break;
      
    case 'code_challenge':
      content.language = uiData.language;
      content.starterCode = uiData.starterCode;
      content.evaluationMode = uiData.evaluationMode || 'flexible';
      // Fix: Check if mustUse is already an array
      content.mustUse = Array.isArray(uiData.mustUse) 
        ? uiData.mustUse 
        : (uiData.mustUse ? uiData.mustUse.split(',').map(s => s.trim()) : []);
      // Fix: Check if cannotUse is already an array  
      content.cannotUse = Array.isArray(uiData.cannotUse) 
        ? uiData.cannotUse 
        : (uiData.cannotUse ? uiData.cannotUse.split(',').map(s => s.trim()) : []);
      content.bonusPoints = uiData.bonusPoints;
      content.testCases = uiData.testCases || [];
      break;
      
    case 'debug_fix':
      content.language = uiData.language;
      content.brokenCode = uiData.brokenCode;
      content.bugHint = uiData.bugHint;
      content.evaluationMode = uiData.evaluationMode || 'flexible';
      content.maxLinesChanged = uiData.maxLinesChanged;
      content.similarityThreshold = uiData.similarityThreshold;
      content.testCases = uiData.testCases || [];
      break;
  }
  
  return content;
};

// Indexes for performance
questionSchema.index({ skill: 1, difficulty: 1, status: 1 });
questionSchema.index({ type: 1, category: 1 });
questionSchema.index({ createdBy: 1, status: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ 'usageStats.successRate': 1 });

module.exports = mongoose.model('Question', questionSchema);