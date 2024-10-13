import React, { useState } from 'react';
import ChatInterface from  './components/ChatInterface.js';
import { ArrowLeftRight } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import './App.css'
const App: React.FC = () => {
  const [view, setView] = useState<'chat' | 'admin'>('chat');

  const handleSwitchView = () => {
    setView(view === 'chat' ? 'admin' : 'chat');
  };

  return (
    <div className="App">
      <button className="button-cnt" onClick={handleSwitchView} type="submit">
        
        <ArrowLeftRight size={20}/>
      </button> 
      {view === 'chat' ? <ChatInterface  /> : <AdminPanel />}
    </div>
  );
};

export default App;



 

