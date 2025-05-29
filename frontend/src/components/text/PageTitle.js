import React from 'react';
function PageTitle({ title, subtitle, className = '', titleColor = 'gray', subtitleColor = 'gray', center = true, ...props }) {
  const titleClasses = `text-3xl md:text-4xl font-bold ${titleColor === 'gray' ? 'text-gray-800' : `text-${titleColor}-800`} ${center ? 'text-center' : ''} mb-1`;
  const subtitleClasses = `${subtitle ? 'text-base md:text-lg' : ''} ${subtitleColor === 'gray' ? 'text-gray-600' : `text-${subtitleColor}-600`} ${center ? 'text-center' : ''} mb-6 md:mb-8`;

  return (
    <div className={`${className}`} {...props}>
      <h1 className={titleClasses}>
        {title}
      </h1>
      {subtitle && (
        <p className={subtitleClasses}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default PageTitle;
