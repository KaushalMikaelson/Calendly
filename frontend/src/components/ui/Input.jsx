import React from 'react';

function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-bold text-text-primary mb-1">{label}</label>}
      <input
        className={`w-full h-11 px-4 text-[15px] font-medium rounded-2xl border bg-white/70 backdrop-blur-sm text-text-primary placeholder:text-text-muted transition-all duration-300 focus:outline-none focus:bg-white hover:shadow-sm focus:shadow-md ${
          error
            ? 'border-danger focus:border-danger focus:ring-4 focus:ring-red-100/50 hover:border-danger'
            : 'border-border hover:border-gray-300 focus:border-blue-primary focus:ring-4 focus:ring-blue-primary/20'
        }`}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-danger mt-1 animate-fade-in">{error}</p>}
    </div>
  );
}

export default Input;

