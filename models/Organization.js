// /models/Organization.js
const { Schema, model } = require('mongoose');

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isSuperOrg: {
    type: Boolean,
    default: false,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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

// Index for isSuperOrg
organizationSchema.index({ isSuperOrg: 1 });

// Update updatedAt on save
organizationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('Organization', organizationSchema);