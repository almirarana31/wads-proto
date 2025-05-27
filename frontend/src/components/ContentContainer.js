import React from 'react';

function ContentContainer({ children }) {
  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ContentContainer;