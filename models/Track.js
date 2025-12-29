// /models/Track.js - Organized learning paths for code challenges
const { Schema, model } = require('mongoose');

const trackSchema = new Schema({
  // Track identification
  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    required: false, // FIXED: Changed to false to allow auto-generation
    lowercase: true
  },

  description: {
    type: String,
    required: true
  },

  // Track metadata
  language: {
    type: String,
    enum: ['javascript', 'python', 'dart'],
    required: true
  },

  category: {
    type: String,
    enum: [
      'beginner',
      'intermediate', 
      'advanced',
      'data-structures',
      'algorithms',
      'dynamic-programming',
      'graphs',
      'trees',
      'arrays',
      'strings',
      'linked-lists',
      'stacks-queues',
      'sorting-searching',
      'math',
      'greedy',
      'backtracking',
      'bit-manipulation',
      'design',
      'interview-prep'
    ],
    required: true
  },

  // Track difficulty and requirements
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },

  estimatedHours: {
    type: Number,
    required: true
  },

  // Prerequisites
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Track'
  }],

  // Learning objectives
  learningObjectives: [String],

  // Ordered list of challenges in this track
  challenges: [{
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'CodeChallenge',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    unlockAfter: {
      type: Number,
      default: 0 // How many previous challenges must be completed to unlock this one
    }
  }],

  // Track statistics
  stats: {
    totalEnrolled: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // in hours
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },

  // Track content
  iconUrl: String,
  bannerUrl: String,
  
  // Track settings
  isActive: {
    type: Boolean,
    default: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Admin fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
trackSchema.index({ language: 1, category: 1 });
trackSchema.index({ difficulty: 1 });
trackSchema.index({ isActive: 1, isFeatured: 1 });
trackSchema.index({ slug: 1 });
trackSchema.index({ 'stats.rating': -1 });
trackSchema.index({ 'stats.totalEnrolled': -1 });

// Compound indexes
trackSchema.index({ language: 1, difficulty: 1 });
trackSchema.index({ isActive: 1, language: 1, category: 1 });

// Pre-save middleware - IMPROVED
trackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-generate slug if not provided - improved version
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')         // Replace spaces with dashes
      .replace(/-+/g, '-')          // Replace multiple dashes with single
      .replace(/^-|-$/g, '')        // Remove leading/trailing dashes
      .trim();
  }
  
  // Ensure slug exists - fallback generation
  if (!this.slug) {
    this.slug = `track-${Date.now()}`;
  }
  
  // Sort challenges by order
  if (this.challenges && this.challenges.length > 0) {
    this.challenges.sort((a, b) => a.order - b.order);
  }
  
  next();
});

// Instance methods - FIXED: Removed syncTrackReferences calls
trackSchema.methods.addChallenge = async function(challengeId, order, isOptional = false, unlockAfter = 0) {
  // Check if challenge already exists
  const existingIndex = this.challenges.findIndex(c => c.challengeId.toString() === challengeId.toString());
  
  if (existingIndex !== -1) {
    // Update existing
    this.challenges[existingIndex].order = order;
    this.challenges[existingIndex].isOptional = isOptional;
    this.challenges[existingIndex].unlockAfter = unlockAfter;
  } else {
    // Add new
    this.challenges.push({
      challengeId,
      order,
      isOptional,
      unlockAfter
    });
  }
  
  await this.save();
  
  return this;
};

trackSchema.methods.removeChallenge = async function(challengeId) {
  this.challenges = this.challenges.filter(c => c.challengeId.toString() !== challengeId.toString());
  await this.save();
  
  return this;
};

trackSchema.methods.updateStats = function(enrolled, completed, rating = null) {
  if (enrolled) this.stats.totalEnrolled++;
  if (completed) this.stats.totalCompleted++;
  
  if (this.stats.totalEnrolled > 0) {
    this.stats.completionRate = (this.stats.totalCompleted / this.stats.totalEnrolled) * 100;
  }
  
  if (rating !== null) {
    const currentTotal = this.stats.rating * this.stats.totalRatings;
    this.stats.totalRatings++;
    this.stats.rating = (currentTotal + rating) / this.stats.totalRatings;
  }
  
  return this.save();
};

// Static methods
trackSchema.statics.findByLanguage = function(language) {
  return this.find({ language, isActive: true }).sort({ difficulty: 1, createdAt: 1 });
};

trackSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ language: 1, difficulty: 1 });
};

trackSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true }).sort({ 'stats.rating': -1 });
};

trackSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'stats.totalEnrolled': -1, 'stats.rating': -1 })
    .limit(limit);
};

// Virtual for progress calculation
trackSchema.virtual('totalChallenges').get(function() {
  return this.challenges.length;
});

trackSchema.virtual('requiredChallenges').get(function() {
  return this.challenges.filter(c => !c.isOptional).length;
});

// Virtual for URL-friendly path
trackSchema.virtual('path').get(function() {
  return `/tracks/${this.language}/${this.slug}`;
});

// Ensure virtuals are included in JSON output
trackSchema.set('toJSON', { virtuals: true });
trackSchema.set('toObject', { virtuals: true });

module.exports = model('Track', trackSchema);