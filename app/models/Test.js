// app/models/Test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Test Configuration
  settings: {
    timeLimit: {
      type: Number, // minutes - overall test time limit (if not using sections)
      default: 60
    },
    attemptsAllowed: {
      type: Number,
      default: 1
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false
    },
    passingScore: {
      type: Number, // percentage
      default: 70
    },
    availableFrom: Date,
    availableUntil: Date,
    instructions: String,
    
    // New: Section-based timing
    useSections: {
      type: Boolean,
      default: false // If true, use section timing instead of overall timeLimit
    },
    
    // New: Question randomization settings
    useQuestionPool: {
      type: Boolean,
      default: false // If true, randomly select questions from pools
    }
  },

  // Enhanced: Timed Sections Support with Question Type Configuration
  sections: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    timeLimit: {
      type: Number, // minutes for this section
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    instructions: String,
    
    // New: Section Type Configuration
    sectionType: {
      type: String,
      enum: [
        'mixed',           // Any question types
        'multiple_choice', // Only multiple choice questions
        'true_false',      // Only true/false questions
        'coding',          // Code challenges and debug fixes
        'debugging',       // Only debug & fix questions
        'theory',          // Multiple choice + true/false (no coding)
        'practical',       // Only coding questions
        'custom'           // Custom type restrictions
      ],
      default: 'mixed'
    },
    
    // New: Allowed question types for this section
    allowedQuestionTypes: {
      multiple_choice: {
        type: Boolean,
        default: true
      },
      true_false: {
        type: Boolean,
        default: true
      },
      code_challenge: {
        type: Boolean,
        default: true
      },
      debug_fix: {
        type: Boolean,
        default: true
      }
    },
    
    // New: Section-specific settings
    sectionSettings: {
      // Override global settings for this section
      shuffleQuestions: Boolean,
      shuffleOptions: Boolean,
      showProgressBar: {
        type: Boolean,
        default: true
      },
      allowSkipping: {
        type: Boolean,
        default: false
      },
      showRemainingTime: {
        type: Boolean,
        default: true
      },
      autoSubmitOnTimeUp: {
        type: Boolean,
        default: true
      },
      
      // Coding-specific settings
      codeEditor: {
        enabled: {
          type: Boolean,
          default: true
        },
        language: {
          type: String,
          enum: ['javascript', 'python', 'html', 'css'],
          default: 'javascript'
        },
        showLineNumbers: {
          type: Boolean,
          default: true
        },
        allowReset: {
          type: Boolean,
          default: true
        }
      }
    },
    
    // Questions in this section (if not using question pools)
    questions: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      points: {
        type: Number,
        default: 1
      },
      order: Number,
      // New: Question-specific overrides for this section
      sectionOverrides: {
        timeLimit: Number, // Override individual question time limit
        points: Number,    // Override points for this section
        required: {        // Must answer to proceed
          type: Boolean,
          default: false
        }
      }
    }],
    
    // Enhanced Question pool for this section
    questionPool: {
      enabled: {
        type: Boolean,
        default: false
      },
      totalQuestions: Number,
      
      // Section-specific selection strategy
      selectionStrategy: {
        type: String,
        enum: [
          'random',              // Pure random selection
          'balanced',            // Try to balance difficulty/types
          'progressive',         // Start easy, get harder
          'weighted',            // Use question weights
          'adaptive'             // Based on previous performance (future)
        ],
        default: 'balanced'
      },
      
      // Available questions to choose from (filtered by section type)
      availableQuestions: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        points: Number,
        weight: {
          type: Number,
          default: 1
        },
        // New: Question metadata for better selection
        metadata: {
          estimatedTime: Number,    // Minutes to complete
          difficultyScore: Number,  // 1-10 scale
          prerequisites: [String],  // Required knowledge
          tags: [String]            // Additional filtering tags
        }
      }],
      
      // Enhanced distribution rules
      distribution: {
        // Question type distribution (respects allowedQuestionTypes)
        byType: {
          multiple_choice: {
            count: Number,
            minCount: Number,
            maxCount: Number
          },
          true_false: {
            count: Number,
            minCount: Number,
            maxCount: Number
          },
          code_challenge: {
            count: Number,
            minCount: Number,
            maxCount: Number
          },
          debug_fix: {
            count: Number,
            minCount: Number,
            maxCount: Number
          }
        },
        
        // Difficulty progression
        byDifficulty: {
          beginner: {
            count: Number,
            position: {
              type: String,
              enum: ['start', 'middle', 'end', 'distributed'],
              default: 'start'
            }
          },
          intermediate: {
            count: Number,
            position: {
              type: String,
              enum: ['start', 'middle', 'end', 'distributed'],
              default: 'middle'
            }
          },
          advanced: {
            count: Number,
            position: {
              type: String,
              enum: ['start', 'middle', 'end', 'distributed'],
              default: 'end'
            }
          }
        },
        
        // Skill distribution
        bySkill: {
          html: Number,
          css: Number,
          javascript: Number,
          react: Number,
          flutter: Number,
          react_native: Number,
          backend: Number,
          python: Number
        },
        
        // New: Time-based distribution
        byEstimatedTime: {
          quick: {           // 1-2 minutes
            count: Number,
            maxTime: {
              type: Number,
              default: 2
            }
          },
          medium: {          // 3-5 minutes
            count: Number,
            minTime: {
              type: Number,
              default: 3
            },
            maxTime: {
              type: Number,
              default: 5
            }
          },
          long: {            // 6+ minutes
            count: Number,
            minTime: {
              type: Number,
              default: 6
            }
          }
        }
      },
      
      // Enhanced constraints
      constraints: {
        // Ensure variety
        ensureVariety: {
          type: Boolean,
          default: true
        },
        
        // Prevent duplicate concepts
        avoidSimilarQuestions: {
          type: Boolean,
          default: true
        },
        
        // Time constraints
        maxTotalTime: Number,      // Don't exceed section time limit
        avgTimePerQuestion: Number, // Target average time
        
        // Difficulty constraints
        maxConsecutiveDifficult: {
          type: Number,
          default: 2           // Max 2 hard questions in a row
        },
        
        // Prerequisites
        respectPrerequisites: {
          type: Boolean,
          default: true        // Easier questions before harder ones
        }
      }
    }
  }],

  // Legacy: Questions Selection (for backward compatibility)
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    points: {
      type: Number,
      default: 1
    },
    order: Number
  }],

  // Global Question Pool (alternative to sections)
  questionPool: {
    enabled: {
      type: Boolean,
      default: false
    },
    totalQuestions: Number,
    
    // Available questions to choose from
    availableQuestions: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      points: Number,
      weight: {
        type: Number,
        default: 1
      }
    }],
    
    // Distribution rules
    distribution: {
      byType: {
        multiple_choice: Number,
        true_false: Number,
        code_challenge: Number,
        debug_fix: Number
      },
      byDifficulty: {
        beginner: Number,
        intermediate: Number,
        advanced: Number
      },
      bySkill: {
        html: Number,
        css: Number,
        javascript: Number,
        react: Number,
        flutter: Number,
        react_native: Number,
        backend: Number,
        python: Number
      }
    }
  },

  // Auto-generation settings (enhanced)
  autoGenerate: {
    enabled: {
      type: Boolean,
      default: false
    },
    rules: {
      totalQuestions: Number,
      skillDistribution: [{
        skill: String,
        count: Number,
        minCount: Number,
        maxCount: Number
      }],
      difficultyDistribution: {
        beginner: Number,
        intermediate: Number,
        advanced: Number
      },
      typeDistribution: {
        multiple_choice: Number,
        true_false: Number,
        code_challenge: Number,
        debug_fix: Number
      },
      allowedSkills: [String],
      preferredCombinations: [{
        name: String,
        skills: [String],
        weights: [Number]
      }]
    }
  },

  // Test Metadata
  skills: [String],
  testType: {
    type: String,
    enum: [
      'single_skill',
      'frontend',
      'react_focused',
      'full_stack',
      'mobile',
      'comprehensive',
      'custom'
    ],
    default: 'single_skill'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  category: String,
  tags: [String],

  // Analytics
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    completedAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    },
    
    // New: Section-specific analytics
    sectionStats: [{
      sectionId: String,
      averageTime: Number,
      averageScore: Number,
      completionRate: Number
    }],
    
    // New: Question pool analytics
    poolStats: {
      questionsUsed: [String], // Track which questions have been used
      questionFrequency: [{
        questionId: String,
        timesUsed: Number,
        averageScore: Number
      }]
    }
  }
}, {
  timestamps: true
});

