import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message, type = 'info' }) => {
    const id = idCounter += 1;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] space-y-3 flex flex-col items-end pointer-events-none">
        {toasts.map((toast) => {
          const base =
            'max-w-sm w-max px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-3 transform transition-all duration-300 animate-slide-up pointer-events-auto';
            
          let cls = 'bg-white border-blue-100 text-blue-900 shadow-blue-900/5';
          let Icon = Info;
          let iconColor = 'text-blue-500';
          
          if (toast.type === 'success') {
             cls = 'bg-white border-green-100 text-green-900 shadow-green-900/5';
             Icon = CheckCircle2;
             iconColor = 'text-green-500';
          }
          if (toast.type === 'error') {
             cls = 'bg-white border-red-100 text-red-900 shadow-red-900/5';
             Icon = AlertCircle;
             iconColor = 'text-red-500';
          }
          
          return (
            <div key={toast.id} className={base + ' ' + cls}>
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <span className="leading-tight">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

