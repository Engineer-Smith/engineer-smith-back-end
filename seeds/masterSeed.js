const mongoose = require('mongoose');
require('dotenv').config();

// Import all language seed functions
const { seedJavaScriptQuestions } = require('./javascriptSeeds');
// Add more imports as you create them:
const { seedHtmlQuestions } = require('./htmlSeeds');
const { seedCssQuestions } = require('./cssSeeds');
const { seedReactQuestions } = require('./reactSeeds');
const { seedPythonQuestions } = require('./pythonSeeds');
const { seedSqlQuestions } = require('./sqlSeeds');
const { seedDartQuestions } = require('./dartSeeds');
const { seedFlutterQuestions } = require('./flutterSeeds');
const { seedExpressQuestions } = require('./expressSeeds');
const { seedTypescriptQuestions } = require('./typescriptSeeds')
const { seedReactNativeQuestions } = require('./reactNativeSeeds');
const { seedJsonQuestions } = require('./jsonSeeds');

async function seedAllQuestions() {
  try {
    console.log('🚀 Starting comprehensive question seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const startTime = Date.now();
    let totalQuestions = 0;

    // Seed each language
    const languages = [
      { name: 'JavaScript', seedFunction: seedJavaScriptQuestions },
      // Add more as you create them:
      { name: 'HTML', seedFunction: seedHtmlQuestions },
      { name: 'CSS', seedFunction: seedCssQuestions },
      { name: 'React', seedFunction: seedReactQuestions },
      { name: 'Python', seedFunction: seedPythonQuestions },
      { name: 'SQL', seedFunction: seedSqlQuestions },
      { name: 'Dart', seedFunction: seedDartQuestions },
      { name: 'Flutter', seedFunction: seedFlutterQuestions },
      { name: 'Express', seedFunction: seedExpressQuestions },
      { name: 'TypeScript', seedFunction: seedTypescriptQuestions },
      { name: 'React Native', seedFunction: seedReactNativeQuestions },
      { name: 'JSON', seedFunction: seedJsonQuestions },
    ];

    for (const { name, seedFunction } of languages) {
      try {
        console.log(`📚 Seeding ${name} questions...`);
        const questions = await seedFunction();
        totalQuestions += questions.length;
        console.log(`✅ ${name}: ${questions.length} questions\n`);
      } catch (error) {
        console.error(`❌ Failed to seed ${name} questions:`, error.message);
        // Continue with other languages even if one fails
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('🎉 Question seeding completed!');
    console.log(`📊 Total questions created: ${totalQuestions}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log(`🎯 Target: ${languages.length * 50} questions (50 per language)`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('💥 Error during seeding:', error);
    process.exit(1);
  }
}

// Allow running specific languages
async function seedSpecificLanguage(languageName) {
  const languageMap = {
    'javascript': seedJavaScriptQuestions,
    // Add more mappings as you create them
  };

  const seedFunction = languageMap[languageName.toLowerCase()];
  if (!seedFunction) {
    console.error(`❌ Unknown language: ${languageName}`);
    console.log(`Available languages: ${Object.keys(languageMap).join(', ')}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`🚀 Seeding ${languageName} questions...`);
    
    const questions = await seedFunction();
    console.log(`✅ Successfully seeded ${questions.length} ${languageName} questions`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding ${languageName} questions:`, error);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
if (args.length > 0) {
  const command = args[0].toLowerCase();
  if (command === '--help' || command === '-h') {
    console.log(`
📚 Question Seeder

Usage:
  node masterSeed.js                    # Seed all languages
  node masterSeed.js [language]         # Seed specific language
  node masterSeed.js --help            # Show this help

Available languages:
  javascript, html, css, react, python, sql, dart, flutter, express, typescript, reactnative, json

Examples:
  node masterSeed.js                    # Seed all questions
  node masterSeed.js javascript         # Seed only JavaScript questions
  node masterSeed.js react              # Seed only React questions
`);
    process.exit(0);
  } else {
    seedSpecificLanguage(command);
  }
} else {
  seedAllQuestions();
}

module.exports = { seedAllQuestions, seedSpecificLanguage };