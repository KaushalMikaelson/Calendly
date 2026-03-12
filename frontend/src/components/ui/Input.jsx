import React from 'react';

function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-semibold text-text-primary">{label}</label>}
      <input
        className={`w-full h-11 px-4 text-base font-medium rounded-xl border bg-white text-text-primary placeholder:text-text-muted transition-all duration-fast focus:outline-none focus:ring-4 ${
          error
            ? 'border-danger focus:border-danger focus:ring-red-100 hover:border-danger'
            : 'border-border hover:border-gray-400 focus:border-blue-primary focus:ring-blue-100'
        }`}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-danger mt-1 animate-fade-in">{error}</p>}
    </div>
  );
}

export default Input;

