// src/database/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const PreKeySchema = new mongoose.Schema(
  {
    keyId: {
      type: Number,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null, // helps prevent reuse
    },
  },
  { _id: false }
);

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
      select: false, // 🔐 never return by default
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

    // 🔐 E2EE — identity key (public only)
    identityPublicKey: {
      type: String,
      default: null,
    },

    // 🔐 E2EE — one-time prekeys
    preKeys: [PreKeySchema],

    isActive: {
      type: Boolean,
      default: true,
    },

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
