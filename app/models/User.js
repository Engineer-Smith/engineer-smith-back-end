const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.ssoProvider; // Password required if no SSO
    }
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'instructor'],
    default: 'student'
  },
  ssoProvider: {
    type: String,
    enum: ['simplycoding', null],
    default: null
  },
  ssoId: String,
  profile: {
    firstName: String,
    lastName: String,
    organization: String
  },
  testHistory: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    score: Number,
    passed: Boolean,
    completedAt: Date,
    timeSpent: Number, // in seconds
    attempts: {
      type: Number,
      default: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  refreshToken: String,
  refreshTokenExpiry: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);