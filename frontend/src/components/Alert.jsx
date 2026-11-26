import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const variants = {
    success: {
      wrapper: 'bg-[#EEF7F2] text-[#0F4C3A] border-[#C6E2D5]',
      icon: CheckCircle2,
    },
    error: {
      wrapper: 'bg-[#FDF2F0] text-[#9A2E1B] border-[#F3C8BF]',
      icon: AlertCircle,
    },
    warning: {
      wrapper: 'bg-[#FDF8EC] text-[#8A5311] border-[#F1DCB0]',
      icon: AlertTriangle,
    },
    info: {
      wrapper: 'bg-[#F0F5F9] text-[#1E4A6E] border-[#C7DBE9]',
      icon: Info,
    },
  };

  const current = variants[type] || variants.info;
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={`rounded-xl px-4 py-3.5 mb-4 border flex items-start justify-between gap-3 ${current.wrapper}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
        <span className="text-sm font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="p-0.5 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
