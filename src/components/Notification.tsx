"use client";

import { useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Notification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close
    const autoClose = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        bg-black/80 backdrop-blur-sm border rounded-xl p-4
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColors()}
        shadow-2xl
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm mb-1">
            {title}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {message}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors ml-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
