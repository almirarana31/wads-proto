import React from 'react';
import Modal from './Modal';
import PrimaryButton from './buttons/PrimaryButton';
import { Text } from './text';

/**
 * A modal component for displaying success messages
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call to close the modal
 * @param {string} props.title - The modal title
 * @param {string} props.message - The success message to display
 * @param {string} props.buttonText - Text for the button (defaults to "Got it")
 */
function SuccessModal({ isOpen, onClose, title, message, buttonText = "Got it" }) {
  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      actions={
        <PrimaryButton onClick={onClose} className="w-full">
          {buttonText}
        </PrimaryButton>
      }
    >
      <div className="flex flex-col items-center justify-center py-4">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        {/* Success message */}
        <Text size="lg" weight="medium" className="text-center">
          {message}
        </Text>
      </div>
    </Modal>
  );
}

export default SuccessModal;
