import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-7 w-7 border-2',
    large: 'h-11 w-11 border-[2.5px]',
  };

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div
        className={`animate-spin rounded-full border-[#D4D0C5] border-t-[#0F4C3A] ${
          sizeClasses[size] || sizeClasses.medium
        }`}
      />
      {text && (
        <p className="mt-2.5 text-xs font-medium tracking-wide uppercase text-[#4E5B55]">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
