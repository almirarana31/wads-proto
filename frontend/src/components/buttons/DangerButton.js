import React from 'react';
import PropTypes from 'prop-types';

const DangerButton = ({ children, onClick, fullWidth, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 bg-red-600 text-white rounded-md
        hover:bg-red-700 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

DangerButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default DangerButton;
