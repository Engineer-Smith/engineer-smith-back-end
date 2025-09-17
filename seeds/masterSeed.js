const mongoose = require('mongoose');
require('dotenv').config();

// Import all language seed functions AND their question data
const { seedJavaScriptQuestions, javascriptQuestions } = require('./javascriptSeeds');
const { seedHtmlQuestions, htmlQuestions } = require('./htmlSeeds');
const { seedCssQuestions, cssQuestions } = require('./cssSeeds');
const { seedReactQuestions, reactQuestions } = require('./reactSeeds');
const { seedPythonQuestions, pythonQuestions } = require('./pythonSeeds');
const { seedSqlQuestions, sqlQuestions } = require('./sqlSeeds');
const { seedDartQuestions, dartQuestions } = require('./dartSeeds');
const { seedFlutterQuestions, flutterQuestions } = require('./flutterSeeds');
const { seedExpressQuestions, expressQuestions } = require('./expressSeeds');
const { seedTypescriptQuestions, typescriptQuestions } = require('./typescriptSeeds');
const { seedReactNativeQuestions, reactNativeQuestions } = require('./reactNativeSeeds');
const { seedJsonQuestions, jsonQuestions } = require('./jsonSeeds');

// Helper function to calculate total questions from question data
function calculateQuestionCount(questionData) {
  if (!questionData || typeof questionData !== 'object') {
    return 0;
  }
  
  return Object.values(questionData).reduce((total, questionArray) => {
    if (Array.isArray(questionArray)) {
      return total + questionArray.length;
    }
    return total;
  }, 0);
}

