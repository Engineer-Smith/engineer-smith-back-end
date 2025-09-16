// /models/AttemptRequest.js
const { Schema, model } = require('mongoose');

const attemptRequestSchema = new Schema({
  // Core request data
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  
  // Request details
  requestedAttempts: {
    type: Number,
    required: true,
    min: 1,
    max: 10, // Reasonable limit
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500,
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  
  // Response data
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // Prevent duplicate requests
  requestHash: {
    type: String,
    unique: true,
  }
});

// Indexes
attemptRequestSchema.index({ userId: 1, testId: 1 });
attemptRequestSchema.index({ status: 1, organizationId: 1 });
attemptRequestSchema.index({ reviewedBy: 1 });

// Generate unique hash to prevent duplicate requests
attemptRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    this.requestHash = `${this.userId}-${this.testId}-${Date.now()}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Method to approve request
attemptRequestSchema.methods.approve = async function(reviewerId, reviewNotes = '') {
  const StudentTestOverride = require('./StudentTestOverride');
  
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  
  await this.save();
  
  // Create the actual override
  const override = await StudentTestOverride.findOneAndUpdate(
    { userId: this.userId, testId: this.testId },
    {
      $inc: { extraAttempts: this.requestedAttempts },
      $set: {
        reason: `Request approved: ${this.reason}`,
        grantedBy: reviewerId,
        grantedAt: new Date(),
      }
    },
    { upsert: true, new: true }
  );
  
  return override;
};

// Method to reject request
attemptRequestSchema.methods.reject = function(reviewerId, reviewNotes = '') {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  return this.save();
};

module.exports = model('AttemptRequest', attemptRequestSchema);