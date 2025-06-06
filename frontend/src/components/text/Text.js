import React from 'react';

function Text({ children, className = '', color = 'gray', size = 'base', weight = 'normal', center = false, ...props }) {
  // weight variants with montserrat font
  const weightClasses = {
    light: 'font-light font-montserrat',
    normal: 'font-normal font-montserrat',
    medium: 'font-medium font-montserrat',
    semibold: 'font-semibold font-montserrat',
    bold: 'font-bold font-montserrat'
  };

  // size variants
  const sizeClasses = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  // color variants
  const colorClasses = {
    gray: 'text-gray-600',
    'gray-dark': 'text-gray-700',
    'gray-darker': 'text-gray-800',
    blue: 'text-bianca-primary',
    'blue-dark': 'text-bianca-primary',
    'blue-darker': 'text-bianca-primary',
    white: 'text-white',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    'gray-light': 'text-gray-400',
    'gray-lighter': 'text-gray-500'
  };

  const centerClass = center ? 'text-center' : '';
  
  const combinedClassName = `${weightClasses[weight]} ${sizeClasses[size]} ${colorClasses[color]} ${centerClass} ${className}`.trim();

  return (
    <p className={combinedClassName} {...props}>
      {children}
    </p>
  );
}

export default Text;
