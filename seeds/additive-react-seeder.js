// additive-react-seeder.js - Add questions without removing existing ones
const mongoose = require('mongoose');
const path = require('path');

// Configure dotenv to look for .env file in project root (parent directory)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import your practice test questions
const practiceQuestions = require('./data/react-test-questions.json');

// Import models using your project structure
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Valid React tags from your tag system
const VALID_REACT_TAGS = [
  'react', 'javascript', 'components', 'jsx', 'props', 'state', 'hooks', 'useState',
  'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback', 'custom-hooks',
  'lifecycle-methods', 'event-handling-react', 'conditional-rendering', 'lists-keys',
  'forms-controlled', 'state-management', 'context-api', 'redux', 'react-router',
  'routing', 'navigation', 'performance-optimization', 'memo', 'virtual-dom', 'reconciliation',
  'ui-components', 'testing', 'useRef', 'destructuring', 'arrays', 'objects', 'functions',
  'es6', 'event-handling', 'imports-exports', 'arrow-functions', 'map-filter-reduce'
];

// Tag mapping for common React concepts to your valid tags
const TAG_MAPPING = {
  'function-components': 'components',
  'form-handling': 'forms-controlled',
  'onClick': 'event-handling-react',
  'onChange': 'event-handling-react',
  'onSubmit': 'event-handling-react',
  'dependency-array': 'useEffect',
  'side-effects': 'useEffect',
  'controlled-inputs': 'forms-controlled',
  'keys': 'lists-keys',
  'prop-drilling': 'context-api',
  'url-parameters': 'react-router',
  'useParams': 'react-router',
  'useNavigate': 'react-router',
  'ternary-operator': 'conditional-rendering',
  'prevState': 'state-management',
  'functional-updates': 'state-management',
  'rules-of-hooks': 'hooks',
  'memory-leaks': 'performance-optimization',
  'cleanup': 'useEffect',
  'immutability': 'state-management',
  'component-data': 'props',
  'this-binding': 'javascript',
  'debugging': 'testing'
};

function validateAndFixTags(originalTags) {
  const fixedTags = [];
  
  for (const tag of originalTags) {
    // Check if tag is already valid
    if (VALID_REACT_TAGS.includes(tag)) {
      fixedTags.push(tag);
    }
    // Check if we have a mapping for this tag
    else if (TAG_MAPPING[tag]) {
      fixedTags.push(TAG_MAPPING[tag]);
    }
    // For unknown tags, try to find a similar valid tag
    else {
      console.log(`⚠️  Unknown tag "${tag}" - mapping to related concept`);
      
      // Common fallbacks based on patterns
      if (tag.includes('react')) fixedTags.push('react');
      else if (tag.includes('hook')) fixedTags.push('hooks');
      else if (tag.includes('component')) fixedTags.push('components');
      else if (tag.includes('state')) fixedTags.push('state-management');
      else if (tag.includes('event')) fixedTags.push('event-handling-react');
      else if (tag.includes('router') || tag.includes('navigation')) fixedTags.push('react-router');
      else if (tag.includes('form')) fixedTags.push('forms-controlled');
      else if (tag.includes('performance')) fixedTags.push('performance-optimization');
      else fixedTags.push('react'); // Default fallback
    }
  }
  
  // Remove duplicates and ensure we have at least 'react'
  const uniqueTags = [...new Set(fixedTags)];
  if (!uniqueTags.includes('react')) {
    uniqueTags.unshift('react');
  }
  
  return uniqueTags;
}

function validateAndFixCategory(originalCategory) {
  // Based on your existing question, you use 'syntax' for React questions
  // Map common categories to your schema
  const CATEGORY_MAPPING = {
    'ui': 'syntax',
    'logic': 'syntax', 
    'syntax': 'syntax'
  };
  
  return CATEGORY_MAPPING[originalCategory] || 'syntax'; // Default to 'syntax'
}

