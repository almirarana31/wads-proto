import React from 'react';
import { Text, SmallText } from './text';

function ChatBubble({ message, sender = 'user', timestamp, showSender = true }) {
  const isUser = sender === 'user';

  return (    <div className={`mb-2 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {showSender && (
        <SmallText 
          weight="semibold" 
          className={`mb-1 ${isUser ? 'text-blue-700' : 'text-gray-600'}`}
        >
          {sender === 'user' ? 'You' : sender}
        </SmallText>
      )}
      <div
        className={`px-4 py-2 rounded-2xl shadow-md max-w-xs break-words ${
          isUser
            ? 'bg-blue-700 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-800 rounded-bl-sm'
        }`}
      >
        {message}
      </div>
      {timestamp && (
        <SmallText 
          className={`mt-1 ${isUser ? 'text-right text-gray-400' : 'text-left text-gray-500'}`}
        >
          {timestamp}
        </SmallText>
      )}
    </div>
  );
}

export default ChatBubble;