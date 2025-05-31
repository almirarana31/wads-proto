import React from 'react';
import PropTypes from 'prop-types';

const SecondaryButton = ({ children, onClick, fullWidth, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}      className={`
        px-4 py-2 bg-white border border-bianca-primary text-bianca-primary rounded-md
        hover:bg-bianca-primary hover:text-white transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

SecondaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default SecondaryButton;
