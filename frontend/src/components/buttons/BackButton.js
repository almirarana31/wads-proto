import React from 'react';
import PropTypes from 'prop-types';

const BackButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}      className={`
        px-4 py-2 bg-bianca-primary text-white rounded-md
        hover:bg-bianca-primary/80 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
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
