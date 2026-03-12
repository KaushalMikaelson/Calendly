import React, { useEffect } from 'react';

function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-text-primary/10 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl border border-border shadow-modal max-w-md w-full p-8 transform transition-all duration-300 animate-slide-up">
        {title && <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-3">{title}</h2>}
        <div className="mb-8">{children}</div>
        {footer && <div className="flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;

