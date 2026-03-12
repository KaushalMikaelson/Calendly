import React from 'react';

const base =
  'inline-flex items-center justify-center font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform active:scale-95';

const variants = {
  primary: 'bg-blue-primary hover:bg-blue-600 text-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5 border border-transparent',
  secondary:
    'bg-white text-text-primary border border-border hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 hover:shadow-md shadow-sm',
  danger: 'bg-danger/90 hover:bg-danger text-white shadow-sm hover:shadow-md border border-transparent hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-gray-100 hover:text-text-primary',
};

const sizes = {
  sm: 'h-8 px-4 text-xs rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
};

function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
  );
}

const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, children, className = '', ...props },
  ref
) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return (
    <button ref={ref} type="button" className={cls} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;


