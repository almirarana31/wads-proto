import React from 'react';
import { Text, SmallText } from './text';

function ChatBubble({ message, sender = 'user', senderName = '', isSender = false, timestamp, showSender = true }) {
  // Use isSender if provided, otherwise fall back to sender check
  const isFromCurrentUser = isSender !== undefined ? isSender : sender === 'user';
  
  // Determine display name
  const displayName = isFromCurrentUser ? 'You' : (senderName || sender);

  return (    
  <div className={`mb-2 flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
      {showSender && (
        <SmallText 
          weight="semibold" 
          className={`mb-1 ${isFromCurrentUser ? 'text-blue-700' : 'text-gray-600'}`}
        >
          {displayName}
        </SmallText>
      )}
      <div
        className={`px-4 py-2 rounded-2xl shadow-md max-w-xs break-words ${
          isFromCurrentUser
            ? 'bg-blue-700 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-800 rounded-bl-sm'
        }`}
      >
        {message}
      </div>
      {timestamp && (
        <SmallText 
          className={`mt-1 ${isFromCurrentUser ? 'text-right text-gray-400' : 'text-left text-gray-500'}`}
        >
          {timestamp}
        </SmallText>
      )}
    </div>
  );
}

export default ChatBubble;