// Enhanced virtual for total points
testSchema.virtual('totalPoints').get(function() {
  if (this.settings.useSections && this.sections.length > 0) {
    return this.sections.reduce((total, section) => {
      if (section.questionPool.enabled) {
        return total + (section.questionPool.totalQuestions * 2); // Estimate 2 points per question
      } else {
        return total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0);
      }
    }, 0);
  } else if (this.questionPool.enabled) {
    return this.questionPool.totalQuestions * 2; // Estimate
  } else {
    return this.questions.reduce((total, q) => total + q.points, 0);
  }
});

// Enhanced virtual for total time
testSchema.virtual('totalTime').get(function() {
  if (this.settings.useSections && this.sections.length > 0) {
    return this.sections.reduce((total, section) => total + section.timeLimit, 0);
  } else {
    return this.settings.timeLimit;
  }
});

// Method to generate questions for a section
testSchema.methods.generateSectionQuestions = async function(sectionIndex) {
  const section = this.sections[sectionIndex];
  if (!section || !section.questionPool.enabled) return section.questions;

  const Question = mongoose.model('Question');
  const pool = section.questionPool;
  const selectedQuestions = [];

  // Get available questions
  const availableQuestionIds = pool.availableQuestions.map(q => q.questionId);
  const availableQuestions = await Question.find({
    _id: { $in: availableQuestionIds },
    status: 'active'
  });

  // Apply distribution rules
  const distribution = pool.distribution;
  let remaining = pool.totalQuestions;

  // Select by type distribution
  if (distribution.byType) {
    for (const [type, count] of Object.entries(distribution.byType)) {
      if (count > 0 && remaining > 0) {
        const typeQuestions = availableQuestions
          .filter(q => q.type === type)
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(count, remaining));
        
        selectedQuestions.push(...typeQuestions.map(q => ({
          questionId: q._id,
          points: q.points
        })));
        
        remaining -= typeQuestions.length;
      }
    }
  }

  // Fill remaining with random questions
  if (remaining > 0) {
    const usedIds = selectedQuestions.map(q => q.questionId.toString());
    const remainingQuestions = availableQuestions
      .filter(q => !usedIds.includes(q._id.toString()))
      .sort(() => 0.5 - Math.random())
      .slice(0, remaining);
    
    selectedQuestions.push(...remainingQuestions.map(q => ({
      questionId: q._id,
      points: q.points
    })));
  }

  return selectedQuestions;
};

