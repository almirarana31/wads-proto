import React from 'react';

/**
 * Standardized small text component for meta information, timestamps, etc.
 * Uses smaller font sizes and lighter colors
 */
function SmallText({ children, className = '', color = 'gray-medium', size = 'sm', weight = 'normal', center = false, ...props }) {
  // Weight variants
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold'
  };

  // Size variants (typically smaller)
  const sizeClasses = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base'
  };

  // Color variants for small/meta text
  const colorClasses = {
    'gray-light': 'text-gray-400',
    'gray-medium': 'text-gray-500',
    'gray': 'text-gray-600',
    'gray-dark': 'text-gray-700',
    'blue': 'text-blue-600',
    'blue-dark': 'text-blue-700',
    'green': 'text-green-600',
    'red': 'text-red-600',
    'yellow': 'text-yellow-600',
    'purple': 'text-purple-600',
    'white': 'text-white'
  };

  const centerClass = center ? 'text-center' : '';
  
  const combinedClassName = `${weightClasses[weight]} ${sizeClasses[size]} ${colorClasses[color]} ${centerClass} ${className}`.trim();

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  );
}

export default SmallText;
