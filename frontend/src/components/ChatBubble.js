import React from 'react';

function ChatBubble({ message, sender = 'user', timestamp, showSender = true }) {
  const isUser = sender === 'user';

  return (
    <div className={`mb-2 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {showSender && (
        <div className={`mb-1 text-xs font-semibold ${isUser ? 'text-blue-700' : 'text-gray-600'}`}>
          {sender === 'user' ? 'You' : sender}
        </div>
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
        <div className={`text-xs mt-1 ${isUser ? 'text-right text-gray-400' : 'text-left text-gray-500'}`}>
          {timestamp}
        </div>
      )}
    </div>
  );
}

export default ChatBubble;