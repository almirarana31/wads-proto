import React from 'react';

function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;  
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
      <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-2 sm:mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4">{title}</h3>
          <div className="mb-3 sm:mb-4">
            {children}
          </div>
          <div className="flex justify-end gap-2 sm:gap-3">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
