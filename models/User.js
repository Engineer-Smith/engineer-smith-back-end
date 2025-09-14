// /models/User.js - UPDATED with firstName and lastName
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
    sparse: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true;
        return /\S+@\S+\.\S+/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  // NEW: First and Last Name fields
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  hashedPassword: {
    type: String,
    required: function () {
      return !this.isSSO;
    },
  },
  ssoId: {
    type: String,
    sparse: true,
    unique: true,
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

// Indexes
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });
// NEW: Index for name searches
userSchema.index({ lastName: 1, firstName: 1 });

// NEW: Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// NEW: Virtual for display name (Last, First format)
userSchema.virtual('displayName').get(function() {
  return `${this.lastName}, ${this.firstName}`;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Static method to find user by username or email
userSchema.statics.findByLoginCredential = function(loginCredential) {
  const User = this;
  const isEmail = /\S+@\S+\.\S+/.test(loginCredential);
  
  if (isEmail) {
    return User.findOne({ email: loginCredential.toLowerCase() });
  } else {
    return User.findOne({ loginId: loginCredential.toLowerCase() });
  }
};

// NEW: Static method to search users by name
userSchema.statics.searchByName = function(searchTerm, organizationId, role) {
  const User = this;
  const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search
  
  const query = {
    organizationId,
    $or: [
      { firstName: regex },
      { lastName: regex },
      { loginId: regex }
    ]
  };
  
  if (role) {
    query.role = role;
  }
  
  return User.find(query).sort({ lastName: 1, firstName: 1 });
};

// Update updatedAt on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('User', userSchema);