import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, clearChatHistory, getStudyPlans } from '../utils/api';

export default function AIChatTutor() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [subject, setSubject] = useState('');
  const [plans, setPlans] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchPlans = async () => {
    try {
      const data = await getStudyPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    // Add user message immediately
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    try {
      const response = await sendChatMessage(userMessage, subject, { chatId });
      setChatId(response.chatId);
      setChatHistory(response.history);
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (chatId) {
      try {
        await clearChatHistory(chatId);
      } catch (err) {
        console.error('Failed to clear chat:', err);
      }
    }
    setChatHistory([]);
    setChatId(null);
  };

  const suggestedQuestions = [
    "Can you explain this concept to me?",
    "I'm stuck on a problem, can you help?",
    "Show me an example of how this works",
    "What are the key points I should remember?",
    "How does this relate to other topics?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Chat Tutor</h1>
        <p className="text-gray-600">Ask questions about your study topics and get instant help</p>
      </div>

      {/* Subject Selector */}
      <div className="card mb-4">
        <label className="label">Select Subject (Optional)</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field"
        >
          <option value="">General Topics</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.subject}>{plan.subject}</option>
          ))}
        </select>
      </div>

      {/* Chat Container */}
      <div className="card mb-4" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Start a Conversation</h3>
              <p className="text-gray-500 mb-6">Ask me anything about your studies!</p>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try asking:</p>
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(q)}
                    className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🤖</span>
                      <span className="font-semibold text-blue-600">AI Tutor</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">🤖</div>
                  <span className="text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Clear Chat Button */}
      {chatHistory.length > 0 && (
        <button
          onClick={handleClearChat}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Clear Chat History
        </button>
      )}

      {/* Tips */}
      <div className="mt-6 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips for Better Answers</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Be specific about what you want to learn</li>
          <li>• Ask for examples when concepts are unclear</li>
          <li>• Request step-by-step explanations for complex topics</li>
          <li>• Don't hesitate to ask follow-up questions</li>
        </ul>
      </div>
    </div>
  );
}