async function addReactPracticeQuestions() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting ADDITIVE React question seeding (preserving existing questions)...\n');

    // Check for MongoDB URL in environment variables
    const mongoUrl = process.env.MONGO_URL || 
                     process.env.MONGODB_URL || 
                     process.env.MONGODB_URI || 
                     process.env.DATABASE_URL;

    if (!mongoUrl) {
      throw new Error(`
❌ MongoDB connection string not found!

Please ensure one of these environment variables is set in your .env file:
  • MONGO_URL
  • MONGODB_URL  
  • MONGODB_URI
  • DATABASE_URL

Example .env file:
MONGO_URL=mongodb://localhost:27017/your-database
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
      `);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    // Get super organization and user (or create if not exists)
    let superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) {
      // If no super org exists, find the first organization or create one
      superOrg = await Organization.findOne() || await Organization.create({
        name: 'Simply Coding Courses',
        isSuperOrg: true,
        isGlobal: true
      });
    }

    let superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) {
      // If no admin user exists, find the first user or create one
      superUser = await User.findOne({ organizationId: superOrg._id }) || await User.create({
        name: 'Admin User',
        email: 'admin@simplycoding.com',
        organizationId: superOrg._id,
        role: 'admin'
      });
    }

    console.log(`🏢 Using organization: ${superOrg.name}`);
    console.log(`👤 Using user: ${superUser.name || 'Admin User'}\n`);

    // Check existing React questions
    const existingQuestions = await Question.find({ language: 'react' });
    console.log(`📋 Found ${existingQuestions.length} existing React questions`);

    // Create a set of existing question titles for duplicate checking
    const existingTitles = new Set(existingQuestions.map(q => 
      q.title.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
    ));

    console.log(`📊 Practice questions to process: ${practiceQuestions.length}`);
    console.log(`🔍 Checking for duplicates...\n`);

    // Filter out questions that already exist
    const newQuestions = [];
    const skippedQuestions = [];

    for (const questionData of practiceQuestions) {
      const normalizedTitle = questionData.title.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
      
      if (existingTitles.has(normalizedTitle)) {
        skippedQuestions.push(questionData.title);
        console.log(`⏭️  Skipping duplicate: "${questionData.title}"`);
      } else {
        // Prepare question for insertion with required fields
        const questionToInsert = {
          ...questionData,
          organizationId: null, // Match your existing schema
          isGlobal: true,
          createdBy: superUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          codeConfig: questionData.codeConfig || {}, // Ensure codeConfig exists
          category: validateAndFixCategory(questionData.category),
          usageStats: {
            timesUsed: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            successRate: 0,
            averageTime: 0
          },
          // Validate and fix tags to match your system
          tags: validateAndFixTags(questionData.tags || [])
        };

        newQuestions.push(questionToInsert);
        console.log(`✅ Adding new question: "${questionData.title}"`);
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Total practice questions: ${practiceQuestions.length}`);
    console.log(`   New questions to add: ${newQuestions.length}`);
    console.log(`   Skipped duplicates: ${skippedQuestions.length}`);

    // Insert new questions if any
    if (newQuestions.length > 0) {
      console.log(`\n📦 Inserting ${newQuestions.length} new questions...`);
      
      try {
        const insertResult = await Question.insertMany(newQuestions, { ordered: false });
        console.log(`✅ Successfully inserted ${insertResult.length} questions`);
        
        // Verify questions by type
        const byType = {};
        const byDifficulty = {};
        
        insertResult.forEach(q => {
          byType[q.type] = (byType[q.type] || 0) + 1;
          byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
        });

        console.log(`\n🎯 Questions added by type:`);
        Object.entries(byType).forEach(([type, count]) => {
          console.log(`   ${type}: ${count} questions`);
        });

        console.log(`\n📊 Questions added by difficulty:`);
        Object.entries(byDifficulty).forEach(([difficulty, count]) => {
          console.log(`   ${difficulty}: ${count} questions`);
        });

      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors gracefully
          console.log(`⚠️  Some questions were skipped due to uniqueness constraints`);
          
          // Try inserting one by one to see which ones succeed
          let successCount = 0;
          const failures = [];
          
          for (const question of newQuestions) {
            try {
              await Question.create(question);
              successCount++;
              console.log(`   ✅ Inserted: "${question.title}"`);
            } catch (err) {
              failures.push({ title: question.title, error: err.message });
              console.log(`   ❌ Failed: "${question.title}" - ${err.message}`);
            }
          }
          
          console.log(`\n📊 Individual insertion results:`);
          console.log(`   Successful: ${successCount}`);
          console.log(`   Failed: ${failures.length}`);
          
        } else {
          throw error;
        }
      }
    } else {
      console.log(`\n✨ All practice questions already exist in the database!`);
    }

    // Final verification
    const finalCount = await Question.countDocuments({ language: 'react' });
    console.log(`\n🔍 Final verification: ${finalCount} React questions in database`);

    // Show skipped questions if any
    if (skippedQuestions.length > 0) {
      console.log(`\n⏭️  Skipped questions (already exist):`);
      skippedQuestions.forEach(title => {
        console.log(`   - ${title}`);
      });
    }

    // Performance summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 ADDITIVE React question seeding completed!`);
    console.log(`📈 Questions processed: ${practiceQuestions.length}`);
    console.log(`➕ New questions added: ${newQuestions.length}`);
    console.log(`⏭️  Skipped (duplicates): ${skippedQuestions.length}`);
    console.log(`⏱️  Total time: ${duration} seconds`);
    
    if (newQuestions.length > 0) {
      console.log(`🚀 Performance: ${(newQuestions.length / parseFloat(duration)).toFixed(1)} questions/second`);
    }

    return {
      total: practiceQuestions.length,
      added: newQuestions.length,
      skipped: skippedQuestions.length,
      finalCount: finalCount
    };

  } catch (error) {
    console.error('💥 Additive React seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Validation function to check if questions would be valid
async function validatePracticeQuestions() {
  console.log('🔍 Validating practice questions format...\n');
  
  const validationErrors = [];
  const warnings = [];
  
  practiceQuestions.forEach((question, index) => {
    const errors = [];
    
    // Required fields validation
    if (!question.title) errors.push('Missing title');
    if (!question.description) errors.push('Missing description');
    if (!question.type) errors.push('Missing type');
    if (!question.language) errors.push('Missing language');
    if (!question.difficulty) errors.push('Missing difficulty');
    
    // Type-specific validation
    switch (question.type) {
      case 'multipleChoice':
        if (!question.options || !Array.isArray(question.options)) {
          errors.push('Missing or invalid options array');
        }
        if (typeof question.correctAnswer !== 'number') {
          errors.push('Missing or invalid correctAnswer index');
        }
        break;
        
      case 'trueFalse':
        if (!question.options || question.options.length !== 2) {
          errors.push('True/False must have exactly 2 options');
        }
        break;
        
      case 'fillInTheBlank':
        if (!question.codeTemplate) errors.push('Missing codeTemplate');
        if (!question.blanks || !Array.isArray(question.blanks)) {
          errors.push('Missing or invalid blanks array');
        }
        break;
        
      case 'codeChallenge':
      case 'codeDebugging':
        if (!question.codeConfig) errors.push('Missing codeConfig');
        if (!question.testCases) errors.push('Missing testCases');
        break;
    }
    
    // Language validation
    if (question.language !== 'react' && question.language !== 'javascript') {
      warnings.push(`Question ${index + 1}: Language is "${question.language}" (not react/javascript)`);
    }
    
    if (errors.length > 0) {
      validationErrors.push({
        index: index + 1,
        title: question.title,
        errors
      });
    }
  });
  
  // Report validation results
  console.log(`📊 Validation Results:`);
  console.log(`   Total questions: ${practiceQuestions.length}`);
  console.log(`   Valid questions: ${practiceQuestions.length - validationErrors.length}`);
  console.log(`   Invalid questions: ${validationErrors.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  
  if (validationErrors.length > 0) {
    console.log(`\n❌ Invalid questions:`);
    validationErrors.forEach(({ index, title, errors }) => {
      console.log(`   ${index}. "${title}": ${errors.join(', ')}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    warnings.forEach(warning => {
      console.log(`   ${warning}`);
    });
  }
  
  return {
    valid: practiceQuestions.length - validationErrors.length,
    invalid: validationErrors.length,
    warnings: warnings.length,
    isValid: validationErrors.length === 0
  };
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--env') || args.includes('-e')) {
  console.log('🔍 Environment Check:\n');
  
  const envVars = ['MONGO_URL', 'MONGODB_URL', 'MONGODB_URI', 'DATABASE_URL'];
  let found = false;
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      found = true;
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  });
  
  if (!found) {
    console.log('\n💡 No MongoDB connection string found in environment variables.');
    console.log('Make sure your .env file is in the project root and contains one of these variables.');
  }
  
  console.log('\n📁 Current working directory:', process.cwd());
  console.log('📁 Script location:', __filename);
  
  process.exit(0);
} else if (args.includes('--validate') || args.includes('-v')) {
  validatePracticeQuestions()
    .then((results) => {
      if (results.isValid) {
        console.log('\n✅ All questions are valid and ready for seeding!');
        process.exit(0);
      } else {
        console.log('\n❌ Some questions have validation errors. Please fix them before seeding.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📚 ADDITIVE REACT QUESTION SEEDER

This script adds your practice test questions to the database WITHOUT removing existing questions.

Usage:
  node additive-react-seeder.js           # Add questions to database
  node additive-react-seeder.js --validate # Validate questions format only
  node additive-react-seeder.js --help     # Show this help

Features:
  ✅ Preserves all existing questions
  ✅ Automatically skips duplicates
  ✅ Validates question format
  ✅ Shows detailed progress
  ✅ Works with your current schema

The script will:
  1. Connect to your MongoDB database
  2. Find existing React questions
  3. Compare titles to avoid duplicates  
  4. Add only new questions
  5. Show detailed results

Requirements:
  - .env file with MONGO_URL in project root (engineer-smith-be/.env)
  - data/react-test-questions.json file
  - Run from the seeds/ directory

File Structure:
  engineer-smith-be/
  ├── .env                          # ← Environment variables here
  ├── models/
  ├── seeds/
  │   ├── additive-react-seeder.js  # ← Run this script from here  
  │   └── data/
  │       └── react-test-questions.json

The script automatically looks for .env in the parent directory.
`);
  process.exit(0);
} else {
  addReactPracticeQuestions()
    .then((results) => {
      console.log(`\n🎉 SUCCESS! Added ${results.added} new questions (${results.skipped} duplicates skipped)`);
      console.log(`📊 Total React questions in database: ${results.finalCount}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed questions:', error);
      process.exit(1);
    });
}

module.exports = { addReactPracticeQuestions, validatePracticeQuestions };