// Enhanced master seeder with dynamic question counts
async function seedAllQuestions() {
  let connection = null;
  
  try {
    console.log('🚀 Starting comprehensive question seeding for all languages...\n');

    // Single connection for all seeders
    connection = await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const startTime = Date.now();
    let totalQuestions = 0;
    const results = [];

    // Dynamic language configuration with calculated question counts
    const languages = [
      { 
        name: 'JavaScript', 
        seedFunction: seedJavaScriptQuestions, 
        expected: calculateQuestionCount(javascriptQuestions) 
      },
      { 
        name: 'HTML', 
        seedFunction: seedHtmlQuestions, 
        expected: calculateQuestionCount(htmlQuestions) 
      },
      { 
        name: 'CSS', 
        seedFunction: seedCssQuestions, 
        expected: calculateQuestionCount(cssQuestions) 
      },
      { 
        name: 'React', 
        seedFunction: seedReactQuestions, 
        expected: calculateQuestionCount(reactQuestions) 
      },
      { 
        name: 'Python', 
        seedFunction: seedPythonQuestions, 
        expected: calculateQuestionCount(pythonQuestions) 
      },
      { 
        name: 'SQL', 
        seedFunction: seedSqlQuestions, 
        expected: calculateQuestionCount(sqlQuestions) 
      },
      { 
        name: 'Dart', 
        seedFunction: seedDartQuestions, 
        expected: calculateQuestionCount(dartQuestions) 
      },
      { 
        name: 'Flutter', 
        seedFunction: seedFlutterQuestions, 
        expected: calculateQuestionCount(flutterQuestions) 
      },
      { 
        name: 'Express', 
        seedFunction: seedExpressQuestions, 
        expected: calculateQuestionCount(expressQuestions) 
      },
      { 
        name: 'TypeScript', 
        seedFunction: seedTypescriptQuestions, 
        expected: calculateQuestionCount(typescriptQuestions) 
      },
      { 
        name: 'React Native', 
        seedFunction: seedReactNativeQuestions, 
        expected: calculateQuestionCount(reactNativeQuestions) 
      },
      { 
        name: 'JSON', 
        seedFunction: seedJsonQuestions, 
        expected: calculateQuestionCount(jsonQuestions) 
      },
    ];

    // Calculate and display total expected questions
    const totalExpected = languages.reduce((sum, lang) => sum + lang.expected, 0);
    console.log(`📊 Total questions to seed: ${totalExpected} across ${languages.length} languages\n`);

    // Seed each language with individual error handling
    for (const { name, seedFunction, expected } of languages) {
      try {
        console.log(`📚 Seeding ${name} questions (${expected} questions)...`);
        const startLangTime = Date.now();
        
        // Each seeder handles its own connection internally
        const questions = await seedFunction();
        
        const langDuration = ((Date.now() - startLangTime) / 1000).toFixed(2);
        const success = questions.length > 0;
        
        totalQuestions += questions.length;
        results.push({
          language: name,
          count: questions.length,
          expected,
          success,
          duration: langDuration
        });

        if (success) {
          const percentage = expected > 0 ? `(${((questions.length / expected) * 100).toFixed(0)}%)` : '';
          console.log(`✅ ${name}: ${questions.length}/${expected} questions ${percentage} (${langDuration}s)\n`);
        } else {
          console.log(`⚠️  ${name}: No questions created (${langDuration}s)\n`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to seed ${name} questions: ${error.message}`);
        results.push({
          language: name,
          count: 0,
          expected,
          success: false,
          error: error.message,
          duration: '0.00'
        });
        console.log(`   Continuing with remaining languages...\n`);
      }
    }

    // Comprehensive results summary
    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
    const successCount = results.filter(r => r.success).length;

    console.log('🎉 COMPREHENSIVE QUESTION SEEDING COMPLETED!\n');
    console.log('📊 RESULTS SUMMARY:');
    console.log(`   Languages processed: ${languages.length}`);
    console.log(`   Successfully seeded: ${successCount}/${languages.length}`);
    console.log(`   Total questions created: ${totalQuestions}/${totalExpected}`);
    console.log(`   Success rate: ${((totalQuestions / totalExpected) * 100).toFixed(1)}%`);
    console.log(`   Total time: ${totalDuration} seconds`);
    console.log(`   Average: ${(totalQuestions / parseFloat(totalDuration)).toFixed(1)} questions/second\n`);

    // Detailed breakdown
    console.log('📋 DETAILED BREAKDOWN:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const percentage = result.expected > 0 ? `(${((result.count / result.expected) * 100).toFixed(0)}%)` : '';
      console.log(`   ${status} ${result.language.padEnd(15)} ${result.count.toString().padStart(3)}/${result.expected.toString().padEnd(3)} ${percentage.padEnd(6)} ${result.duration}s`);
    });

    // Show any failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n⚠️  FAILED LANGUAGES:');
      failures.forEach(failure => {
        console.log(`   ${failure.language}: ${failure.error || 'Unknown error'}`);
      });
    }

    console.log('\n🎯 All language seeding completed!');
    
    return totalQuestions;
  } catch (error) {
    console.error('💥 Master seeding failed:', error);
    throw error;
  } finally {
    // Ensure connection is properly closed
    if (connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

}

// Enhanced specific language seeding with dynamic counts
async function seedSpecificLanguage(languageName) {
  // Complete language mapping with dynamic question counts
  const languageMap = {
    'javascript': { func: seedJavaScriptQuestions, expected: calculateQuestionCount(javascriptQuestions) },
    'js': { func: seedJavaScriptQuestions, expected: calculateQuestionCount(javascriptQuestions) },
    'html': { func: seedHtmlQuestions, expected: calculateQuestionCount(htmlQuestions) },
    'css': { func: seedCssQuestions, expected: calculateQuestionCount(cssQuestions) },
    'react': { func: seedReactQuestions, expected: calculateQuestionCount(reactQuestions) },
    'python': { func: seedPythonQuestions, expected: calculateQuestionCount(pythonQuestions) },
    'py': { func: seedPythonQuestions, expected: calculateQuestionCount(pythonQuestions) },
    'sql': { func: seedSqlQuestions, expected: calculateQuestionCount(sqlQuestions) },
    'dart': { func: seedDartQuestions, expected: calculateQuestionCount(dartQuestions) },
    'flutter': { func: seedFlutterQuestions, expected: calculateQuestionCount(flutterQuestions) },
    'express': { func: seedExpressQuestions, expected: calculateQuestionCount(expressQuestions) },
    'typescript': { func: seedTypescriptQuestions, expected: calculateQuestionCount(typescriptQuestions) },
    'ts': { func: seedTypescriptQuestions, expected: calculateQuestionCount(typescriptQuestions) },
    'reactnative': { func: seedReactNativeQuestions, expected: calculateQuestionCount(reactNativeQuestions) },
    'react-native': { func: seedReactNativeQuestions, expected: calculateQuestionCount(reactNativeQuestions) },
    'json': { func: seedJsonQuestions, expected: calculateQuestionCount(jsonQuestions) }
  };

  const normalizedName = languageName.toLowerCase().replace(/[\s-_]/g, '');
  const language = languageMap[normalizedName];
  
  if (!language) {
    console.error(`❌ Unknown language: ${languageName}`);
    console.log('\n📚 Available languages:');
    
    // Show dynamic counts for each language
    const uniqueLanguages = new Map();
    Object.entries(languageMap).forEach(([key, value]) => {
      const cleanName = key.replace(/[\d-]/g, '');
      if (!uniqueLanguages.has(cleanName)) {
        uniqueLanguages.set(cleanName, value.expected);
      }
    });
    
    uniqueLanguages.forEach((count, lang) => {
      console.log(`   • ${lang} (${count} questions)`);
    });
    
    console.log('\n💡 Tip: You can also use aliases like "js", "py", "ts", "react-native"');
    process.exit(1);
  }

  let connection = null;
  
  try {
    connection = await mongoose.connect(process.env.MONGO_URL);
    console.log(`🚀 Seeding ${languageName} questions (${language.expected} questions)...\n`);
    
    const startTime = Date.now();
    const questions = await language.func();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Successfully seeded ${questions.length}/${language.expected} ${languageName} questions`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log(`🎯 Success rate: ${((questions.length / language.expected) * 100).toFixed(1)}%`);
    
    return questions;
    
  } catch (error) {
    console.error(`❌ Error seeding ${languageName} questions:`, error.message);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Enhanced help function with dynamic counts
function showHelp() {
  const totalQuestions = calculateQuestionCount(javascriptQuestions) + 
                        calculateQuestionCount(htmlQuestions) + 
                        calculateQuestionCount(cssQuestions) + 
                        calculateQuestionCount(reactQuestions) + 
                        calculateQuestionCount(pythonQuestions) + 
                        calculateQuestionCount(sqlQuestions) + 
                        calculateQuestionCount(dartQuestions) + 
                        calculateQuestionCount(flutterQuestions) + 
                        calculateQuestionCount(expressQuestions) + 
                        calculateQuestionCount(typescriptQuestions) + 
                        calculateQuestionCount(reactNativeQuestions) + 
                        calculateQuestionCount(jsonQuestions);

  console.log(`
📚 COMPREHENSIVE QUESTION SEEDER

Usage:
  node masterSeed.js                    # Seed all languages
  node masterSeed.js [language]         # Seed specific language
  node masterSeed.js --list             # List available languages
  node masterSeed.js --help             # Show this help

Available Languages:
  • javascript (js)     - ${calculateQuestionCount(javascriptQuestions)} questions
  • typescript (ts)     - ${calculateQuestionCount(typescriptQuestions)} questions
  • python (py)         - ${calculateQuestionCount(pythonQuestions)} questions
  • sql                 - ${calculateQuestionCount(sqlQuestions)} questions  
  • html                - ${calculateQuestionCount(htmlQuestions)} questions
  • css                 - ${calculateQuestionCount(cssQuestions)} questions
  • react               - ${calculateQuestionCount(reactQuestions)} questions
  • react-native        - ${calculateQuestionCount(reactNativeQuestions)} questions
  • dart                - ${calculateQuestionCount(dartQuestions)} questions
  • flutter             - ${calculateQuestionCount(flutterQuestions)} questions
  • express             - ${calculateQuestionCount(expressQuestions)} questions
  • json                - ${calculateQuestionCount(jsonQuestions)} questions

Total: ${totalQuestions} questions across 12 languages

Examples:
  node masterSeed.js                    # Seed all ${totalQuestions} questions
  node masterSeed.js javascript         # Seed only JavaScript questions
  node masterSeed.js sql                # Seed only SQL questions
`);
}

function listLanguages() {
  console.log(`
📚 Available Languages for Seeding:

Logic Languages (with code execution):
  • JavaScript (js)    - ${calculateQuestionCount(javascriptQuestions)} questions (MC, T/F, Code, Debug, Fill-in)
  • TypeScript (ts)    - ${calculateQuestionCount(typescriptQuestions)} questions (MC, T/F, Code, Debug, Fill-in)  
  • Python (py)        - ${calculateQuestionCount(pythonQuestions)} questions (MC, T/F, Code, Debug, Fill-in)
  • SQL                - ${calculateQuestionCount(sqlQuestions)} questions (MC, T/F, Code, Fill-in)
  • Dart               - ${calculateQuestionCount(dartQuestions)} questions (MC, T/F, Code, Debug, Fill-in)
  • Express            - ${calculateQuestionCount(expressQuestions)} questions (MC, T/F, Code, Debug, Fill-in)

UI/Syntax Languages:
  • HTML               - ${calculateQuestionCount(htmlQuestions)} questions (MC, T/F, Fill-in)
  • CSS                - ${calculateQuestionCount(cssQuestions)} questions (MC, T/F, Fill-in)
  • React              - ${calculateQuestionCount(reactQuestions)} questions (MC, T/F, Fill-in)
  • React Native       - ${calculateQuestionCount(reactNativeQuestions)} questions (MC, T/F, Fill-in)
  • Flutter            - ${calculateQuestionCount(flutterQuestions)} questions (MC, T/F, Fill-in)
  • JSON               - ${calculateQuestionCount(jsonQuestions)} questions (MC, T/F, Fill-in)

Total: ${calculateQuestionCount(javascriptQuestions) + calculateQuestionCount(htmlQuestions) + calculateQuestionCount(cssQuestions) + calculateQuestionCount(reactQuestions) + calculateQuestionCount(pythonQuestions) + calculateQuestionCount(sqlQuestions) + calculateQuestionCount(dartQuestions) + calculateQuestionCount(flutterQuestions) + calculateQuestionCount(expressQuestions) + calculateQuestionCount(typescriptQuestions) + calculateQuestionCount(reactNativeQuestions) + calculateQuestionCount(jsonQuestions)} questions across 12 languages
`);
}

// Rest of the CLI code remains the same...
const args = process.argv.slice(2);

if (args.length === 0) {
  seedAllQuestions()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Master seeding failed:', error);
      process.exit(1);
    });
} else {
  const command = args[0].toLowerCase();
  
  switch (command) {
    case '--help':
    case '-h':
    case 'help':
      showHelp();
      process.exit(0);
      break;
      
    case '--list':
    case '-l':
    case 'list':
      listLanguages();
      process.exit(0);
      break;
      
    case '--version':
    case '-v':
      console.log('Question Seeder v2.1.0 - Dynamic Question Counting');
      process.exit(0);
      break;
      
    default:
      seedSpecificLanguage(command)
        .then(() => process.exit(0))
        .catch(error => {
          console.error(`💥 Failed to seed ${command}:`, error.message);
          process.exit(1);
        });
  }
}

module.exports = { 
  seedAllQuestions, 
  seedSpecificLanguage,
  showHelp,
  listLanguages,
  calculateQuestionCount
};