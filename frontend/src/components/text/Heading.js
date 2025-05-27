import React from 'react';
function Heading({ level = 1, children, className = '', color = 'gray', center = false, ...props }) {
  const baseClasses = 'font-bold';
  
  // size classes based on heading level
  const sizeClasses = {
    1: 'text-3xl md:text-4xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  };

  // color variants
  const colorClasses = {
    gray: 'text-gray-800',
    blue: 'text-blue-800',
    white: 'text-white',
    yellow: 'text-yellow-800',
    purple: 'text-purple-800',
    green: 'text-green-800',
    red: 'text-red-800'
  };

  const centerClass = center ? 'text-center' : '';
  
  const combinedClassName = `${baseClasses} ${sizeClasses[level]} ${colorClasses[color]} ${centerClass} ${className}`.trim();

  const Tag = `h${level}`;

  return (
    <Tag className={combinedClassName} {...props}>
      {children}
    </Tag>
  );
}

export default Heading;
