import React from 'react';

function Label({ children, className = '', color = 'blue', size = 'base', weight = 'normal', required = false, htmlFor, ...props }) {
  // weight variants
  const weightClasses = {
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
    'lg': 'text-lg'
  };

  // color variants
  const colorClasses = {
    blue: 'text-blue-700',
    gray: 'text-gray-700',
    'gray-dark': 'text-gray-800',
    'gray-medium': 'text-gray-600',
    red: 'text-red-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    purple: 'text-purple-700'
  };

  const baseClasses = 'block mb-2';
  
  const combinedClassName = `${baseClasses} ${weightClasses[weight]} ${sizeClasses[size]} ${colorClasses[color]} ${className}`.trim();

  return (
    <label className={combinedClassName} htmlFor={htmlFor} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default Label;
