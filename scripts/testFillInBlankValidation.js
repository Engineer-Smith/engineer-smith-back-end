// scripts/testFillInBlankValidation.js - Test enhanced fill-in-blank validation
const mongoose = require('mongoose');
require('dotenv').config();

// Import enhanced utilities
const QuestionTemplateGenerator = require('../utils/questionTemplate');
const QuestionSeedValidator = require('../utils/seedValidator');

// Import models
const Organization = require('../models/Organization');
const User = require('../models/User');

async function testFillInBlankValidation() {
  try {
    console.log('🧪 Testing Enhanced Fill-in-Blank Validation\n');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Get super org and user for testing
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });

    if (!superOrg || !superUser) {
      throw new Error('Super organization or admin user not found');
    }

    console.log(`🏢 Using organization: ${superOrg.name}`);
    console.log(`👤 Using user: ${superUser.name || 'Admin User'}\n`);

    // Create test questions with various scenarios
    const testQuestions = createTestFillInBlankQuestions();
    
    // Initialize validator
    const validator = new QuestionSeedValidator();

    console.log('📝 Created test fill-in-blank questions:');
    testQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.title} (${q.difficulty})`);
    });
    console.log('');

    // Template Generation
    console.log('🔧 Testing Question Template Generation...');
    const templatedQuestions = [];
    
    for (const baseQuestion of testQuestions) {
      try {
        const templated = QuestionTemplateGenerator.createQuestionTemplate(
          baseQuestion, 
          superOrg._id, 
          superUser._id
        );
        templatedQuestions.push(templated);
        console.log(`  ✅ ${baseQuestion.title}: Template created successfully`);
      } catch (error) {
        console.log(`  ❌ ${baseQuestion.title}: Template generation failed - ${error.message}`);
      }
    }
    console.log('');

    // Enhanced Validation with Fill-in-Blank Testing
    console.log('🔍 Testing Enhanced Fill-in-Blank Validation...');
    const validationResults = await validator.validateBatch(templatedQuestions, {
      testAutoGrading: true // This now includes fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Show detailed results
    if (validationResults.invalidQuestions.length > 0) {
      console.log('❌ Questions that failed validation:');
      validationResults.invalidQuestions.forEach(({ question, result }) => {
        console.log(`  - ${question.title}:`);
        result.errors.forEach(error => console.log(`    • ${error}`));
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => console.log(`    ⚠️ ${warning}`));
        }
      });
      console.log('');
    }

    if (validationResults.validQuestions.length > 0) {
      console.log('✅ Questions that passed validation:');
      validationResults.validQuestions.forEach(question => {
        console.log(`  - ${question.title}`);
      });
      console.log('');
    }

    console.log(`🎯 Final Results:`);
    console.log(`   Total Questions: ${validationResults.summary.total}`);
    console.log(`   ✅ Valid: ${validationResults.summary.valid}`);
    console.log(`   ❌ Invalid: ${validationResults.summary.invalid}`);
    console.log(`   ⚠️  With Warnings: ${validationResults.summary.warnings}`);

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

function createTestFillInBlankQuestions() {
  return [
    // ✅ VALID: Well-structured fill-in-blank question
    {
      title: 'Valid CSS Flexbox Question',
      description: 'Complete the flexbox properties',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'medium',
      tags: ['css', 'flexbox'],
      status: 'active',
      codeTemplate: `.container {
  display: ___blank1___;
  justify-content: ___blank2___;
}`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: ['flex'],
          caseSensitive: false,
          points: 2
        },
        {
          id: 'blank2',
          correctAnswers: ['center', 'flex-start', 'flex-end'],
          caseSensitive: false,
          points: 1
        }
      ]
    },

    // ❌ INVALID: Missing blanks array
    {
      title: 'Invalid - Missing Blanks Array',
      description: 'This question is missing the blanks array',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { color: ___blank1___; }`
      // Missing blanks array - should fail validation
    },

    // ❌ INVALID: Empty correctAnswers
    {
      title: 'Invalid - Empty Correct Answers',
      description: 'This question has empty correct answers',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { color: ___blank1___; }`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: [], // Empty array - should fail validation
          caseSensitive: false,
          points: 1
        }
      ]
    },

    // ❌ INVALID: Non-string correct answers
    {
      title: 'Invalid - Non-string Correct Answers',
      description: 'This question has non-string correct answers',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { opacity: ___blank1___; }`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: [1, 0.5, 0], // Numbers instead of strings - should fail validation
          caseSensitive: false,
          points: 1
        }
      ]
    },

    // ⚠️ WARNING: Case sensitivity issues
    {
      title: 'Warning - Case Sensitivity Issues',
      description: 'This question has mixed case answers with case sensitivity enabled',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { display: ___blank1___; }`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: ['flex', 'FLEX', 'Flex'], // Mixed case with case sensitivity - should warn
          caseSensitive: true, // This will cause a warning
          points: 1
        }
      ]
    },

    // ⚠️ WARNING: Point distribution issues
    {
      title: 'Warning - Point Distribution Issues',
      description: 'This question has uneven point distribution',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { 
  color: ___blank1___; 
  font-size: ___blank2___;
}`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: ['red'],
          caseSensitive: false,
          points: 10 // Very high points
        },
        {
          id: 'blank2',
          correctAnswers: ['16px'],
          caseSensitive: false,
          points: 1 // Much lower points - should warn about distribution
        }
      ]
    },

    // ✅ VALID: Complex question with multiple blanks
    {
      title: 'Valid - Complex Multi-Blank Question',
      description: 'Complete the CSS Grid layout',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'hard',
      tags: ['css', 'grid', 'layout'],
      status: 'active',
      codeTemplate: `.grid {
  display: ___blank1___;
  grid-template-columns: ___blank2___;
  gap: ___blank3___;
}

.item {
  grid-column: ___blank4___;
}`,
      blanks: [
        {
          id: 'blank1',
          correctAnswers: ['grid'],
          caseSensitive: false,
          points: 2
        },
        {
          id: 'blank2',
          correctAnswers: ['repeat(3, 1fr)', '1fr 1fr 1fr', 'repeat(auto-fit, minmax(200px, 1fr))'],
          caseSensitive: false,
          points: 3
        },
        {
          id: 'blank3',
          correctAnswers: ['10px', '1rem', '20px', '1em'],
          caseSensitive: false,
          points: 1
        },
        {
          id: 'blank4',
          correctAnswers: ['1 / 3', 'span 2', '1 / -1'],
          caseSensitive: false,
          points: 2
        }
      ]
    },

    // ❌ INVALID: Missing blank ID
    {
      title: 'Invalid - Missing Blank ID',
      description: 'This question has a blank without an ID',
      type: 'fillInTheBlank',
      language: 'css',
      category: 'ui',
      difficulty: 'easy',
      tags: ['css'],
      status: 'active',
      codeTemplate: `.element { margin: ___blank1___; }`,
      blanks: [
        {
          // Missing id field - should fail validation
          correctAnswers: ['10px'],
          caseSensitive: false,
          points: 1
        }
      ]
    }
  ];
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFillInBlankValidation()
    .then(() => {
      console.log('\n🎉 Fill-in-blank validation testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fill-in-blank validation testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testFillInBlankValidation };