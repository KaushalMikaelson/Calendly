import React from 'react';

function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100 shadow-sm ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;

