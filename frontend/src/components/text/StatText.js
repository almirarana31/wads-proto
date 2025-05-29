import React from 'react';

function StatText({ value, label, className = '', valueColor = 'gray-darker', labelColor = 'gray', size = 'large', ...props }) {
  // size variants
  const sizeVariants = {
    small: {
      value: 'text-2xl font-bold',
      label: 'text-sm font-medium'
    },
    medium: {
      value: 'text-3xl font-bold',
      label: 'text-base font-semibold'
    },
    large: {
      value: 'text-4xl font-bold',
      label: 'text-xl font-semibold'
    }
  };

  // color variants for values
  const valueColorClasses = {
    'gray': 'text-gray-600',
    'gray-dark': 'text-gray-700',
    'gray-darker': 'text-gray-800',
    'blue': 'text-blue-600',
    'blue-dark': 'text-blue-700',
    'yellow': 'text-yellow-700',
    'purple': 'text-purple-700',
    'green': 'text-green-700',
    'red': 'text-red-700',
    'white': 'text-white'
  };

  // color variants for labels
  const labelColorClasses = {
    'gray': 'text-gray-600',
    'gray-dark': 'text-gray-700',
    'gray-darker': 'text-gray-800',
    'blue': 'text-blue-800',
    'yellow': 'text-yellow-800',
    'purple': 'text-purple-800',
    'green': 'text-green-800',
    'red': 'text-red-800',
    'white': 'text-white'
  };

  const valueClasses = `${sizeVariants[size].value} ${valueColorClasses[valueColor]}`;
  const labelClasses = `${sizeVariants[size].label} ${labelColorClasses[labelColor]} mb-1`;

  return (
    <div className={`text-center ${className}`} {...props}>
      <h3 className={labelClasses}>{label}</h3>
      <p className={valueClasses}>{value}</p>
    </div>
  );
}

export default StatText;
