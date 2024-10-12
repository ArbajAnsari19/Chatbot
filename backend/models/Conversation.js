const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  context: { type: String, required: true },
});

module.exports = mongoose.model('Conversation', ConversationSchema);