// Method to generate all questions (enhanced)
testSchema.methods.generateQuestions = async function() {
  if (this.settings.useSections) {
    // Generate questions for each section
    for (let i = 0; i < this.sections.length; i++) {
      if (this.sections[i].questionPool.enabled) {
        this.sections[i].questions = await this.generateSectionQuestions(i);
      }
    }
    return true;
  } else if (this.questionPool.enabled) {
    // Generate questions for global pool
    const Question = mongoose.model('Question');
    const pool = this.questionPool;
    const selectedQuestions = [];

    const availableQuestionIds = pool.availableQuestions.map(q => q.questionId);
    const availableQuestions = await Question.find({
      _id: { $in: availableQuestionIds },
      status: 'active'
    });

    // Apply distribution logic (similar to section logic)
    let remaining = pool.totalQuestions;
    
    if (pool.distribution.byType) {
      for (const [type, count] of Object.entries(pool.distribution.byType)) {
        if (count > 0 && remaining > 0) {
          const typeQuestions = availableQuestions
            .filter(q => q.type === type)
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(count, remaining));
          
          selectedQuestions.push(...typeQuestions.map(q => ({
            questionId: q._id,
            points: q.points
          })));
          
          remaining -= typeQuestions.length;
        }
      }
    }

    this.questions = selectedQuestions;
    return this.questions;
  } else if (this.autoGenerate.enabled) {
    // Legacy auto-generation
    const Question = mongoose.model('Question');
    const rules = this.autoGenerate.rules;
    const selectedQuestions = [];

    if (rules.skillDistribution && rules.skillDistribution.length > 0) {
      for (const skillRule of rules.skillDistribution) {
        const questions = await Question.find({
          skill: skillRule.skill,
          status: 'active'
        }).limit(skillRule.count);
        
        selectedQuestions.push(...questions.map(q => ({
          questionId: q._id,
          points: q.points
        })));
      }
    } 
    // If using allowed skills, distribute evenly or by weights
    else if (rules.allowedSkills && rules.allowedSkills.length > 0) {
      const questionsPerSkill = Math.floor(rules.totalQuestions / rules.allowedSkills.length);
      
      for (const skill of rules.allowedSkills) {
        const questions = await Question.find({
          skill: skill,
          status: 'active'
        }).limit(questionsPerSkill);
        
        selectedQuestions.push(...questions.map(q => ({
          questionId: q._id,
          points: q.points
        })));
      }
    }

    this.questions = selectedQuestions;
    return this.questions;
  }
  
  return this.questions;
};

