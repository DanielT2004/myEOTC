import React, { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { askFaithQuestion } from '../services/geminiService';

export const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Peace be with you. Ask me about Ethiopian Orthodox traditions, holidays, or church etiquette.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userText = query;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setIsLoading(true);

    const answer = await askFaithQuestion(userText);
    
    setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200">
          <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold flex items-center">
               <MessageCircle className="h-4 w-4 mr-2" /> Faith Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 rounded-full p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-gray-200">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Timkat, fasting..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !query.trim()}
                className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
