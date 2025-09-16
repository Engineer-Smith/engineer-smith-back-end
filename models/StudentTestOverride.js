// /models/StudentTestOverride.js
const { Schema, model } = require('mongoose');

const studentTestOverrideSchema = new Schema({
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
  extraAttempts: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    trim: true,
  },
  grantedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date, // Optional expiration
    default: null,
  }
});

// Compound unique index - one override per user per test
studentTestOverrideSchema.index({ userId: 1, testId: 1 }, { unique: true });
studentTestOverrideSchema.index({ organizationId: 1 });

module.exports = model('StudentTestOverride', studentTestOverrideSchema);