// Method to get test type suggestions based on skills
testSchema.methods.suggestTestType = function() {
  const skills = this.skills || [];
  
  if (skills.length === 1) return 'single_skill';
  
  if (skills.includes('html') && skills.includes('css') && skills.includes('javascript')) {
    return 'frontend';
  }
  
  if (skills.includes('react') && skills.includes('javascript')) {
    return 'react_focused';
  }
  
  if (skills.includes('backend') && (skills.includes('javascript') || skills.includes('html'))) {
    return 'full_stack';
  }
  
  if (skills.includes('react_native') || skills.includes('flutter')) {
    return 'mobile';
  }
  
  return 'comprehensive';
};

// Enhanced method to get section type display names
testSchema.methods.getSectionTypeInfo = function(sectionType) {
  const sectionTypes = {
    mixed: {
      name: 'Mixed Questions',
      description: 'Any question types allowed',
      icon: '🔀',
      suggestedTime: 2 // minutes per question
    },
    multiple_choice: {
      name: 'Multiple Choice',
      description: 'Only multiple choice questions',
      icon: '📝',
      suggestedTime: 1.5
    },
    true_false: {
      name: 'True/False',
      description: 'Only true/false questions',
      icon: '✅',
      suggestedTime: 1
    },
    coding: {
      name: 'Coding Challenges',
      description: 'Code challenges and debugging',
      icon: '💻',
      suggestedTime: 8
    },
    debugging: {
      name: 'Code Debugging',
      description: 'Only debug & fix questions',
      icon: '🐛',
      suggestedTime: 10
    },
    theory: {
      name: 'Theory Questions',
      description: 'Multiple choice and true/false only',
      icon: '📚',
      suggestedTime: 1.5
    },
    practical: {
      name: 'Practical Coding',
      description: 'Only hands-on coding questions',
      icon: '⚡',
      suggestedTime: 12
    },
    custom: {
      name: 'Custom Section',
      description: 'Custom question type restrictions',
      icon: '⚙️',
      suggestedTime: 3
    }
  };
  
  return sectionTypes[sectionType] || sectionTypes.mixed;
};

