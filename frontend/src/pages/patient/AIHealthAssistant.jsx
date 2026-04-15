import { useState } from 'react';
import './AIHealthAssistant.css';

// Simple SVG Icons (no external dependency)
const MessageCircleIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PillIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your MediConnect AI Health Assistant. I can help you analyze symptoms, answer health questions, and recommend which specialist to see. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [mode, setMode] = useState('symptoms'); // 'symptoms' or 'questions'

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = mode === 'symptoms' 
        ? 'http://localhost:5003/api/ai-assistant/analyze-symptoms'
        : 'http://localhost:5003/api/ai-assistant/health-question';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: input,
          question: input,
          conversationHistory,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const result = await response.json();
      const analysisData = result.data.analysis || result.data.response || 'No response received';
      
      // Update conversation history for multi-turn
      setConversationHistory(result.data.conversationHistory || []);

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: typeof analysisData === 'object' 
          ? JSON.stringify(analysisData, null, 2)
          : analysisData,
        isAnalysis: typeof analysisData === 'object',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `Sorry, I couldn't process your request: ${error.message}`,
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg) => {
    if (msg.isAnalysis) {
      try {
        const data = JSON.parse(msg.content);
        return (
          <div className="analysis-box">
            {data.conditions && (
              <div className="analysis-section">
                <h4>📋 Possible Conditions:</h4>
                <p>{data.conditions}</p>
              </div>
            )}
            {data.specialty && (
              <div className="analysis-section">
                <h4>👨‍⚕️ Recommended Specialist:</h4>
                <p><strong>{data.specialty}</strong></p>
              </div>
            )}
            {data.urgency && (
              <div className={`analysis-section urgency-${data.urgency.toLowerCase()}`}>
                <h4>⏱️ Urgency Level:</h4>
                <p><strong>{data.urgency}</strong></p>
              </div>
            )}
            {data.tips && (
              <div className="analysis-section">
                <h4>💡 Health Tips:</h4>
                <p>{data.tips}</p>
              </div>
            )}
            {data.disclaimer && (
              <div className="disclaimer-box">
                <AlertCircleIcon />
                <p>{data.disclaimer}</p>
              </div>
            )}
          </div>
        );
      } catch {
        return <p>{msg.content}</p>;
      }
    }

    return msg.isError ? (
      <div className="error-message">{msg.content}</div>
    ) : (
      <p>{msg.content}</p>
    );
  };

  return (
    <div className="ai-health-assistant">
      <div className="assistant-header">
        <div className="header-top">
          <MessageCircleIcon />
          <div>
            <h2>AI Health Assistant</h2>
            <p>Powered by Claude AI</p>
          </div>
        </div>

        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'symptoms' ? 'active' : ''}`}
            onClick={() => setMode('symptoms')}
          >
            <PillIcon />
            Analyze Symptoms
          </button>
          <button
            className={`mode-btn ${mode === 'questions' ? 'active' : ''}`}
            onClick={() => setMode('questions')}
          >
            <MessageCircleIcon />
            Ask Questions
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="avatar assistant-avatar">🤖</div>
            )}
            <div className="message-content">
              {renderMessage(msg)}
            </div>
            {msg.role === 'user' && (
              <div className="avatar user-avatar">👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <div className="avatar assistant-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'symptoms' 
            ? 'Describe your symptoms...' 
            : 'Ask a health question...'}
          disabled={loading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          <SendIcon />
        </button>
      </form>

      <div className="assistant-footer">
        <p>⚠️ This is not medical advice. Always consult a real doctor for diagnosis.</p>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
