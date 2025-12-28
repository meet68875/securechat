// src/database/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, 
    },

    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    identityPublicKey: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    encryptedPrivateKey: { 
      type: String, 
      select: false // Security: Only fetch when explicitly asked
    },
    keySalt: { type: String, select: false },
    keyIv: { type: String, select: false },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔐 PASSWORD HASHING
//
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// 🔐 PASSWORD COMPARISON
//
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// 🔐 REMOVE SENSITIVE FIELDS FROM JSON
//
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
