const mongoose = require('mongoose');

const ChatResponseSchema = new mongoose.Schema({
  query: String,
  response: {
    summary: String,
    result_text: String,
    result_table_path: String,
    result_visualization_path: String,
    error: String
  },
  timestamp: { type: Date, default: Date.now },
});

const ChatResponse = mongoose.model('ChatResponse', ChatResponseSchema);

module.exports = ChatResponse;