// Method to validate section configuration
testSchema.methods.validateSections = function() {
  if (!this.settings.useSections || !this.sections.length) return { valid: true };
  
  const errors = [];
  const warnings = [];
  
  // Check for duplicate section orders
  const orders = this.sections.map(s => s.order);
  const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
  if (duplicateOrders.length > 0) {
    errors.push(`Duplicate section orders found: ${duplicateOrders.join(', ')}`);
  }
  
  // Check section time limits
  this.sections.forEach((section, index) => {
    const sectionInfo = this.getSectionTypeInfo(section.sectionType);
    const estimatedTimeNeeded = (section.questionPool.enabled ? 
      section.questionPool.totalQuestions : 
      section.questions.length) * sectionInfo.suggestedTime;
    
    if (section.timeLimit < estimatedTimeNeeded * 0.5) {
      warnings.push(`Section "${section.name}" may need more time (${estimatedTimeNeeded} min recommended)`);
    }
    
    // Check if section has questions or pools configured
    if (!section.questionPool.enabled && section.questions.length === 0) {
      errors.push(`Section "${section.name}" has no questions configured`);
    }
  });
  
  // Check total time
  const totalSectionTime = this.sections.reduce((sum, s) => sum + s.timeLimit, 0);
  if (totalSectionTime > 240) { // 4 hours max
    warnings.push(`Total test time is ${totalSectionTime} minutes - consider breaking into multiple tests`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Static method to get predefined test templates (enhanced)
testSchema.statics.getTestTemplates = function() {
  return [
    {
      name: 'Frontend Fundamentals',
      type: 'frontend',
      skills: ['html', 'css', 'javascript'],
      description: 'Test covering HTML structure, CSS styling, and JavaScript fundamentals',
      suggestedQuestions: 20,
      useSections: true,
      sections: [
        {
          name: 'HTML & CSS Basics',
          sectionType: 'theory',
          timeLimit: 15,
          questionPool: {
            enabled: true,
            totalQuestions: 8,
            distribution: {
              bySkill: { html: 4, css: 4 },
              byDifficulty: { beginner: 5, intermediate: 3 }
            }
          }
        },
        {
          name: 'JavaScript Fundamentals',
          sectionType: 'mixed',
          timeLimit: 20,
          questionPool: {
            enabled: true,
            totalQuestions: 12,
            distribution: {
              byType: { multiple_choice: 8, code_challenge: 4 },
              byDifficulty: { beginner: 6, intermediate: 4, advanced: 2 }
            }
          }
        }
      ],
      distribution: {
        html: 4,
        css: 4, 
        javascript: 12
      },
      difficulty: {
        beginner: 55,
        intermediate: 35,
        advanced: 10
      }
    },
    {
      name: 'React Developer Assessment',
      type: 'react_focused',
      skills: ['javascript', 'react'],
      description: 'React components, hooks, and JavaScript proficiency',
      suggestedQuestions: 15,
      useSections: true,
      sections: [
        {
          name: 'JavaScript Prerequisites',
          sectionType: 'theory',
          timeLimit: 10,
          questionPool: {
            enabled: true,
            totalQuestions: 5,
            distribution: {
              byType: { multiple_choice: 5 },
              byDifficulty: { intermediate: 3, advanced: 2 }
            }
          }
        },
        {
          name: 'React Components & Hooks',
          sectionType: 'coding',
          timeLimit: 25,
          questionPool: {
            enabled: true,
            totalQuestions: 3,
            distribution: {
              byType: { code_challenge: 2, debug_fix: 1 },
              byDifficulty: { intermediate: 2, advanced: 1 }
            }
          }
        },
        {
          name: 'React Theory',
          sectionType: 'multiple_choice',
          timeLimit: 12,
          questionPool: {
            enabled: true,
            totalQuestions: 7,
            distribution: {
              byDifficulty: { beginner: 2, intermediate: 3, advanced: 2 }
            }
          }
        }
      ]
    },
    {
      name: 'Full Stack Developer',
      type: 'full_stack',
      skills: ['html', 'css', 'javascript', 'react', 'backend'],
      description: 'Comprehensive full stack assessment',
      suggestedQuestions: 25,
      useSections: true,
      sections: [
        {
          name: 'Frontend Fundamentals',
          sectionType: 'theory',
          timeLimit: 20,
          questionPool: {
            enabled: true,
            totalQuestions: 10,
            distribution: {
              bySkill: { html: 3, css: 3, javascript: 4 }
            }
          }
        },
        {
          name: 'React Development',
          sectionType: 'coding',
          timeLimit: 30,
          questionPool: {
            enabled: true,
            totalQuestions: 4,
            distribution: {
              byType: { code_challenge: 3, debug_fix: 1 }
            }
          }
        },
        {
          name: 'Backend & API Design',
          sectionType: 'mixed',
          timeLimit: 25,
          questionPool: {
            enabled: true,
            totalQuestions: 8,
            distribution: {
              byType: { multiple_choice: 5, code_challenge: 3 }
            }
          }
        },
        {
          name: 'System Design',
          sectionType: 'theory',
          timeLimit: 15,
          questionPool: {
            enabled: true,
            totalQuestions: 3,
            distribution: {
              byDifficulty: { advanced: 3 }
            }
          }
        }
      ]
    }
  ];
};

// Method to check if test is available for taking
testSchema.methods.isAvailable = function() {
  const now = new Date();
  
  if (this.status !== 'published') return false;
  
  if (this.settings.availableFrom && now < this.settings.availableFrom) {
    return false;
  }
  
  if (this.settings.availableUntil && now > this.settings.availableUntil) {
    return false;
  }
  
  return true;
};

// Method to estimate test completion time
testSchema.methods.estimateCompletionTime = function() {
  if (this.settings.useSections && this.sections.length > 0) {
    return {
      totalTime: this.sections.reduce((sum, s) => sum + s.timeLimit, 0),
      breakdown: this.sections.map(section => ({
        name: section.name,
        timeLimit: section.timeLimit,
        estimatedQuestions: section.questionPool.enabled ? 
          section.questionPool.totalQuestions : 
          section.questions.length
      }))
    };
  } else {
    const questionCount = this.questionPool.enabled ? 
      this.questionPool.totalQuestions : 
      this.questions.length;
    
    return {
      totalTime: this.settings.timeLimit,
      estimatedQuestions: questionCount,
      timePerQuestion: questionCount > 0 ? this.settings.timeLimit / questionCount : 0
    };
  }
};

module.exports = mongoose.model('Test', testSchema);