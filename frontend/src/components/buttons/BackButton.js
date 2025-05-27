import React from 'react';
import PropTypes from 'prop-types';

const BackButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-20 h-10 bg-blue-800 hover:bg-blue-900 
        text-white rounded-xl flex items-center 
        justify-center shadow-md text-sm 
        whitespace-nowrap transition-colors
        ${className}
      `}
    >
      ← Back
    </button>
  );
};

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default BackButton;
