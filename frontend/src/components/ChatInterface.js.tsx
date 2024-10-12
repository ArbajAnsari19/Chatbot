import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addResponse } from '../features/chatSlice';
import { RootState } from '../utils/Store';
import axios from 'axios';
import { Send, Save } from 'lucide-react';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.chat.history);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const handleSaveChat = async (item:any) => {
    try {
      await axios.post('https://chatbotb-esu1lichr-arbajansari19s-projects.vercel.app/api/save-chat', {
        query: item.query,
        response: {
          summary: item.summary,
          result_text: item.response,
          result_table_path: item.result_table_path,
          result_visualization_path: item.result_visualization_path,
        },
      });
      alert('Chat saved successfully!');
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Failed to save chat. Please try again.');
    }
  };
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const res = await axios.post('https://chatbotb-esu1lichr-arbajansari19s-projects.vercel.app/api/llm', { query, sessionId });
      const response = res.data;

      if (response.error) {
        setErrorMessage(response.error);
        return;
      }

      dispatch(addResponse({
        id: new Date().toISOString(),
        query,
        response: response.result_text,
        summary: response.summary,
        result_table_path: response.result_table_path,
        result_visualization_path: response.result_visualization_path,
      }));

      setSessionId(response.sessionId || sessionId);
      setErrorMessage('');
      setQuery('');
    } catch (error) {
      console.error('Error fetching response:', error);
      setErrorMessage('Failed to get a response from the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    return text.split(/\n+/).map((line, index) => {
      // Handle bold text
      const formattedLine = line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx}>{part.slice(1, -1)}</em>;
        }
        
        return part;
      });
  
      // Handle bullet points with indentation
      if (line.startsWith('- ')) {
        return (
          <div key={index} style={{ marginLeft: '20px', marginBottom: '10px' }}>
            • {formattedLine}
          </div>
        );
      }
  
      // Handle headings (## or ###)
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} style={{ marginTop: '20px', marginBottom: '10px' }}>
            {formattedLine}
          </h2>
        );
      }
  
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} style={{ marginTop: '15px', marginBottom: '10px' }}>
            {formattedLine}
          </h3>
        );
      }
  
      // Default paragraph handling with spacing
      return (
        <p key={index} style={{ marginTop: '10px', marginBottom: '10px' }}>
          {formattedLine}
        </p>
      );
    });
  };
  

  return (
    <div className="chatbot-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <h2 className="sidebar-title">Chat History</h2>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <p className="history-query">{item.query}</p>
                <p className="history-summary">{item.summary}</p>
                <button className="save-button" title="Save Response" onClick={() => handleSaveChat(item)}>
                Save this Response<Save size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        <div className="chat-body" ref={chatBodyRef}>
          {history.map((item) => (
            <div key={item.id} className="message-container">
              <div className="user-message">
                <div className="message-content">
                  <p>{formatMessage(item.query)}</p>
                </div>
              </div>
              <div className="bot-message">
                <div className="message-content">
                  <p>{formatMessage(item.response)}</p>
                  <p><b>Summary: </b>{formatMessage(item.summary)}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="dot-spinner">
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
            </div>
          )}
          {errorMessage && (
            <div className="error-message" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="input-container">
            <input
              type="text"
              className="chat-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button
              className="send-button"
              onClick={handleSend}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
