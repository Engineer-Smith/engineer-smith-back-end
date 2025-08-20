// /models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  loginId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    sparse: true, // Allows null/undefined, but if present must be unique
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        // Only validate if email is provided
        if (!email) return true;
        return /\S+@\S+\.\S+/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  hashedPassword: {
    type: String,
    required: function () {
      return !this.isSSO; // Required for non-SSO users
    },
  },
  ssoId: {
    type: String,
    sparse: true, // Allows null for non-SSO users
    unique: true, // Ensure unique ssoId
  },
  ssoToken: {
    type: String,
    sparse: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'student'],
    required: true,
  },
  isSSO: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes - only define here, not in field definitions
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });

// Static method to find user by username or email
userSchema.statics.findByLoginCredential = function(loginCredential) {
  const User = this;
  
  // Check if loginCredential looks like an email
  const isEmail = /\S+@\S+\.\S+/.test(loginCredential);
  
  if (isEmail) {
    // Search by email
    return User.findOne({ email: loginCredential.toLowerCase() });
  } else {
    // Search by username (loginId)
    return User.findOne({ loginId: loginCredential.toLowerCase() });
  }
};

// Update updatedAt on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('User', userSchema);