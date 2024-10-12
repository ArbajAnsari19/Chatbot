const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const ChatResponse = require('./models/ChatResponse');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Middleware
app.use(cors({ origin: '*' })); 
app.use(express.json());

app.get('/', (req,res)=>{
  res.send('hello')
});

// Endpoint to handle chat requests
app.post('/api/llm', async (req, res) => {
  const { query } = req.body;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiResponse = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: query }] }],
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const apiResponse = geminiResponse.data;
    let responseText = '';
    let summary = '';

    if (apiResponse && Array.isArray(apiResponse.candidates) && apiResponse.candidates.length > 0) {
      const candidate = apiResponse.candidates[0];

      if (candidate.content && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts[0].text;

        // Generate summary
        try {
          const summaryQuery = `Summarize this sentence: ${responseText}`;
          const summaryResponse = await axios.post(geminiUrl, {
            contents: [{ parts: [{ text: summaryQuery }] }]
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          if (summaryResponse.data && Array.isArray(summaryResponse.data.candidates) && 
              summaryResponse.data.candidates.length > 0 && 
              summaryResponse.data.candidates[0].content && 
              Array.isArray(summaryResponse.data.candidates[0].content.parts) && 
              summaryResponse.data.candidates[0].content.parts.length > 0) {
            summary = summaryResponse.data.candidates[0].content.parts[0].text;
          } else {
            summary = 'Unable to generate summary.';
          }
        } catch (summaryError) {
          console.error('Error generating summary:', summaryError);
          summary = 'Error generating summary.';
        }

      } else {
        responseText = 'Unable to parse response from Gemini API.';
      }
    } else {
      responseText = 'Unable to parse response from Gemini API.';
    }

    const structuredResponse = {
      summary: summary,
      result_text: responseText,
      result_table_path: '',
      result_visualization_path: '',
      error: responseText.includes('Unable to parse') ? 'Error occurred while parsing the Gemini API response.' : ''
    };

    // Send structured response back to the frontend
    res.json(structuredResponse);

  } catch (error) {
    console.error('Error fetching response from Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({
      summary: '',
      result_text: '',
      result_table_path: '',
      result_visualization_path: '',
      error: 'Failed to fetch response from Gemini API. ' + (error.message || 'Unknown error')
    });
  }
});

// New endpoint to save chat
app.post('/api/save-chat', async (req, res) => {
  const { query, response } = req.body;

  try {
    const newChatResponse = new ChatResponse({
      query: query,
      response: response,
    });

    await newChatResponse.save();
    res.json({ success: true, message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ success: false, error: 'Failed to save chat' });
  }
});

// New endpoint to get saved chats
app.get('/api/saved-chats', async (req, res) => {
  try {
    const savedChats = await ChatResponse.find().sort({ createdAt: -1 });
    res.json(savedChats);
  } catch (error) {
    console.error('Error fetching saved chats:', error);
    res.status(500).json({ error: 'Failed to fetch saved chats' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
