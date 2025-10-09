import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  const baseClasses = 'rounded-md p-4 mb-4';
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200'
  };

  const iconClasses = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ'
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex justify-between items-start">
        <div className="flex">
          <span className="mr-2 font-bold">{iconClasses[type]}</span>
          <span className="text-sm">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;