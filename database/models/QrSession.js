// database/models/QrSession.js
import mongoose from "mongoose";

const QrSessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

QrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.QrSession ||
  mongoose.model("QrSession", QrSessionSchema);
