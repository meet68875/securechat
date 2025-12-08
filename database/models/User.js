// src/models/User.js (MODIFIED for E2EE)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 🎯 NEW: Identity Public Key for E2EE
    // Stored as a string (JSON stringified JWK or Base64 of the key)
    identityPublicKey: {
      type: String,
      required: false, // Make false if it's updated after registration
      default: null,
    },
    // 🎯 NEW: Array of One-Time Pre-Keys
    // The server needs to store the public halves and delete them after use.
    preKeys: [
      {
        keyId: { type: Number, required: true },
        publicKey: { type: String, required: true }, // The public key string
        // You may also want a timestamp to manage expiration
      },
    ],
    // --- Existing fields ---
    username: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Existing logic remains)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (Existing logic remains)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = User;