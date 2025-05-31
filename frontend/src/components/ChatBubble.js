import React from 'react';
import { Text, SmallText } from './text';

function ChatBubble({ message, sender = 'user', senderName = '', isSender = false, timestamp, showSender = true, isClosedConversation = false }) {
  // Use isSender if provided, otherwise fall back to sender check
  const isFromCurrentUser = isSender !== undefined ? isSender : sender === 'user';
  
  // Determine display name
  const displayName = isFromCurrentUser ? 'You' : (senderName || sender);

  // Adjust styles for closed conversations
  const bubbleStyle = isFromCurrentUser
    ? isClosedConversation
      ? 'bg-blue-500 text-white rounded-br-sm opacity-85' // Dimmed for closed
      : 'bg-blue-700 text-white rounded-br-sm'
    : isClosedConversation
      ? 'bg-gray-100 text-gray-600 rounded-bl-sm opacity-90' // Dimmed for closed
      : 'bg-gray-200 text-gray-800 rounded-bl-sm';

  return (    
    <div className={`mb-2 flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
      {showSender && (
        <SmallText 
          weight="semibold" 
          className={`mb-1 ${
            isFromCurrentUser 
              ? isClosedConversation 
                ? 'text-blue-500' 
                : 'text-blue-700'
              : isClosedConversation
                ? 'text-gray-500'
                : 'text-gray-600'
          }`}
        >
          {displayName}
        </SmallText>
      )}
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs break-words ${bubbleStyle} ${
          isClosedConversation ? 'shadow-sm border border-gray-100' : 'shadow-md'
        }`}
      >
        {message}
        {isClosedConversation && (
          <div className="text-xs mt-1 inline-flex items-center">
            <span className={`${isFromCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
              (archived)
            </span>
          </div>
        )}
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