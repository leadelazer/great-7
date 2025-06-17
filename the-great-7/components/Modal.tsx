import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        className={`bg-brand-bg-light dark:bg-brand-bg-dark border border-brand-border-light dark:border-brand-border-dark rounded-lg shadow-xl ${sizeClasses[size]} w-full transform transition-all animate-slide-in-up max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-brand-border-light dark:border-brand-border-dark">
          <h3 id="modal-title" className="text-lg font-sans font-medium text-brand-text-light dark:text-brand-text-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-brand-text-muted-light hover:text-brand-text-light dark:text-brand-text-muted-dark dark:hover:text-brand-text-dark p-1 rounded-full hover:bg-brand-card-light dark:hover:bg-brand-card-dark transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;