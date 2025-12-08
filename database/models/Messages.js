const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // 🎯 E2EE CONTENT: Store the encrypted text blob
    encryptedContent: {
      type: String, 
      required: true,
    },
   
    e2eMetadata: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    },
    
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
module.exports = Message;