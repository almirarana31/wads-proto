import React from 'react';

function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{title}</h3>
          <div className="mb-4">
            {children}
          </div>
          <div className="flex justify-end gap-3">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
