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

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin Panel - Saved User Responses</h2>
      <div className="chat-list">
        {savedChats.map((chat) => (
          <div key={chat._id} className="chat-card">
            <p className="chat-query">
              <strong>Query:</strong> {chat.query}
            </p>
            <p className="chat-response">
              <strong>Response:</strong> {chat.response.result_text}
            </p>
            <p className="chat-summary">
              <strong>Summary:</strong> {chat.response.summary}
            </p>
          </div>
        ))}
      </div>
      <button className="back-button" onClick={() => window.location.href = '/chat'}>
        Back to Chat
      </button>
    </div>
  );
};

export default AdminPanel;
