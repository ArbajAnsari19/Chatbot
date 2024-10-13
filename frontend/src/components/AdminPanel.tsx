import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SavedChat {
  _id: string;
  query: string;
  response: {
    summary: string;
    result_text: string;
    result_table_path: string;
    result_visualization_path: string;
  };
}

const AdminPanel: React.FC = () => {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  useEffect(() => {
    fetchSavedChats();
  }, []);

  const fetchSavedChats = async () => {
    try {
      const response = await axios.get('https://chatbot-1-clxz.onrender.com/api/saved-chats');
      setSavedChats(response.data);
    } catch (error) {
      console.error('Error fetching saved chats:', error);
    }
  };

  // Utility function to replace markdown-like syntax with HTML equivalents
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Replaces **text** with <strong>text</strong>
      .replace(/##(.*?)##/g, '<h2>$1</h2>')  // Replaces ##text## with <h2>text</h2>
      .replace(/\n/g, '<br />'); // Replaces newlines with <br />
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin Panel - Saved User Responses</h2>
      <div className="chat-list">
        {savedChats.map((chat) => (
          <div key={chat._id} className="chat-card">
            <p className="chat-query">
              <strong>Query:</strong> {chat.query}
            </p>
            <div
              className="chat-response"
              dangerouslySetInnerHTML={{ __html: formatText(chat.response.result_text) }}
            ></div>
            <p className="chat-summary">
              <strong>Summary:</strong> {chat.response.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
