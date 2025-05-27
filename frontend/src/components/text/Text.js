import React from 'react';

function Text({ children, className = '', color = 'gray', size = 'base', weight = 'normal', center = false, ...props }) {
  // weight variants
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
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
    blue: 'text-blue-600',
    'blue-dark': 'text-blue-700',
    'blue-darker': 'text-blue-800',
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
