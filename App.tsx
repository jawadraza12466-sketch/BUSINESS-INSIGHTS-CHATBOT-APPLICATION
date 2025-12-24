import React, { useState, useRef, useEffect } from 'react';
import { Industry, BusinessMetrics, ChatMessage } from './types';
import { INITIAL_METRICS, DEFAULT_INDUSTRY, SAMPLE_QUESTIONS } from './constants';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';
import TypingIndicator from './components/TypingIndicator';
import { sendMessageStream, initializeChat } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [industry, setIndustry] = useState<Industry>(DEFAULT_INDUSTRY);
  const [metrics, setMetrics] = useState<BusinessMetrics>(INITIAL_METRICS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    initializeChat();
    setMessages([{
      id: 'init',
      role: 'model',
      text: "Hello! I'm your Business Insights Assistant. I can help analyze your performance, create SWOT reports, or suggest growth strategies.\n\nTo get started, tell me about your current business challenges or select a sample question below. Don't forget to update your metrics in the sidebar for more accurate insights!",
      timestamp: Date.now()
    }]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isStreaming) return;

    // Add User Message
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsStreaming(true);

    // Placeholder for AI Message
    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: "",
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, newAiMsg]);

    // Stream Response
    try {
      await sendMessageStream(text, industry, metrics, (currentText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, text: currentText } : msg
        ));
      });
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
      ));
      // Focus back on input for desktop
      if (window.innerWidth > 768) {
          inputRef.current?.focus();
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    initializeChat(); // Reset the AI context history
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: "Conversation cleared. How can I help you next?",
      timestamp: Date.now()
    }]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSampleClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        industry={industry}
        setIndustry={setIndustry}
        metrics={metrics}
        setMetrics={setMetrics}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClearChat={handleClearChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
           <div className="flex items-center gap-3">
             <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <div>
                <h2 className="text-lg font-bold text-gray-800">Business Analyst</h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  AI-powered insights for <span className="font-semibold text-indigo-600">{industry}</span>
                </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
               <span className="w-2 h-2 mr-1.5 bg-green-400 rounded-full"></span>
               Online
             </span>
           </div>
        </header>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {isStreaming && messages[messages.length - 1]?.role !== 'model' && (
               <TypingIndicator />
            )}
            
            <div ref={messagesEndRef} />
            
            {/* Sample Questions (Only show if few messages) */}
            {messages.length < 3 && !isStreaming && (
               <div className="mt-8">
                  <p className="text-center text-gray-400 text-sm mb-4">Try asking about...</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSampleClick(q)}
                        className="bg-white text-indigo-600 border border-indigo-100 px-4 py-2 rounded-full text-sm hover:bg-indigo-50 hover:shadow-sm transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </main>

        {/* Input Area */}
        <footer className="bg-white border-t border-gray-200 p-4 md:p-6">
           <div className="max-w-4xl mx-auto flex gap-2 md:gap-4 relative">
             <input
               ref={inputRef}
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Ask for business advice..."
               disabled={isStreaming}
               className="flex-1 border border-gray-300 rounded-full px-6 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 shadow-sm"
             />
             <button
               onClick={() => handleSendMessage()}
               disabled={!inputValue.trim() || isStreaming}
               className="bg-indigo-600 text-white rounded-full p-3 md:px-6 md:py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors flex items-center justify-center min-w-[3rem]"
             >
               <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
               <span className="hidden md:inline">Send</span>
             </button>
           </div>
           <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">AI can make mistakes. Please verify important financial data.</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;