import React from 'react';

function Subheading({ children, className = '', color = 'blue', size = 'xl', center = false, ...props }) {
  const baseClasses = 'font-semibold font-playfair';
  
  // size variants
  const sizeClasses = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl'
  };
  // color variants
  const colorClasses = {
    blue: 'text-bianca-primary',
    gray: 'text-gray-700',
    yellow: 'text-yellow-800',
    purple: 'text-purple-800',
    green: 'text-green-800',
    red: 'text-red-800',
    white: 'text-white'
  };

  const centerClass = center ? 'text-center' : '';
  
  const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${colorClasses[color]} ${centerClass} ${className}`.trim();

  return (
    <h3 className={combinedClassName} {...props}>
      {children}
    </h3>
  );
}

export default Subheading;
