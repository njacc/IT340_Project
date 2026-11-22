'use strict';

const mongoose = require('mongoose');

// One document per logged-in browser. We store a hash of the session token,
// so even someone who can read the database can't reuse a session.
const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true }
});

// MongoDB deletes the document automatically once expiresAt has passed.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
