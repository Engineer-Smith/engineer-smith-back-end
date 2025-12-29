// /seeds/masterChallengeSeeder.js - Clean master seeder importing challenge data
const mongoose = require('mongoose');
const path = require('path');

// Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import challenge data
const { javascriptChallenges } = require('./data/javascriptChallenges');
const { pythonChallenges } = require('./data/pythonChallenges');
const { dartChallenges } = require('./data/dartChallenges');

class CodeChallengeMasterSeeder {
  constructor() {
    this.adminUser = null;
  }

  async getAdminUser() {
    if (this.adminUser) return this.adminUser;
    
    const User = require('../models/User');
    const Organization = require('../models/Organization');
    
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) {
      throw new Error('Super organization not found. Please create one first.');
    }

    this.adminUser = await User.findOne({ 
      organizationId: superOrg._id, 
      role: 'admin' 
    });
    
    if (!this.adminUser) {
      throw new Error('Admin user not found in super organization. Please create one first.');
    }
    
    console.log(`👤 Using admin user: ${this.adminUser.firstName} ${this.adminUser.lastName}`);
    return this.adminUser;
  }

  // JavaScript challenges
  getJavaScriptChallenges() {
    return javascriptChallenges;
  }

  // Python challenges
  getPythonChallenges() {
    return pythonChallenges;
  }

  // Dart challenges
  getDartChallenges() {
    return dartChallenges;
  }

  async seedLanguage(languageName, challenges) {
    console.log(`📝 Seeding ${languageName} challenges (${challenges.length} challenges)...`);
    
    try {
      const CodeChallenge = require('../models/CodeChallenge');
      const adminUser = await this.getAdminUser();
      
      // Add createdBy to each challenge and generate unique slugs
      const challengesWithUser = challenges.map((challenge, index) => {
        // Generate slug from title (same logic as the model's pre-save hook)
        let baseSlug = challenge.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Ensure uniqueness by adding language and index
        const uniqueSlug = `${baseSlug}-${languageName.toLowerCase()}-${index + 1}`;
        
        return {
          ...challenge,
          createdBy: adminUser._id,
          slug: uniqueSlug
        };
      });
      
      const startTime = Date.now();
      const result = await CodeChallenge.insertMany(challengesWithUser);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`✅ ${languageName}: ${result.length}/${challenges.length} challenges (${duration}s)`);
      return result.length;
      
    } catch (error) {
      console.log(`❌ ${languageName} seeding failed: ${error.message}`);
      return 0;
    }
  }

  async clearChallenges() {
    const CodeChallenge = require('../models/CodeChallenge');
    
    console.log('🧹 Clearing existing challenges...');
    const count = await CodeChallenge.countDocuments();
    
    if (count > 0) {
      await CodeChallenge.deleteMany({});
      console.log(`✅ Deleted ${count} existing challenges`);
    } else {
      console.log('✅ No existing challenges to clear');
    }
  }

  async seedAllChallenges() {
    let connection = null;
    
    try {
      console.log('🚀 Starting code challenge seeding...\n');
      
      connection = await mongoose.connect(process.env.MONGO_URL);
      console.log('✅ Connected to MongoDB\n');
      
      await this.clearChallenges();
      console.log(''); // Add spacing
      
      const startTime = Date.now();
      const results = {
        javascript: 0,
        python: 0,
        dart: 0
      };
      
      // Seed each language
      results.javascript = await this.seedLanguage('JavaScript', this.getJavaScriptChallenges());
      results.python = await this.seedLanguage('Python', this.getPythonChallenges());
      results.dart = await this.seedLanguage('Dart', this.getDartChallenges());
      
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      const totalChallenges = results.javascript + results.python + results.dart;
      
      console.log('\\n🎉 CODE CHALLENGE SEEDING COMPLETED!');
      console.log('\\n📊 RESULTS SUMMARY:');
      console.log(`   JavaScript: ${results.javascript} challenges`);
      console.log(`   Python: ${results.python} challenges`);
      console.log(`   Dart: ${results.dart} challenges`);
      console.log(`   Total: ${totalChallenges} challenges`);
      console.log(`   Time: ${totalDuration} seconds`);
      
      if (totalChallenges > 0) {
        console.log('\\n🎯 Code challenge platform ready!');
      }
      
      return totalChallenges;
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    } finally {
      if (connection) {
        await mongoose.disconnect();
        console.log('\\n🔌 Disconnected from MongoDB');
      }
    }
  }

  async seedSpecificLanguage(languageName) {
    let connection = null;
    
    try {
      const languageMap = {
        'javascript': { challenges: this.getJavaScriptChallenges() },
        'js': { challenges: this.getJavaScriptChallenges() },
        'python': { challenges: this.getPythonChallenges() },
        'py': { challenges: this.getPythonChallenges() },
        'dart': { challenges: this.getDartChallenges() }
      };
      
      const normalizedName = languageName.toLowerCase();
      const language = languageMap[normalizedName];
      
      if (!language) {
        console.error(`❌ Unknown language: ${languageName}`);
        console.log('\\n📚 Available languages: javascript, python, dart');
        process.exit(1);
      }
      
      connection = await mongoose.connect(process.env.MONGO_URL);
      console.log(`🚀 Seeding ${languageName} challenges...\\n`);
      
      const count = await this.seedLanguage(languageName, language.challenges);
      console.log(`\\n✅ Successfully seeded ${count} ${languageName} challenges`);
      
      return count;
      
    } catch (error) {
      console.error(`❌ Error seeding ${languageName}:`, error.message);
      throw error;
    } finally {
      if (connection) {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
      }
    }
  }
}

// CLI handling (same pattern as your question seeder)
const args = process.argv.slice(2);
const seeder = new CodeChallengeMasterSeeder();

if (args.length === 0) {
  seeder.seedAllChallenges()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Master seeding failed:', error.message);
      process.exit(1);
    });
} else {
  const command = args[0].toLowerCase();
  
  switch (command) {
    case '--help':
    case '-h':
    case 'help':
      console.log(`
📚 CODE CHALLENGE SEEDER

Usage:
  node masterChallengeSeeder.js                # Seed all languages
  node masterChallengeSeeder.js [language]     # Seed specific language
  node masterChallengeSeeder.js --help         # Show this help

Available Languages:
  • javascript (js)     - ${javascriptChallenges.length} challenges
  • python (py)         - ${pythonChallenges.length} challenges  
  • dart                - ${dartChallenges.length} challenges

Total: ${javascriptChallenges.length + pythonChallenges.length + dartChallenges.length} challenges across 3 languages

Examples:
  node masterChallengeSeeder.js                # Seed all ${javascriptChallenges.length + pythonChallenges.length + dartChallenges.length} challenges
  node masterChallengeSeeder.js javascript     # Seed only JavaScript challenges
  node masterChallengeSeeder.js python         # Seed only Python challenges
      `);
      process.exit(0);
      break;
      
    default:
      seeder.seedSpecificLanguage(command)
        .then(() => process.exit(0))
        .catch(error => {
          console.error(`💥 Failed to seed ${command}:`, error.message);
          process.exit(1);
        });
  }
}

module.exports = seeder;