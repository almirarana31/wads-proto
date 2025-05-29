import React from 'react';
import PropTypes from 'prop-types';

const SuccessButton = ({ children, onClick, fullWidth, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

SuccessButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default SuccessButton;
