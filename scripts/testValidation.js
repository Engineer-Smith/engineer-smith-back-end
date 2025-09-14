// scripts/testValidation.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import our new utilities
const QuestionTemplateGenerator = require('../utils/questionTemplate');
const QuestionSeedValidator = require('../utils/seedValidator');
const BatchProcessor = require('../utils/batchProcessor');

// Import models
const Organization = require('../models/Organization');
const User = require('../models/User');
const Question = require('../models/Question');

async function testValidationUtilities() {
  try {
    console.log('🧪 Testing Question Validation Utilities\n');

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
    const testQuestions = createTestQuestions();
    
    // Initialize utilities
    const validator = new QuestionSeedValidator();
    const processor = new BatchProcessor({ logProgress: true, batchSize: 5 });

    console.log('📝 Created test questions:');
    testQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.title} (${q.type}, ${q.language})`);
    });
    console.log('');

    // Test 1: Template Generation
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

    // Test 2: Validation
    console.log('🔍 Testing Question Validation...');
    const validationResults = await validator.validateBatch(templatedQuestions, {
      testAutoGrading: true // Enable auto-grading tests
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Test 3: Batch Processing (dry run)
    console.log('📦 Testing Batch Processing (dry run)...');
    
    if (validationResults.validQuestions.length > 0) {
      console.log(`Processing ${validationResults.validQuestions.length} valid questions...`);
      
      // For testing, let's just try to create one question to verify the process works
      const testQuestion = validationResults.validQuestions[0];
      
      try {
        // Check if question already exists to avoid duplicates
        const existing = await Question.findOne({ 
          title: testQuestion.title, 
          language: testQuestion.language 
        });
        
        if (existing) {
          console.log('  ℹ️  Test question already exists, skipping insertion');
        } else {
          const inserted = await Question.create(testQuestion);
          console.log(`  ✅ Successfully inserted test question: ${inserted.title}`);
          console.log(`  📄 Inserted with ID: ${inserted._id}`);
          
          // Verify insertion
          const verification = await processor.verifyInsertedQuestions([inserted._id]);
          console.log(`  🔍 Verification: ${verification.found} found, ${verification.missing} missing`);
          
          // Clean up test question
          await Question.deleteOne({ _id: inserted._id });
          console.log('  🗑️  Cleaned up test question');
        }
      } catch (error) {
        console.log(`  ❌ Test insertion failed: ${error.message}`);
      }
    }
    console.log('');

    // Test 4: Error Handling
    console.log('🚨 Testing Error Handling...');
    const invalidQuestions = [
      {
        // Missing required fields
        title: 'Invalid Question 1',
        type: 'multipleChoice'
        // Missing description, language, difficulty
      },
      {
        // Invalid enum values
        title: 'Invalid Question 2',
        description: 'Test question',
        type: 'invalidType',
        language: 'invalidLanguage',
        difficulty: 'impossible'
      },
      {
        // Logic question without test cases
        title: 'Invalid Logic Question',
        description: 'Should fail validation',
        type: 'codeChallenge',
        language: 'javascript',
        category: 'logic',
        difficulty: 'medium'
        // Missing testCases and codeConfig
      }
    ];

    console.log('Testing with intentionally invalid questions...');
    const invalidResults = await validator.validateBatch(invalidQuestions, {
      testAutoGrading: false // Skip auto-grading for invalid questions
    });

    console.log(`Expected failures: ${invalidResults.invalidQuestions.length}/${invalidQuestions.length}`);
    console.log('');

    // Summary
    console.log('🎉 Validation Utility Test Complete!');
    console.log(`✅ Template Generation: ${templatedQuestions.length}/${testQuestions.length} successful`);
    console.log(`✅ Validation: ${validationResults.validQuestions.length}/${templatedQuestions.length} valid questions`);
    console.log(`✅ Error Handling: ${invalidResults.invalidQuestions.length}/3 invalid questions caught`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

function createTestQuestions() {
  return [
    // Valid multiple choice question
    {
      title: 'JavaScript Variable Declaration',
      description: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
      type: 'multipleChoice',
      language: 'javascript',
      difficulty: 'easy',
      tags: ['javascript', 'variables'],
      options: ['var', 'let', 'const', 'function'],
      correctAnswer: 1
    },

    // Valid true/false question
    {
      title: 'JavaScript Hoisting',
      description: 'JavaScript hoists variable declarations to the top of their scope.',
      type: 'trueFalse',
      language: 'javascript',
      difficulty: 'medium',
      tags: ['javascript', 'hoisting'],
      options: ['True', 'False'],
      correctAnswer: 0
    },

    // Valid logic code challenge with proper test cases
    {
      title: 'Add Two Numbers',
      description: 'Write a function that adds two numbers and returns the result.',
      type: 'codeChallenge',
      language: 'javascript',
      preferredCategory: 'logic',
      difficulty: 'easy',
      tags: ['javascript', 'functions'],
      entryFunction: 'addNumbers',
      testCases: [
        { args: [1, 2], expected: 3, hidden: false },
        { args: [5, 10], expected: 15, hidden: false },
        { args: [-1, 1], expected: 0, hidden: true },
        { args: [0, 0], expected: 0, hidden: true }
      ]
    },

    // Valid code debugging question
    {
      title: 'Fix Array Sum Function',
      description: 'The following function should sum all numbers in an array, but it has a bug. Fix it.',
      type: 'codeDebugging',
      language: 'javascript',
      preferredCategory: 'logic',
      difficulty: 'medium',
      tags: ['javascript', 'arrays', 'loops'],
      buggyCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
      solutionCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
      entryFunction: 'sumArray',
      testCases: [
        { args: [[1, 2, 3]], expected: 6, hidden: false },
        { args: [[10, 20, 30, 40]], expected: 100, hidden: false },
        { args: [[]], expected: 0, hidden: true },
        { args: [[1]], expected: 1, hidden: true }
      ]
    },

    // Valid fill-in-the-blank question
    {
      title: 'Complete the For Loop',
      description: 'Fill in the missing parts of this for loop that iterates from 0 to 9.',
      type: 'fillInTheBlank',
      language: 'javascript',
      preferredCategory: 'syntax',
      difficulty: 'easy',
      tags: ['javascript', 'loops'],
      codeTemplate: `for (let i = ___; i < ___; ___) {
  console.log(i);
}`,
      blanks: [
        { correctAnswers: ['0'], position: 0 },
        { correctAnswers: ['10'], position: 1 },
        { correctAnswers: ['i++', 'i += 1', '++i'], position: 2 }
      ]
    },

    // Valid UI code challenge (no test cases needed)
    {
      title: 'Create a Responsive Button',
      description: 'Create a CSS button that changes color on hover and is responsive.',
      type: 'codeChallenge',
      language: 'css',
      preferredCategory: 'ui',
      difficulty: 'medium',
      tags: ['css', 'responsive-design'],
      codeTemplate: `.button {
  /* Add your CSS here */
}`,
      expectedOutput: 'A button that changes color on hover and adapts to screen size'
    }
  ];
}

// Run the test if this file is executed directly
if (require.main === module) {
  testValidationUtilities()
    .then(() => {
      console.log('✅ All tests completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testValidationUtilities, createTestQuestions };