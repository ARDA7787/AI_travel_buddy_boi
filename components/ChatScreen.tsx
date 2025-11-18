

import React, { useState, useRef, useEffect } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import type { Message, RichCard, GroundingSource } from '../types';
import Icon from './Icon';
import { parseMarkdown } from '../lib/markdown';

interface ChatMessageProps {
  message: Message;
  onAddToItinerary: (card: RichCard) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddToItinerary }) => {
  const isAssistant = message.role === 'assistant';
  
  const handleAdd = () => {
    if (message.richCard) {
      onAddToItinerary(message.richCard);
    }
  };

  return (
    <div className={`flex items-end gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-3 ${isAssistant ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
        <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />
        {message.richCard && (
          <div className="mt-3 bg-white rounded-lg overflow-hidden border border-gray-300">
            <img src={message.richCard.imageUrl} alt={message.richCard.title} className="w-full h-32 object-cover" />
            <div className="p-3">
              <h4 className="font-semibold text-gray-900">{message.richCard.title}</h4>
              <p className="text-xs text-gray-500">Rating: {message.richCard.rating} ★</p>
              <p className="text-xs text-gray-600 mt-1">{message.richCard.description}</p>
              <button onClick={handleAdd} className="text-xs mt-3 w-full text-center bg-blue-100 text-blue-700 font-semibold py-1.5 rounded-md hover:bg-blue-200">
                Add to Itinerary
              </button>
            </div>
          </div>
        )}
        {message.grounding && message.grounding.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <h5 className="text-xs font-semibold text-gray-600 mb-2">Sources:</h5>
            <div className="space-y-1.5">
              {message.grounding.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                >
                  <Icon name={source.type === 'maps' ? 'google_pin' : 'google'} className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatScreen: React.FC = () => {
  const { messages, sendMessage, isLoading, activeTrip, addActivityFromRichCard } = useTravelData();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && activeTrip) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onAddToItinerary={addActivityFromRichCard} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-end gap-2 justify-start">
                <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-3 bg-gray-200 text-gray-800 rounded-bl-none">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTrip ? "Ask anything..." : "Select a trip to chat"}
            className="flex-1 w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!activeTrip}
          />
          <button type="submit" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300" disabled={!input.trim() || isLoading || !activeTrip}>
            <Icon name="send" className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;