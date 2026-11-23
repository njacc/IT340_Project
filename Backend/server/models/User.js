'use strict';

const mongoose = require('mongoose');

// One document per account. We never store the real password, only its hash.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,      // stops two accounts with the same email
    lowercase: true,
    trim: true,
    maxlength: 254
  },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifyTokenHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
